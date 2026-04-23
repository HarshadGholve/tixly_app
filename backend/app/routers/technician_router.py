"""
Technician Router — Dashboard, tickets, and profile APIs for technicians.
"""
from fastapi import APIRouter, HTTPException, Header
from app.data.mock_db import db, save_db
from app.schemas.payloads import TechnicianTicketUpdateRequest
from datetime import datetime

router = APIRouter()


def _get_technician(user_id: str):
    """Helper to fetch and validate a technician user."""
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("role") != "Technician":
        raise HTTPException(status_code=403, detail="Access denied. Technician role required.")
    return user


@router.get("/dashboard")
async def get_technician_dashboard(user_id: str = Header(default="a2", alias="x-user-id")):
    """Returns metrics specific to the logged-in technician."""
    tech = _get_technician(user_id)
    assigned = [t for t in db["tickets"] if t.get("assignee_id") == user_id]

    open_count = len([t for t in assigned if t["status"] == "Open"])
    in_progress = len([t for t in assigned if t["status"] == "In Progress"])
    resolved = len([t for t in assigned if t["status"] == "Resolved"])
    total = len(assigned)

    # Count high priority
    high_priority = len([
        t for t in assigned
        if t["status"] in ["Open", "In Progress"]
        and ("CRITICAL" in t.get("priority", "").upper() or "HIGH" in t.get("priority", "").upper())
    ])

    return {
        "technician": {
            "id": tech["id"],
            "name": tech["name"],
            "email": tech.get("email", ""),
            "skills": tech.get("skills", []),
        },
        "metrics": {
            "total_assigned": total,
            "open": open_count,
            "in_progress": in_progress,
            "resolved": resolved,
            "high_priority": high_priority,
            "resolution_rate": round((resolved / max(total, 1)) * 100, 1),
            "avg_resolution_time": "1h 45m",  # Would calculate from real timestamps
        },
    }


@router.get("/tickets")
async def get_technician_tickets(user_id: str = Header(default="a2", alias="x-user-id")):
    """Returns all tickets assigned to this technician."""
    _get_technician(user_id)
    tickets = [t for t in db["tickets"] if t.get("assignee_id") == user_id]
    # Sort by priority (P1 first) then by created_at
    priority_order = {"P1 - CRITICAL": 0, "P2 - HIGH": 1, "P3 - MEDIUM": 2, "P4 - LOW": 3}
    tickets.sort(key=lambda t: (
        priority_order.get(t.get("priority", "P4 - LOW"), 4),
        t.get("created_at", ""),
    ))
    return {"tickets": tickets, "total_count": len(tickets)}


@router.patch("/tickets/{ticket_id}")
async def update_technician_ticket(
    ticket_id: str,
    payload: TechnicianTicketUpdateRequest,
    user_id: str = Header(default="a2", alias="x-user-id"),
):
    """Technician can update ticket status and add notes."""
    _get_technician(user_id)

    for t in db["tickets"]:
        if t["id"] == ticket_id and t.get("assignee_id") == user_id:
            if payload.status is not None:
                t["status"] = payload.status
                t["updated_at"] = datetime.now().isoformat()
            if payload.notes is not None:
                if "tech_notes" not in t:
                    t["tech_notes"] = []
                t["tech_notes"].append({
                    "author": user_id,
                    "content": payload.notes,
                    "timestamp": datetime.now().isoformat(),
                })
            save_db()
            return {"success": True, "updatedTicket": t}

    raise HTTPException(status_code=404, detail="Ticket not found or not assigned to you")


@router.get("/profile")
async def get_technician_profile(user_id: str = Header(default="a2", alias="x-user-id")):
    """Extended profile with skills and performance stats."""
    tech = _get_technician(user_id)
    assigned = [t for t in db["tickets"] if t.get("assignee_id") == user_id]
    resolved = [t for t in assigned if t["status"] == "Resolved"]

    return {
        "id": tech["id"],
        "name": tech["name"],
        "email": tech.get("email", ""),
        "role": tech["role"],
        "skills": tech.get("skills", []),
        "performance": {
            "total_handled": len(assigned),
            "resolved": len(resolved),
            "resolution_rate": round((len(resolved) / max(len(assigned), 1)) * 100, 1),
            "current_load": len([t for t in assigned if t["status"] in ["Open", "In Progress"]]),
        },
    }
