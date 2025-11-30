from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from ..database import get_db_connection
from ..security import verify_password, get_password_hash, create_access_token, Token, get_current_user, TokenData
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Create new user
        user_id = uuid.uuid4()
        hashed_password = get_password_hash(user.password)
        
        cur.execute(
            "INSERT INTO users (id, email, hashed_password, full_name) VALUES (%s, %s, %s, %s) RETURNING id, email, full_name",
            (str(user_id), user.email, hashed_password, user.full_name)
        )
        
        new_user = cur.fetchone()
        conn.commit()
        
        return {
            "id": new_user[0],
            "email": new_user[1],
            "full_name": new_user[2]
        }
        
    except Exception as e:
        conn.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=Token)
async def login(form_data: LoginRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT email, hashed_password FROM users WHERE email = %s", (form_data.email,))
        user = cur.fetchone()
        
        if not user or not verify_password(form_data.password, user[1]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user[0]}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    finally:
        cur.close()
        conn.close()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: TokenData = Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id, email, full_name FROM users WHERE email = %s", (current_user.email,))
        user = cur.fetchone()
        
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "id": user[0],
            "email": user[1],
            "full_name": user[2]
        }
    finally:
        cur.close()
        conn.close()
