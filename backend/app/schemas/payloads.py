from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

# --- AUTHENTICATION SCHEMAS ---
class UserRegisterRequest(BaseModel):
    full_name: str
    organization: str
    email: EmailStr  # Validates that it is a proper email format
    password: str
    
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    google_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# --- CHAT SCHEMAS ---
class ChatMessageRequest(BaseModel):
    message: str
    chat_id: Optional[str] = None
    user_id: Optional[str] = "u1"

class ChatMessageResponse(BaseModel):
    chat_id: str
    reply: str
    requires_confirmation: bool
    failed_attempts: int
    extracted_info: Optional[Dict[str, str]] = None
    suggestions: Optional[List[str]] = []
    ticket_id: Optional[str] = None  # For ticket popup redirect

class ChatSearchRequest(BaseModel):
    query: str
    chat_id: Optional[str] = None

# --- TICKET SCHEMAS ---
class TicketCreateRequest(BaseModel):
    subject: str
    category: Optional[str] = "General"
    description: Optional[str] = ""

class TicketResponse(BaseModel):
    id: str
    user_id: str
    subject: str
    category: str
    status: str
    priority: Optional[str] = "P3 - MEDIUM"
    assignee_id: Optional[str] = None
    assignee: Optional[Dict[str, str]] = None
    created_at: str

class TicketReplyRequest(BaseModel):
    message: str
    attachments: Optional[List[str]] = []

# --- USER / PROFILE SCHEMAS ---
class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None

class RequestElevationRequest(BaseModel):
    requested_role: str
    reason: str

# --- ADMIN SCHEMAS ---
class AdminBulkUpdateRequest(BaseModel):
    ticket_ids: List[str]
    action: str
    value: Any

class AdminUpdateTicketRequest(BaseModel):
    status: Optional[str] = None
    assignee_id: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    subject: Optional[str] = None
    category: Optional[str] = None

class AdminNoteRequest(BaseModel):
    message: str
    is_internal_note: bool = False
    files: Optional[List[str]] = []

class UpdateAutomationsRequest(BaseModel):
    rules_data: Dict[str, Any]

class TestAutoRuleRequest(BaseModel):
    test_prompt: str

class ExecuteRunbookRequest(BaseModel):
    runbook_id: str
    ticket_id: str
    params: Optional[Dict[str, Any]] = {}

class InviteUserRequest(BaseModel):
    email: EmailStr
    assigned_role: str

class UpdatePermissionsRequest(BaseModel):
    matrix_data: Dict[str, Any]

class CreateKBEntryRequest(BaseModel):
    title: str
    content: str
    tags: Optional[List[str]] = []
    script: Optional[str] = None

# --- LLM TOGGLE ---
class LLMToggleRequest(BaseModel):
    mode: str  # "mock" or "llm"

# --- ADMIN USER MANAGEMENT ---
class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    role: str  # "User", "Technician", "Admin"
    password: Optional[str] = "password123"
    skills: Optional[List[str]] = []

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None

# --- TECHNICIAN SCHEMAS ---
class TechnicianTicketUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None