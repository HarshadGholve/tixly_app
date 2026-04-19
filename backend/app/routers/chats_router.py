from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional
from app.data.mock_db import db

router = APIRouter()

@router.get("/")
async def get_chat_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    status: Optional[str] = None,
    user_id: str = Header(default="u1", alias="x-user-id")
):
    """List past chat threads for the user."""
    # Since we have mock db chats format: { "chat_id": { "history": [], "failed_attempts": 0 } }
    # We'll just return a list based on db keys, mock filtered by user_id
    
    # In a real app we'd filter by user_id and paginate properly
    chats = []
    for chat_id, data in db["chats"].items():
        # Assuming all chats in db belong to current user for mocking
        chats.append({
            "id": chat_id,
            "preview": data["history"][0]["content"] if data["history"] else "Empty chat",
            "status": "closed",
            "message_count": len(data["history"])
        })
    
    start = (page - 1) * limit
    end = start + limit
    paginated_chats = chats[start:end]
    
    return {
        "chats": paginated_chats,
        "totalCount": len(chats),
        "page": page,
        "limit": limit
    }

@router.get("/{chat_id}")
async def get_single_chat(chat_id: str, user_id: str = Header(default="u1", alias="x-user-id")):
    """Fetch specific chat thread history."""
    if chat_id not in db["chats"]:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    chat_data = db["chats"][chat_id]
    
    return {
        "id": chat_id,
        "messages": chat_data["history"],
        "linkedTicketId": None # Mock no linked ticket
    }
