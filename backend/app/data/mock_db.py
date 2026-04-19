from datetime import datetime, timedelta
import json
import os
from app.data.kb_data import KB_ARTICLES

DB_FILE_PATH = os.path.join(os.path.dirname(__file__), "database.json")

# Helper to generate realistic past dates
def get_past_time(minutes_ago=0, hours_ago=0, days_ago=0):
    return (datetime.now() - timedelta(minutes=minutes_ago, hours=hours_ago, days=days_ago)).isoformat()

# Simulating an initial database state
INITIAL_DB = {
    "users": [
        {"id": "u1", "name": "Elena Rodriguez", "email": "elena.r@company.com", "role": "User", "password": "password123"},
        {"id": "u2", "name": "David Kim", "email": "david.k@company.com", "role": "User", "password": "password123"},
        {"id": "u3", "name": "Stefanie Corn", "email": "s.corn@company.com", "role": "User", "password": "password123"},
        {"id": "a1", "name": "Alex System", "email": "alex.s@company.com", "role": "Admin", "password": "password123"},
        {"id": "a2", "name": "Marcus Chen", "email": "m.chen@company.com", "role": "Technician", "password": "password123"},
        {"id": "a3", "name": "Sarah Jenkins", "email": "sarah.j@company.com", "role": "Admin", "password": "password123"}
    ],
    
    "tickets": [
        {
            "id": "TK-9741", "user_id": "u3", 
            "subject": "Database Server Unresponsive - Production Cluster", 
            "category": "Infrastructure", "status": "In Progress", "priority": "P1 - CRITICAL", 
            "created_at": get_past_time(minutes_ago=45)
        },
        {
            "id": "TK-9740", "user_id": "u2", 
            "subject": "VPN Access Failed - London Office", 
            "category": "Network", "status": "Open", "priority": "P2 - HIGH", 
            "created_at": get_past_time(minutes_ago=120)
        },
        {
            "id": "TK-8939", "user_id": "u1", 
            "subject": "Laptop screen flickering in conference room B", 
            "category": "Hardware", "status": "Open", "priority": "P2 - HIGH", 
            "created_at": get_past_time(minutes_ago=10)
        },
        {
            "id": "TK-8938", "user_id": "u1", 
            "subject": "Software installation request: Figma", 
            "category": "Software", "status": "In Progress", "priority": "P3 - MEDIUM", 
            "created_at": get_past_time(hours_ago=2)
        },
        {
            "id": "TK-8944", "user_id": "u1", 
            "subject": "Node.js npm install giving EACCES permission errors", 
            "category": "Development", "status": "Open", "priority": "P3 - MEDIUM", 
            "created_at": get_past_time(minutes_ago=5)
        },
        {
            "id": "TK-8912", "user_id": "u2", 
            "subject": "Printer on 3rd floor offline", 
            "category": "Hardware", "status": "Open", "priority": "P4 - LOW", 
            "created_at": get_past_time(days_ago=1)
        },
        {
            "id": "TK-8890", "user_id": "u2", 
            "subject": "Password reset for email", 
            "category": "Access", "status": "Resolved", "priority": "P4 - LOW", 
            "created_at": get_past_time(days_ago=3)
        },
        {
            "id": "TK-8945", "user_id": "u3", 
            "subject": "Adobe Acrobat keeps crashing on startup", 
            "category": "Software", "status": "Open", "priority": "P4 - LOW", 
            "created_at": get_past_time(hours_ago=5)
        },
        {
            "id": "TK-8946", "user_id": "u1", 
            "subject": "Requesting an ergonomic wireless mouse", 
            "category": "Hardware", "status": "Resolved", "priority": "P4 - LOW", 
            "created_at": get_past_time(days_ago=5)
        },
        {
            "id": "TK-8947", "user_id": "u2", 
            "subject": "Cannot access shared Marketing Drive (Google Workspace)", 
            "category": "Access", "status": "In Progress", "priority": "P3 - MEDIUM", 
            "created_at": get_past_time(hours_ago=1)
        }
    ],
    
    "chats": {}, # Format: {"chat_id": {"history": [], "failed_attempts": 0}}
    
    "kb": KB_ARTICLES
}

# Auto-load or create the JSON database
if os.path.exists(DB_FILE_PATH):
    with open(DB_FILE_PATH, 'r') as f:
        db = json.load(f)
else:
    db = INITIAL_DB
    with open(DB_FILE_PATH, 'w') as f:
        json.dump(db, f, indent=4)

def save_db():
    with open(DB_FILE_PATH, 'w') as f:
        json.dump(db, f, indent=4)