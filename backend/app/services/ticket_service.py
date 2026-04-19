import random
from datetime import datetime
from app.data.mock_db import db, save_db

class TicketService:
    @staticmethod
    def create_ticket(user_id: str, category: str, history: list) -> dict:
        ticket_id = f"TK-{random.randint(1000, 9999)}"
        
        new_ticket = {
            "id": ticket_id,
            "user_id": user_id,
            "subject": "Auto-Escalated Support Ticket",
            "category": category,
            "status": "Open",
            "priority": "P3 - MEDIUM",
            "history": history,  # Attach chat transcript
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        db["tickets"].append(new_ticket)
        save_db()
        print(f"[SYSTEM] Ticket {ticket_id} Created via Escalation.")
        return new_ticket

    @staticmethod
    def get_user_tickets(user_id: str) -> list:
        return [t for t in db["tickets"] if t["user_id"] == user_id]