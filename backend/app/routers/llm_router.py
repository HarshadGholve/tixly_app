"""
LLM Router — Toggle and status endpoints for the KB provider.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.kb_service import KnowledgeBaseService
from app.services.llm_service import is_llm_configured

router = APIRouter()


class LLMToggleRequest(BaseModel):
    mode: str  # "mock" or "llm"


@router.get("/status")
async def get_llm_status():
    """Returns current LLM mode, provider name, and whether LLM is configured."""
    return {
        "mode": KnowledgeBaseService.get_current_mode(),
        "provider": KnowledgeBaseService.get_provider_name(),
        "llm_configured": is_llm_configured(),
    }


@router.post("/toggle")
async def toggle_llm_mode(payload: LLMToggleRequest):
    """Switch between 'mock' and 'llm' KB providers at runtime."""
    if payload.mode not in ("mock", "llm"):
        return {"error": "Invalid mode. Use 'mock' or 'llm'.", "mode": KnowledgeBaseService.get_current_mode()}

    new_mode = KnowledgeBaseService.toggle_provider(payload.mode)
    return {
        "mode": new_mode,
        "provider": KnowledgeBaseService.get_provider_name(),
        "message": f"Provider switched to {new_mode} mode",
    }
