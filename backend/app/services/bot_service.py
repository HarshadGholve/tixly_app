import uuid
from app.data.mock_db import db, save_db
from app.services.kb_service import KnowledgeBaseService
from app.services.ticket_service import TicketService

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

        # Check for User Feedback (Yes/No)
        user_text = message.lower().strip()
        is_no = user_text == 'no'
        is_yes = user_text == 'yes'

        # Regex Extraction mapping
        if "vpn" in user_text or "network" in user_text:
            extracted_info = {"category": "Network", "system": "Cisco VPN", "priority": "High", "environment": "Remote"}
        elif "password" in user_text or "login" in user_text:
            extracted_info = {"category": "Access", "system": "Active Directory", "priority": "Medium", "environment": "Global"}
        elif "printer" in user_text:
            extracted_info = {"category": "Hardware", "system": "Office Printer", "priority": "Low", "environment": "Corp Office"}
        elif "figma" in user_text or "software" in user_text:
            extracted_info = {"category": "Software", "system": "Software Catalog", "priority": "Low", "environment": "Local Machine"}

        if is_yes:
            reply = "Great! I'm glad I could help. Closing this chat."
            session["failed_attempts"] = 0
            
        elif is_no:
            session["failed_attempts"] += 1
            
            # ESCALATION PROTOCOL: 2 Failed Attempts
            if session["failed_attempts"] >= 2:
                ticket = TicketService.create_ticket(user_id, 'Escalated', session["history"])
                reply = f"I apologize, but I am unable to resolve this. I have escalated this to our human IT team. Your ticket ID is **{ticket['id']}**."
            else:
                reply = "I'm sorry that didn't work. Could you provide a bit more detail about the error?"
                
        elif user_text == "escalate to human" or "escalate" in user_text:
            ticket = TicketService.create_ticket(user_id, 'Escalated', session["history"])
            reply = f"I apologize, but I am unable to resolve this. I have escalated this to our human IT team. Your ticket ID is **{ticket['id']}**."
            session["failed_attempts"] = 0
            extracted_info = {"category": "Escalated", "system": "General", "priority": "High", "environment": "—"}

        else:
            # Normal KB Search Flow
            solution = KnowledgeBaseService.search(message)
            if solution:
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
            "suggestions": suggestions
        }