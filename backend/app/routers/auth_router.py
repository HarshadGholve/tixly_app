import uuid
import os
import httpx
from fastapi import APIRouter, HTTPException, Header, Request
from fastapi.responses import RedirectResponse
from app.data.mock_db import db, save_db
from app.schemas.payloads import (
    UserRegisterRequest, 
    UserLoginRequest, 
    GoogleAuthRequest, 
    ForgotPasswordRequest
)

from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

@router.post("/register", status_code=201)
async def register_user(payload: UserRegisterRequest):
    """Handles the 'Create Account' form from the Sign Up UI"""
    
    # 1. Check if email already exists
    existing_user = next((u for u in db["users"] if u["email"] == payload.email), None)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    # 2. Create new user (Role is 'User' by default per your UI note)
    new_user_id = f"u-{str(uuid.uuid4())[:8]}"
    new_user = {
        "id": new_user_id,
        "name": payload.full_name,
        "email": payload.email,
        "organization": payload.organization,
        "role": "User", 
        "password": payload.password # In a real app, ALWAYS hash this! (e.g., bcrypt)
    }
    
    db["users"].append(new_user)
    save_db()
    
    # 3. Return a fake JWT token and user info
    return {
        "message": "Account created successfully",
        "token": f"fake-jwt-token-for-{new_user_id}",
        "user": {k: v for k, v in new_user.items() if k != "password"} # Don't send password back!
    }


@router.post("/login")
async def login_user(payload: UserLoginRequest):
    """Handles standard Email/Password login"""
    user = next((u for u in db["users"] if u["email"] == payload.email), None)
    
    # For our mock DB, existing users don't have passwords, so we bypass password check for them.
    # But for newly registered users, we check the password.
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    if "password" in user and user["password"] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "token": f"fake-jwt-token-for-{user['id']}", 
        "user": {k: v for k, v in user.items() if k != "password"}
    }


@router.get("/google/login")
async def google_login():
    """Generates Google OAuth URL and redirects user to Google"""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    callback_url = os.getenv("GOOGLE_CALLBACK_URL")
    
    if not client_id or not callback_url:
        raise HTTPException(status_code=500, detail="Missing Google OAuth credentials in backend")
        
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={callback_url}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile"
    )
    return RedirectResponse(url=auth_url)

@router.get("/google/callback")
async def google_callback(code: str):
    """Exchanges code for token, loads user info, and redirects back to frontend"""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    callback_url = os.getenv("GOOGLE_CALLBACK_URL")
    
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": callback_url
    }
    
    async with httpx.AsyncClient() as client:
        # Exchange code for access_token
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve Google token")
            
        token_data = response.json()
        access_token = token_data.get("access_token")
        
        # Fetch user info
        userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        user_res = await client.get(userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
        if user_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info")
            
        user_info = user_res.json()
        
    google_email = user_info.get("email")
    google_name = user_info.get("name", "Google User")

    # DB Match / Create
    user = next((u for u in db["users"] if u["email"] == google_email), None)
    if not user:
        new_user_id = f"u-{str(uuid.uuid4())[:8]}"
        user = {
            "id": new_user_id,
            "name": google_name,
            "email": google_email,
            "role": "User"
        }
        db["users"].append(user)
        save_db()

    jwt_token = f"fake-jwt-google-token-for-{user['id']}"
    
    # Redirect back to frontend
    frontend_login_url = f"http://localhost:8080/login?token={jwt_token}&userId={user['id']}"
    return RedirectResponse(url=frontend_login_url)


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    """Handles the Forgot Password link"""
    # Security Best Practice: Never reveal if the email actually exists in the DB
    # Always return a generic success message to prevent user enumeration attacks.
    return {
        "message": f"If {payload.email} is registered, a password reset link has been sent."
    }


@router.get("/me")
async def get_current_user(user_id: str = Header(default="u1", alias="x-user-id")):
    """Fetches logged-in user details to populate the profile and dashboard UI"""
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {k: v for k, v in user.items() if k != "password"}