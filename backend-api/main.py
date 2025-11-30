from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import chat, personalize, auth, rag

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Docusaurus default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(personalize.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(rag.router, prefix="/api")

@app.get("/")
def read_root():
    return {"Hello": "World"}
