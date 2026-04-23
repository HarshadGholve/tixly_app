import uuid
from app.data.mock_db import db, save_db
from app.services.kb_service import KnowledgeBaseService
from app.services.ticket_service import TicketService
from app.services import llm_service

class BotService:
    @staticmethod
    def process_message(user_id: str, chat_id: str | None, message: str) -> dict:
        # Initialize chat session if new
        if not chat_id or chat_id not in db["chats"]:
            chat_id = chat_id or str(uuid.uuid4())
            db["chats"][chat_id] = {"history": [], "failed_attempts": 0}

        session = db["chats"][chat_id]
        session["history"].append({"role": "user", "content": message})

        reply = ""
        requires_confirmation = False
        extracted_info = {}
        suggestions = []
        ticket_id = None  # Track created ticket ID for popup

        # Check for User Feedback (Yes/No)
        user_text = message.lower().strip()
        is_no = user_text == 'no'
        is_yes = user_text == 'yes'

        # ── LLM Intelligence: dynamic extraction ──
        analysis = llm_service.analyze_ticket(message, "")
        if analysis.get("category") and analysis["category"] != "General":
            extracted_info = {
                "category": analysis["category"],
                "system": analysis.get("suggested_subject", "General System")[:30],
                "priority": _map_priority_label(analysis.get("priority", "P3 - MEDIUM")),
                "environment": "Auto-detected",
            }

        if is_yes:
            reply = "Great! I'm glad I could help. Closing this chat."
            session["failed_attempts"] = 0
            
        elif is_no:
            session["failed_attempts"] += 1
            
            # ESCALATION PROTOCOL: 2 Failed Attempts
            if session["failed_attempts"] >= 2:
                ticket = TicketService.create_ticket(user_id, 'Escalated', session["history"])
                ticket_id = ticket["id"]
                assignee_name = ticket.get("assignee", {}).get("name", "an IT technician")
                reply = (
                    f"I apologize, but I am unable to resolve this. I have escalated this to our human IT team.\n\n"
                    f"📋 **Ticket Created: {ticket['id']}**\n"
                    f"• Priority: {ticket.get('priority', 'P3 - MEDIUM')}\n"
                    f"• Category: {ticket.get('category', 'General')}\n"
                    f"• Assigned to: {assignee_name}\n\n"
                    f"[View Ticket →](/tickets/{ticket['id']})"
                )
            else:
                reply = "I'm sorry that didn't work. Could you provide a bit more detail about the error?"
                
        elif "escalate" in user_text:
            ticket = TicketService.create_ticket(user_id, 'Escalated', session["history"])
            ticket_id = ticket["id"]
            assignee_name = ticket.get("assignee", {}).get("name", "an IT technician")
            reply = (
                f"I have escalated this to our human IT team.\n\n"
                f"📋 **Ticket Created: {ticket['id']}**\n"
                f"• Priority: {ticket.get('priority', 'P3 - MEDIUM')}\n"
                f"• Category: {ticket.get('category', 'General')}\n"
                f"• Assigned to: {assignee_name}\n\n"
                f"[View Ticket →](/tickets/{ticket['id']})"
            )
            session["failed_attempts"] = 0
            extracted_info = {
                "category": ticket.get("category", "Escalated"),
                "system": "General",
                "priority": _map_priority_label(ticket.get("priority", "P3 - MEDIUM")),
                "environment": "—",
            }

        else:
            # Normal KB Search Flow
            solution = KnowledgeBaseService.search(message)
            if solution:
                if KnowledgeBaseService.get_current_mode() == "llm":
                    reply = solution
                else:
                    reply = f"{solution}\n\nDid this resolve your issue? (Yes/No)"
                    requires_confirmation = True
            else:
                reply = "I couldn't find a direct fix for that. Could you try rephrasing your issue?"

        session["history"].append({"role": "bot", "content": reply})
        save_db()

        return {
            "chat_id": chat_id,
            "reply": reply,
            "requires_confirmation": requires_confirmation,
            "failed_attempts": session["failed_attempts"],
            "extracted_info": extracted_info or None,
            "suggestions": suggestions,
            "ticket_id": ticket_id,
        }


def _map_priority_label(priority_str: str) -> str:
    """Convert 'P1 - CRITICAL' format to 'Critical' for UI display."""
    mapping = {
        "P1 - CRITICAL": "Critical",
        "P2 - HIGH": "High",
        "P3 - MEDIUM": "Medium",
        "P4 - LOW": "Low",
    }
    return mapping.get(priority_str, "Medium")