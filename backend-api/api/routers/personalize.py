from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
from openai import OpenAI
from ..database import get_db_connection
from ..security import get_current_user, TokenData

router = APIRouter(
    prefix="/personalize",
    tags=["personalize"]
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
try:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
except:
    openai_client = None

class PersonalizeRequest(BaseModel):
    content: str

class PersonalizeResponse(BaseModel):
    personalized_content: str

@router.post("/", response_model=PersonalizeResponse)
async def personalize_content(
    request: PersonalizeRequest,
    current_user: TokenData = Depends(get_current_user)
):
    if not openai_client:
        raise HTTPException(status_code=503, detail="OpenAI service not configured")

    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Fetch user profile
        cur.execute(
            "SELECT full_name, hardware_bg, software_bg, robotics_exp, preferences FROM users WHERE email = %s",
            (current_user.email,)
        )
        user = cur.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User profile not found")
            
        full_name, hw_bg, sw_bg, exp, prefs = user
        
        # Construct system prompt based on profile
        system_prompt = "You are an expert tutor personalizing a textbook for a student."
        user_profile = f"Student Name: {full_name or 'Student'}\n"
        
        if hw_bg: user_profile += f"Hardware Background: {hw_bg}\n"
        if sw_bg: user_profile += f"Software Background: {sw_bg}\n"
        if exp: user_profile += f"Robotics Experience: {exp}\n"
        
        instruction = """
        Rewrite the following textbook content to be more engaging and relevant for this student.
        - Use analogies that fit their background (e.g., if they know software, explain hardware concepts using software analogies).
        - Adjust the complexity based on their experience.
        - Address them by name if possible.
        - Keep the core technical information accurate, but change the tone and examples.
        """

        completion = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Student Profile:\n{user_profile}\n\nInstruction: {instruction}\n\nContent to Rewrite:\n{request.content}"}
            ]
        )

        return {"personalized_content": completion.choices[0].message.content}

    except Exception as e:
        print(f"Personalization Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
