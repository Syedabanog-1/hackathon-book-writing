from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from typing import List, Optional
import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from openai import OpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
import glob

router = APIRouter(
    prefix="/rag",
    tags=["rag"]
)

# Configuration
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COLLECTION_NAME = "textbook_content"

# Initialize clients
# Note: In production, these should be initialized once and passed as dependencies
try:
    qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
except Exception as e:
    print(f"Warning: Failed to initialize clients: {e}")
    qdrant = None
    openai_client = None

class ChatRequest(BaseModel):
    query: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not qdrant or not openai_client:
        raise HTTPException(status_code=503, detail="RAG services not configured")

    try:
        # 1. Embed the query
        query_embedding = openai_client.embeddings.create(
            input=request.query,
            model="text-embedding-3-small"
        ).data[0].embedding

        # 2. Search Qdrant
        search_result = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=3
        )

        # 3. Construct Context
        retrieved_context = "\n\n".join([hit.payload.get("content", "") for hit in search_result])
        
        # Add user-selected context if provided
        final_context = f"Retrieved Context:\n{retrieved_context}"
        if request.context:
            final_context += f"\n\nUser Selected Context:\n{request.context}"

        # 4. Generate Answer
        completion = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant for a Physical AI and Robotics textbook. Answer the user's question based strictly on the provided context. If the answer is not in the context, say so, but try to be helpful based on general knowledge if it's relevant to the course."},
                {"role": "user", "content": f"Context:\n{final_context}\n\nQuestion: {request.query}"}
            ]
        )

        return {
            "response": completion.choices[0].message.content,
            "sources": [hit.payload.get("source", "unknown") for hit in search_result]
        }

    except Exception as e:
        print(f"RAG Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
async def ingest_content():
    """
    Ingests all markdown files from the chapter directories into Qdrant.
    WARNING: This clears the existing collection.
    """
    if not qdrant or not openai_client:
        raise HTTPException(status_code=503, detail="RAG services not configured")

    try:
        # Recreate collection
        qdrant.recreate_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)
        )

        # Find all markdown files
        # Assuming backend-api is at root/backend-api, so we go up one level
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
        md_files = glob.glob(os.path.join(root_dir, "chapter-*/*.md"))
        
        total_chunks = 0
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

        for file_path in md_files:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            chunks = text_splitter.split_text(content)
            
            for i, chunk in enumerate(chunks):
                # Embed chunk
                embedding = openai_client.embeddings.create(
                    input=chunk,
                    model="text-embedding-3-small"
                ).data[0].embedding

                # Upload to Qdrant
                qdrant.upsert(
                    collection_name=COLLECTION_NAME,
                    points=[
                        models.PointStruct(
                            id=total_chunks, # Simple incremental ID for demo
                            vector=embedding,
                            payload={
                                "content": chunk,
                                "source": os.path.basename(file_path),
                                "chunk_index": i
                            }
                        )
                    ]
                )
                total_chunks += 1

        return {"status": "success", "chunks_ingested": total_chunks}

    except Exception as e:
        print(f"Ingest Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
