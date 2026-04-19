from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all 6 routers now
from app.routers import chat_router, ticket_router, auth_router, admin_router, users_router, chats_router

# ====================================================================
# [30 SECOND SWAP DEMO] — UNCOMMENT THESE LINES TO ENABLE AZURE OPENAI
# from app.services.kb_service import KnowledgeBaseService, LLMKBProvider
# KnowledgeBaseService.set_provider(LLMKBProvider())
# ====================================================================

app = FastAPI(title="AutoFlow IT Automation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all the routes!
app.include_router(auth_router.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router.router, prefix="/api/users", tags=["Users"])
app.include_router(chat_router.router, prefix="/api/chat", tags=["Chatbot"])
app.include_router(chats_router.router, prefix="/api/chats", tags=["Chats"])
app.include_router(ticket_router.router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin Portal"])

@app.get("/", tags=["default"])
async def health_check():
    return {"status": "online", "message": "AutoFlow Backend is running."}