import random
from datetime import datetime
from app.data.mock_db import db, save_db
from app.services import llm_service


class TicketService:
    @staticmethod
    def create_ticket(user_id: str, category: str, history: list) -> dict:
        ticket_id = f"TK-{random.randint(1000, 9999)}"

        # Build text from history for LLM analysis
        text_input = " ".join([m.get("content", "") for m in history if m.get("role") == "user"])

        # ── LLM Intelligence: analyze ticket ──
        analysis = llm_service.analyze_ticket(text_input, "")
        smart_priority = analysis.get("priority", "P3 - MEDIUM")
        smart_category = analysis.get("category", category)
        smart_subject = analysis.get("suggested_subject", "IT Support Request")
        
        # ── LLM Intelligence: generate clean subject from chat ──
        if history and len(history) > 1:
            summary_subject = llm_service.generate_ticket_summary(history)
            if summary_subject and summary_subject != "IT Support Request":
                smart_subject = summary_subject

        # ── LLM Intelligence: auto-assign technician ──
        technicians = [u for u in db["users"] if u.get("role") == "Technician"]
        ticket_info = {
            "category": smart_category,
            "priority": smart_priority,
            "subject": smart_subject,
        }
        best_tech = llm_service.match_technician(ticket_info, technicians)

        new_ticket = {
            "id": ticket_id,
            "user_id": user_id,
            "subject": smart_subject,
            "category": smart_category,
            "status": "Open",
            "priority": smart_priority,
            "history": history,  # Attach chat transcript
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "llm_analysis": {
                "sentiment": analysis.get("sentiment", "neutral"),
                "urgency_score": analysis.get("urgency_score", 5),
            },
        }

        # Embed technician assignment
        if best_tech:
            new_ticket["assignee_id"] = best_tech["id"]
            new_ticket["assignee"] = {
                "id": best_tech["id"],
                "name": best_tech["name"],
                "email": best_tech.get("email", ""),
                "role": best_tech.get("role", "Technician"),
            }

        db["tickets"].append(new_ticket)
        save_db()
        print(f"[SYSTEM] Ticket {ticket_id} created | Cat={smart_category} | Pri={smart_priority} | Assigned={best_tech['name'] if best_tech else 'Unassigned'}")
        return new_ticket

    @staticmethod
    def get_user_tickets(user_id: str) -> list:
        return [t for t in db["tickets"] if t["user_id"] == user_id]

    @staticmethod
    def get_technician_tickets(tech_id: str) -> list:
        """Get all tickets assigned to a specific technician."""
        return [t for t in db["tickets"] if t.get("assignee_id") == tech_id]