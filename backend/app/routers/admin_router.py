from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.data.mock_db import db, save_db
from app.schemas.payloads import (
    AdminBulkUpdateRequest, AdminUpdateTicketRequest, AdminNoteRequest,
    UpdateAutomationsRequest, TestAutoRuleRequest, ExecuteRunbookRequest,
    InviteUserRequest, UpdatePermissionsRequest, CreateKBEntryRequest
)
from datetime import datetime
import uuid

router = APIRouter()

# --- ADMIN TICKET APIs ---
@router.get("/tickets")
async def get_all_tickets():
    """Fetch all tickets for the Admin Queue"""
    return {"tickets": db["tickets"], "total_count": len(db["tickets"])}

@router.get("/tickets/{ticket_id}")
async def get_ticket_details(ticket_id: str):
    """Get full details for a specific ticket"""
    ticket = next((t for t in db["tickets"] if t["id"] == ticket_id), None)
    return ticket or {"error": "Ticket not found"}

@router.patch("/tickets/bulk")
async def bulk_update_tickets(payload: AdminBulkUpdateRequest):
    count = 0
    for t in db["tickets"]:
        if t["id"] in payload.ticket_ids:
            t[payload.action] = payload.value
            count += 1
    save_db()
    return {"success": True, "updatedCount": count}

@router.patch("/tickets/{ticket_id}")
async def update_ticket_properties(ticket_id: str, payload: AdminUpdateTicketRequest):
    """Update ticket properties (status, assignee, priority, subject, category)"""
    for t in db["tickets"]:
        if t["id"] == ticket_id:
            if payload.status is not None:
                t["status"] = payload.status
            if payload.priority is not None:
                t["priority"] = payload.priority
            if payload.subject is not None:
                t["subject"] = payload.subject
            if payload.category is not None:
                t["category"] = payload.category
            if payload.assignee_id is not None:
                # Look up the technician to embed their info
                assignee = next((u for u in db["users"] if u["id"] == payload.assignee_id), None)
                if assignee:
                    t["assignee_id"] = assignee["id"]
                    t["assignee"] = {
                        "id": assignee["id"],
                        "name": assignee["name"],
                        "email": assignee["email"],
                        "role": assignee["role"]
                    }
                else:
                    raise HTTPException(status_code=404, detail="Assignee not found")
            save_db()
            return {"success": True, "updatedTicket": t}
    raise HTTPException(status_code=404, detail="Ticket not found")

@router.delete("/tickets/{ticket_id}")
async def delete_ticket(ticket_id: str):
    """Delete a ticket by ID"""
    original_count = len(db["tickets"])
    db["tickets"] = [t for t in db["tickets"] if t["id"] != ticket_id]
    if len(db["tickets"]) == original_count:
        raise HTTPException(status_code=404, detail="Ticket not found")
    save_db()
    return {"success": True, "deletedTicketId": ticket_id}

@router.post("/tickets/{ticket_id}/notes")
async def add_admin_note(ticket_id: str, payload: AdminNoteRequest):
    """Add reply or internal note"""
    return {
        "messageId": f"note-{int(datetime.now().timestamp())}",
        "timestamp": datetime.now().isoformat(),
        "isInternalNote": payload.is_internal_note,
        "success": True
    }

# --- ADMIN ANALYTICS APIs ---
@router.get("/metrics")
async def get_dashboard_metrics():
    """Data for the top KPI cards on Admin Dashboard"""
    total = len(db["tickets"])
    resolved = len([t for t in db["tickets"] if t["status"] == "Resolved"])
    open_tickets = total - resolved
    return {
        "active_backlog": open_tickets,
        "resolved_by_it": resolved,
        "auto_resolved_bot": 1432,
        "avg_resolution_time": "2h 15m"
    }

@router.get("/metrics/trends")
async def get_resolution_trends(timeframe: str = "7d"):
    """Data for the line chart"""
    return {
        "chartData": [
            {"date": "2023-10-01", "value": 45},
            {"date": "2023-10-02", "value": 52},
            {"date": "2023-10-03", "value": 38}
        ]
    }

@router.get("/metrics/severity")
async def get_severity_distribution():
    """Data for the donut chart"""
    return {
        "pieData": [
            {"id": "P1", "label": "P1 - Critical", "value": 10},
            {"id": "P2", "label": "P2 - High", "value": 25},
            {"id": "P3", "label": "P3 - Medium", "value": 40},
            {"id": "P4", "label": "P4 - Low", "value": 25}
        ]
    }

@router.get("/metrics/backlog")
async def get_backlog_breakdown():
    """Data for backlog table"""
    return {
        "statusCounts": {"Open": 15, "In Progress": 8, "On Hold": 3},
        "avgAge": "3.5 days"
    }

# --- ADMIN USERS & ROLES APIs ---
@router.get("/users")
async def get_all_users():
    """List all users for Role Management"""
    return {"users": db["users"]}

@router.get("/technicians")
async def get_technicians():
    """List only Technician-role users for assignment dropdown"""
    technicians = [u for u in db["users"] if u.get("role") == "Technician"]
    return {"technicians": technicians}

@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, new_role: str):
    """Promote or demote a user"""
    for u in db["users"]:
        if u["id"] == user_id:
            u["role"] = new_role
            save_db()
            return {"success": True, "user": u}
    return {"error": "User not found"}

@router.post("/users/invite")
async def invite_user(payload: InviteUserRequest):
    """Send email invite to platform"""
    new_user = {
        "id": f"u-{str(uuid.uuid4())[:8]}",
        "name": "Invited User",
        "email": payload.email,
        "role": payload.assigned_role
    }
    db["users"].append(new_user)
    save_db()
    return {"success": True, "message": f"Invite sent to {payload.email}"}

@router.get("/roles/matrix")
async def get_permissions_matrix():
    """Fetch permission matrix checkboxes"""
    return {
        "roles": ["Admin", "Technician", "User"],
        "permissions": ["manage_users", "view_reports", "edit_kb", "resolve_tickets"]
    }

@router.put("/roles/matrix")
async def update_permissions_matrix(payload: UpdatePermissionsRequest):
    """Save changes to global roles"""
    return {"success": True, "message": "Permissions updated successfully"}

@router.get("/audit-logs")
async def get_activity_log(page: int = 1, limit: int = 10):
    """Fetch system user changes"""
    return {
        "logs": [
            {
                "id": f"log-{str(uuid.uuid4())[:8]}",
                "action": "User Promoted",
                "actor": "Admin System",
                "target": "David Kim",
                "date": datetime.now().isoformat()
            }
        ],
        "total": 1
    }

# --- ADMIN KNOWLEDGE BASE & AUTOMATION APIs ---
@router.get("/kb")
async def get_knowledge_base():
    """View all KB articles and Runbooks"""
    return {"kb_entries": db["kb"]}

@router.get("/automations")
async def get_automation_rules():
    """Fetch AI confidence thresholds and intent maps"""
    return {
        "confidence_thresholds": {"auto_resolve": 90, "category_assign": 75},
        "approval_gates": ["Database Restarts", "Access Provisioning"]
    }

@router.put("/automations")
async def update_automation_rules(payload: UpdateAutomationsRequest):
    """Save rule builder configuration"""
    return {"success": True, "updatedRules": payload.rules_data}

@router.post("/automations/test")
async def test_ai_rule(payload: TestAutoRuleRequest):
    """Test console for prompts"""
    return {
        "simulatedIntent": "password_reset",
        "confidence": 0.95
    }

@router.post("/runbooks/exec")
async def execute_runbook(payload: ExecuteRunbookRequest):
    """Trigger quick action"""
    return {
        "executionStatus": "completed",
        "logs": [f"Executed runbook {payload.runbook_id} for ticket {payload.ticket_id}"]
    }

@router.post("/kb")
async def add_update_kb_entry(payload: CreateKBEntryRequest):
    """Save new solution/runbook"""
    new_entry = {
         "id": f"kb-{str(uuid.uuid4())[:8]}",
         "category": "Custom",
         "keywords": payload.tags or [],
         "resolution_steps": payload.content
    }
    db["kb"].append(new_entry)
    save_db()
    return {"articleId": new_entry["id"], "success": True}