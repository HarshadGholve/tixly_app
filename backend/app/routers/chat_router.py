from fastapi import APIRouter, HTTPException, Header
from app.schemas.payloads import ChatMessageRequest, ChatMessageResponse, ChatSearchRequest
from app.data.mock_db import db
from app.services.bot_service import BotService

router = APIRouter()

@router.post("/message", response_model=ChatMessageResponse)
async def handle_chat_message(payload: ChatMessageRequest, user_id: str = Header(default="u1", alias="x-user-id")):
    try:
        response = BotService.process_message(
            user_id=user_id,
            chat_id=payload.chat_id,
            message=payload.message
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_resolution(payload: ChatSearchRequest):
    """Fetch relevant KB/Runbook solutions dynamically without full processing."""
    query_lower = payload.query.lower()
    matched = []
    
    for kb in db["kb"]:
        if any(keyword in query_lower for keyword in kb["keywords"]) or query_lower in kb["category"].lower():
            matched.append(kb)
            
    return {
        "matched": len(matched),
        "solutions": matched,
        "chat_id": payload.chat_id
    }