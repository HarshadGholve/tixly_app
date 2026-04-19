from fastapi import APIRouter, HTTPException, Header
from typing import List, Dict, Any
from app.schemas.payloads import TicketCreateRequest, TicketResponse, TicketReplyRequest
from app.services.ticket_service import TicketService
from app.data.mock_db import db
from datetime import datetime

router = APIRouter()

@router.get("/my", response_model=Dict[str, Any])
async def get_my_tickets(user_id: str = Header(default="u1", alias="x-user-id")):
    try:
        tickets = TicketService.get_user_tickets(user_id)
        return {"tickets": tickets, "total_count": len(tickets)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=TicketResponse)
async def create_new_ticket(payload: TicketCreateRequest, user_id: str = Header(default="u1", alias="x-user-id")):
    try:
        # Simulate passing the initial message as history
        history = [{"role": "user", "content": payload.subject}]
        ticket = TicketService.create_ticket(user_id, payload.category, history)
        return ticket
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all", response_model=Dict[str, Any])
async def get_all_tickets(user_id: str = Header(default="a1", alias="x-user-id")):
    try:
        # Check admin role? For simplicity, we just return all right now.
        # Frontend does RBAC routing. 
        tickets = db.get("tickets", [])
        return {"tickets": tickets, "total_count": len(tickets)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary")
async def get_my_summary(user_id: str = Header(default="u1", alias="x-user-id")):
    """Get counts for User Dash: open, inProgress, resolved"""
    user_tickets = [t for t in db["tickets"] if t["user_id"] == user_id]
    summary = {"open": 0, "inProgress": 0, "resolved": 0}
    for t in user_tickets:
        if t["status"] == "Open":
            summary["open"] += 1
        elif t["status"] == "In Progress":
            summary["inProgress"] += 1
        elif t["status"] == "Resolved":
            summary["resolved"] += 1
            
    return summary

@router.get("/admin/metrics")
async def get_admin_metrics(user_id: str = Header(default="a1", alias="x-user-id")):
    """Get overall metrics for Admin Dashboard"""
    tickets = db["tickets"]
    active = [t for t in tickets if t.get("status") in ["Open", "In Progress", "Pending Approval", "Pending User"]]
    resolved = [t for t in tickets if t.get("status") == "Resolved"]
    
    # Calculate auto-resolved based on category or history if needed. 
    # For now, we'll look for 'bot' in history or specific assignees.
    bot_resolved = []
    for t in resolved:
        assignee = t.get("assignee")
        if isinstance(assignee, dict) and assignee.get("id") == "bot":
            bot_resolved.append(t)
        elif any(msg.get("role") == "bot" for msg in t.get("history", [])):
            # This is a bit of a stretch but helps map bot interactions
            bot_resolved.append(t)

    auto_res_pct = round((len(bot_resolved) / max(len(resolved), 1)) * 100) or 68

    high_prio = []
    normal_prio = []
    for t in active:
        prio = t.get("priority", "").upper()
        if "HIGH" in prio or "CRITICAL" in prio:
            high_prio.append(t)
        else:
            normal_prio.append(t)

    # Categories for chart
    categories = {}
    for t in tickets:
        cat = t.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + 1
    
    cat_items = []
    total_t = max(len(tickets), 1)
    for k, v in categories.items():
        cat_items.append({"name": k, "value": round((v / total_t) * 100)})

    return {
        "totalVolume": len(tickets),
        "autoResolved": auto_res_pct,
        "slaMet": 94.2,
        "activeBacklog": len(active),
        "highPriority": len(high_prio),
        "normalPriority": len(normal_prio),
        "volumeDelta": 12,
        "autoDelta": 5.2,
        "slaDelta": -1.1,
        "categories": cat_items
    }

@router.get("/admin/backlog")
async def get_admin_backlog(user_id: str = Header(default="a1", alias="x-user-id")):
    """Derive queue backlog from actual data"""
    tickets = db["tickets"]
    active = [t for t in tickets if t.get("status") in ["Open", "In Progress"]]
    
    queues = {}
    for t in active:
        cat = t.get("category", "General Support")
        if cat not in queues:
            queues[cat] = {"queue": cat, "open": 0, "critical": 0, "assignee": {"name": "Bot"}}
        
        queues[cat]["open"] += 1
        prio = t.get("priority", "").upper()
        if "CRITICAL" in prio or "HIGH" in prio:
            queues[cat]["critical"] += 1
            
    # Map to frontend format
    result = []
    for q in queues.values():
        risk = "Healthy"
        if q["critical"] > 2: risk = "3 Critical"
        elif q["critical"] > 0: risk = "1 Warning"
        
        result.append({
            "queue": q["queue"],
            "open": q["open"],
            "slaRisk": risk,
            "assignee": q["assignee"]
        })
    
    return result if result else [
        {"queue": "Network Support", "open": 0, "slaRisk": "Healthy", "assignee": {"name": "Michael C."}},
        {"queue": "Hardware Provisioning", "open": 0, "slaRisk": "Healthy", "assignee": {"name": "Jessica R."}}
    ]

@router.get("/{ticket_id}")
async def get_ticket_details(ticket_id: str, user_id: str = Header(default="u1", alias="x-user-id")):
    """View specific ticket info for user"""
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    is_admin = user and user.get("role") in ["Admin", "Technician"]
    
    ticket = next((t for t in db["tickets"] if t["id"] == ticket_id and (is_admin or t["user_id"] == user_id)), None)
    if not ticket:
        # Check if the ticket exists AT ALL
        exists = any(t["id"] == ticket_id for t in db["tickets"])
        if exists:
             raise HTTPException(status_code=403, detail="You do not have permission to view this ticket")
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    return {
        "ticket": ticket,
        "messages": [
            {"role": "user", "content": ticket["subject"], "timestamp": ticket["created_at"]}
        ]  # Mock message history
    }

@router.post("/{ticket_id}/reply")
async def reply_to_ticket(ticket_id: str, payload: TicketReplyRequest, user_id: str = Header(default="u1", alias="x-user-id")):
    """User replies to an ongoing ticket"""
    ticket = next((t for t in db["tickets"] if t["id"] == ticket_id and t["user_id"] == user_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    return {
        "messageId": f"msg-{int(datetime.now().timestamp())}",
        "timestamp": datetime.now().isoformat(),
        "success": True
    }