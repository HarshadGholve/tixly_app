"""
LLM Intelligence Service — Centralized AI logic for Tixly.

Provides:
  - analyze_ticket(subject, description) → priority, category, sentiment, etc.
  - match_technician(ticket_info, technicians) → best technician ID
  - generate_ticket_summary(chat_history) → clean subject line

Each method checks for Groq availability and falls back
to keyword-based heuristics when credentials are missing.
"""
import os
import json
from dotenv import load_dotenv

load_dotenv()

# ─── Groq Client (lazy init) ────────────────────────
_client = None
_deployment = None


def _get_client():
    """Lazy-initialize the Groq client."""
    global _client, _deployment
    if _client is not None:
        return _client, _deployment

    api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"').strip("'")
    _deployment = "llama-3.1-8b-instant"

    if not api_key:
        print("[LLMService] Groq not configured — using fallback heuristics")
        return None, None

    try:
        from groq import Groq
        _client = Groq(
            api_key=api_key,
            timeout=60.0,
            max_retries=2
        )
        print(f"[LLMService] Groq client initialized → {_deployment}")
        return _client, _deployment
    except Exception as e:
        print(f"[LLMService] Failed to init Groq: {e}")
        return None, None


def is_llm_configured() -> bool:
    """Check if Groq API credentials are present in env."""
    return bool(os.getenv("GROQ_API_KEY", "").strip())


# ──────────────────────────────────────────────────────────────
# 1. Analyze Ticket
# ──────────────────────────────────────────────────────────────
def analyze_ticket(subject: str, description: str = "") -> dict:
    """
    Uses LLM to determine priority, category, suggested subject,
    sentiment, and urgency score from the raw input.

    Returns: {priority, category, suggested_subject, sentiment, urgency_score}
    """
    client, deployment = _get_client()

    if client:
        try:
            prompt = f"""You are an IT support ticket triage expert. Analyze the following IT support request and respond with ONLY valid JSON.

User's Issue:
Subject: {subject}
Description: {description}

Return JSON with these exact keys:
{{
  "priority": "P1 - CRITICAL" or "P2 - HIGH" or "P3 - MEDIUM" or "P4 - LOW",
  "category": one of "Network", "Hardware", "Software", "Access", "Infrastructure", "Development", "Security", "Email", "Cloud", "Onboarding",
  "suggested_subject": a clear, concise ticket subject (max 80 chars),
  "sentiment": "frustrated" or "neutral" or "urgent",
  "urgency_score": integer from 1-10
}}"""

            response = client.chat.completions.create(
                model=deployment,
                messages=[
                    {"role": "system", "content": "You are an IT ticket triage AI. Respond with ONLY valid JSON, no markdown."},
                    {"role": "user", "content": prompt},
                ],
            )
            raw = response.choices[0].message.content.strip()
            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
                if raw.endswith("```"):
                    raw = raw[:-3]
                raw = raw.strip()
            return json.loads(raw)
        except Exception as e:
            print(f"[LLMService] analyze_ticket LLM error: {e}")

    # ─── Fallback: keyword heuristics ───
    return _fallback_analyze(subject, description)


def _fallback_analyze(subject: str, description: str = "") -> dict:
    """Keyword-based fallback for ticket analysis."""
    text = f"{subject} {description}".lower()

    # Priority
    if any(w in text for w in ["down", "outage", "critical", "production", "emergency", "urgent"]):
        priority = "P1 - CRITICAL"
        urgency = 9
        sentiment = "urgent"
    elif any(w in text for w in ["failed", "cannot", "error", "broken", "not working", "crash"]):
        priority = "P2 - HIGH"
        urgency = 7
        sentiment = "frustrated"
    elif any(w in text for w in ["slow", "request", "need", "please", "help", "install"]):
        priority = "P3 - MEDIUM"
        urgency = 5
        sentiment = "neutral"
    else:
        priority = "P4 - LOW"
        urgency = 3
        sentiment = "neutral"

    # Category
    if any(w in text for w in ["vpn", "network", "wifi", "internet", "dns", "firewall"]):
        category = "Network"
    elif any(w in text for w in ["printer", "monitor", "keyboard", "mouse", "laptop", "hardware", "screen", "cable"]):
        category = "Hardware"
    elif any(w in text for w in ["install", "software", "license", "figma", "adobe", "app"]):
        category = "Software"
    elif any(w in text for w in ["password", "reset", "access", "permission", "locked", "login", "drive", "shared"]):
        category = "Access"
    elif any(w in text for w in ["database", "server", "cluster", "infrastructure", "deploy"]):
        category = "Infrastructure"
    elif any(w in text for w in ["npm", "node", "code", "git", "build", "compile", "development"]):
        category = "Development"
    elif any(w in text for w in ["email", "outlook", "mail", "inbox"]):
        category = "Email"
    elif any(w in text for w in ["mfa", "phishing", "security", "certificate", "suspicious"]):
        category = "Security"
    elif any(w in text for w in ["aws", "cloud", "azure", "jenkins", "ci/cd"]):
        category = "Cloud"
    elif any(w in text for w in ["onboarding", "new hire", "badge", "provisioning"]):
        category = "Onboarding"
    else:
        category = "General"

    return {
        "priority": priority,
        "category": category,
        "suggested_subject": subject[:80] if len(subject) <= 80 else subject[:77] + "...",
        "sentiment": sentiment,
        "urgency_score": urgency,
    }


# ──────────────────────────────────────────────────────────────
# 2. Match Technician
# ──────────────────────────────────────────────────────────────
def match_technician(ticket_info: dict, technicians: list) -> dict | None:
    """
    Select the best technician for a ticket based on skills.
    Returns the full technician dict, or None if no match.
    """
    if not technicians:
        return None

    client, deployment = _get_client()
    category = ticket_info.get("category", "General")
    priority = ticket_info.get("priority", "P3 - MEDIUM")

    if client:
        try:
            tech_list = [
                {"id": t["id"], "name": t["name"], "skills": t.get("skills", [])}
                for t in technicians
            ]
            prompt = f"""You are assigning an IT support ticket to the best available technician.

Ticket:
- Category: {category}
- Priority: {priority}
- Subject: {ticket_info.get('subject', 'N/A')}

Available Technicians:
{json.dumps(tech_list, indent=2)}

Pick the BEST technician based on skill match. Respond with ONLY the technician's ID string, nothing else."""

            response = client.chat.completions.create(
                model=deployment,
                messages=[
                    {"role": "system", "content": "You are a ticket routing AI. Respond with ONLY the technician ID."},
                    {"role": "user", "content": prompt},
                ],
            )
            chosen_id = response.choices[0].message.content.strip().strip('"').strip("'")
            match = next((t for t in technicians if t["id"] == chosen_id), None)
            if match:
                return match
        except Exception as e:
            print(f"[LLMService] match_technician LLM error: {e}")

    # ─── Fallback: simple skill matching ───
    return _fallback_match(category, technicians)


def _fallback_match(category: str, technicians: list) -> dict | None:
    """Score technicians by skill overlap with ticket category."""
    best = None
    best_score = -1
    for tech in technicians:
        skills = [s.lower() for s in tech.get("skills", [])]
        score = 1 if category.lower() in skills else 0
        if score > best_score:
            best_score = score
            best = tech
    return best or (technicians[0] if technicians else None)


# ──────────────────────────────────────────────────────────────
# 3. Generate Ticket Summary
# ──────────────────────────────────────────────────────────────
def generate_ticket_summary(chat_history: list) -> str:
    """
    Summarize a chat history into a clean ticket subject line.
    """
    client, deployment = _get_client()

    # Build conversation text
    convo = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in chat_history[:10]])

    if client:
        try:
            prompt = f"""Summarize the following IT support chat into a single concise ticket subject line (max 80 characters). Focus on the core issue.

Chat:
{convo}

Respond with ONLY the subject line, no quotes or extra text."""

            response = client.chat.completions.create(
                model=deployment,
                messages=[
                    {"role": "system", "content": "You summarize IT chats into ticket subjects. Respond with only the subject line."},
                    {"role": "user", "content": prompt},
                ],
            )
            return response.choices[0].message.content.strip().strip('"')[:80]
        except Exception as e:
            print(f"[LLMService] generate_ticket_summary LLM error: {e}")

    # ─── Fallback: first user message ───
    for msg in chat_history:
        if msg.get("role") == "user":
            text = msg["content"]
            return (text[:77] + "...") if len(text) > 80 else text
    return "IT Support Request"
