from fastapi import APIRouter, HTTPException, Header
from app.data.mock_db import db
from app.schemas.payloads import UpdateProfileRequest, RequestElevationRequest
import uuid

router = APIRouter()

@router.patch("/profile")
async def update_profile(payload: UpdateProfileRequest, user_id: str = Header(default="u1", alias="x-user-id")):
    """Update personal info for the current user."""
    for user in db["users"]:
        if user["id"] == user_id:
            if payload.first_name:
                user["first_name"] = payload.first_name
            if payload.last_name:
                user["last_name"] = payload.last_name
            if payload.email:
                user["email"] = payload.email
            if payload.phone:
                user["phone"] = payload.phone
            if payload.avatar:
                user["avatar"] = payload.avatar
            
            return {"success": True, "updatedUser": {k: v for k, v in user.items() if k != "password"}}
            
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/request-access")
async def request_elevation(payload: RequestElevationRequest, user_id: str = Header(default="u1", alias="x-user-id")):
    """Request a higher role."""
    # In a real app, you would save this request to the DB for admin approval.
    request_id = f"req-{str(uuid.uuid4())[:8]}"
    return {
        "request_id": request_id,
        "status": "pending_approval",
        "message": f"Requested role '{payload.requested_role}' pending review."
    }
