from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all routers
from app.routers import (
    chat_router, ticket_router, auth_router, admin_router,
    users_router, chats_router, llm_router, technician_router,
)

app = FastAPI(title="AutoFlow IT Automation API", version="2.0.0")

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
app.include_router(llm_router.router, prefix="/api/llm", tags=["LLM Toggle"])
app.include_router(technician_router.router, prefix="/api/technician", tags=["Technician Portal"])

@app.get("/", tags=["default"])
async def health_check():
    return {"status": "online", "message": "AutoFlow Backend is running."}