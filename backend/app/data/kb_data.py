"""
Separated Knowledge Base Articles.
This file contains the KB data independently so it can be managed,
updated, or replaced without touching the core database logic.
"""

KB_ARTICLES = [
    {
        "id": "kb1", "category": "Access",
        "keywords": ["password", "reset", "forgot", "locked"], 
        "resolution_steps": "To reset your password, please navigate to identity.company.com/reset. You will need your mobile device to approve the Okta Verify push notification."
    },
    {
        "id": "kb2", "category": "Network",
        "keywords": ["vpn", "connect", "timeout", "authentication failed", "cisco"], 
        "resolution_steps": "VPN authentication failures are often due to a desynced 2FA token. Open the Cisco AnyConnect client, clear the cache, and re-authenticate. If it still fails, check your WiFi stability."
    },
    {
        "id": "kb3", "category": "Hardware",
        "keywords": ["printer", "offline", "print", "jam"], 
        "resolution_steps": "If the printer shows as offline, first verify it has paper and no paper jams. Then, press and hold the WiFi button on the printer for 3 seconds to reconnect it to the 'Corp-Devices' network."
    },
    {
        "id": "kb4", "category": "Software",
        "keywords": ["figma", "install", "license", "software request"], 
        "resolution_steps": "Figma licenses require manager approval. Since you requested Figma, I am automatically routing a license provisioning request to your department head. Once approved, it will appear in your Self-Service App Portal."
    },
    {
        "id": "kb5", "category": "Hardware",
        "keywords": ["flickering", "screen", "monitor", "display", "conference"], 
        "resolution_steps": "Monitor flickering is usually caused by a loose HDMI or USB-C connection. Please unplug the display cable from your laptop, wait 5 seconds, and plug it back in firmly. Also, check the connection at the back of the monitor."
    },
    {
        "id": "kb6", "category": "Infrastructure",
        "keywords": ["database", "down", "unresponsive", "outage", "cluster"], 
        "resolution_steps": "CRITICAL INCIDENT PROTOCOL: Database unresponsiveness requires immediate escalation. Do not attempt manual restarts. Executing the 'Emergency DB Connection Drain' runbook is recommended for Level 3 Engineers."
    },
    {
        "id": "kb7", "category": "Development",
        "keywords": ["node", "npm", "eacces", "permission", "denied", "install"], 
        "resolution_steps": "NPM EACCES errors happen when installing global packages without root permissions. Do not use 'sudo'. Instead, configure npm to use a different directory by running: `npm config set prefix '~/.npm-global'`."
    },
    {
        "id": "kb8", "category": "Access",
        "keywords": ["drive", "shared folder", "marketing", "google workspace", "permission"], 
        "resolution_steps": "Access to departmental Shared Drives is managed via Google Groups. I can automatically submit an access request to the 'Marketing-All' Google Group owners for you."
    },
    {
        "id": "kb9", "category": "Software",
        "keywords": ["adobe", "acrobat", "crash", "close", "pdf"], 
        "resolution_steps": "If Adobe Acrobat is crashing on startup, your user preferences file might be corrupted. Navigate to %APPDATA%\\Adobe\\Acrobat\\ and delete the 'Preferences' folder, then restart the application."
    },
    {
        "id": "kb10", "category": "Hardware",
        "keywords": ["mouse", "keyboard", "ergonomic", "request", "peripheral"], 
        "resolution_steps": "Standard peripherals (mice, keyboards, headsets) can be picked up directly from the IT Helpdesk on the 2nd floor between 9 AM and 4 PM. No ticket is required for standard items."
    }
]
