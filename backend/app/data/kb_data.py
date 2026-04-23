"""
Separated Knowledge Base Articles.
This file contains the KB data independently so it can be managed,
updated, or replaced without touching the core database logic.

Expanded to 22 articles covering: Access, Network, Hardware, Software,
Infrastructure, Development, Email, Security, Cloud, Onboarding, and Mobile.
"""

KB_ARTICLES = [
    # ─── ACCESS ────────────────────────────────────────────
    {
        "id": "kb1", "category": "Access",
        "keywords": ["password", "reset", "forgot", "locked", "account locked"],
        "resolution_steps": "To reset your password, please navigate to identity.company.com/reset. You will need your mobile device to approve the Okta Verify push notification. If your account is locked, wait 15 minutes before retrying, or contact the IT Helpdesk for an immediate unlock.",
        "severity": "medium",
        "estimated_resolution_time": "5 minutes"
    },
    {
        "id": "kb8", "category": "Access",
        "keywords": ["drive", "shared folder", "marketing", "google workspace", "permission", "shared drive"],
        "resolution_steps": "Access to departmental Shared Drives is managed via Google Groups. I can automatically submit an access request to the 'Marketing-All' Google Group owners for you. Typical approval takes 1-2 business hours.",
        "severity": "low",
        "estimated_resolution_time": "2 hours"
    },
    {
        "id": "kb11", "category": "Access",
        "keywords": ["new hire", "onboarding", "account", "provisioning", "first day"],
        "resolution_steps": "New hire provisioning includes: 1) Active Directory account creation, 2) Email setup, 3) VPN credentials, 4) Building access badge. All provisioning is automated via the HR-IT pipeline. Please verify your manager has submitted the onboarding request in ServiceNow. Expected SLA: 24 hours before start date.",
        "severity": "medium",
        "estimated_resolution_time": "24 hours"
    },
    {
        "id": "kb12", "category": "Access",
        "keywords": ["badge", "access card", "building", "door", "entry", "physical access"],
        "resolution_steps": "For badge access issues: 1) Verify your badge is not expired (check the date printed on the back). 2) Try tapping firmly on the reader. 3) If your badge is lost, visit Security on the 1st floor with photo ID for a temporary badge. A replacement will be issued within 48 hours.",
        "severity": "low",
        "estimated_resolution_time": "30 minutes"
    },

    # ─── NETWORK ───────────────────────────────────────────
    {
        "id": "kb2", "category": "Network",
        "keywords": ["vpn", "connect", "timeout", "authentication failed", "cisco", "anyconnect", "remote"],
        "resolution_steps": "VPN authentication failures are often due to a desynced 2FA token. Steps: 1) Open the Cisco AnyConnect client. 2) Click the gear icon → Preferences → Clear cache. 3) Restart the client and re-authenticate. 4) If it still fails, check your WiFi stability and disconnect from any personal VPNs. 5) Ensure your corporate password has not expired.",
        "severity": "high",
        "estimated_resolution_time": "15 minutes"
    },
    {
        "id": "kb13", "category": "Network",
        "keywords": ["wifi", "wireless", "slow internet", "no internet", "connected no internet", "dns"],
        "resolution_steps": "For WiFi connectivity issues: 1) Forget the 'Corp-WiFi' network and reconnect. 2) Run 'ipconfig /flushdns' (Windows) or 'sudo dscacheutil -flushcache' (Mac). 3) Try the 'Corp-Guest' network to verify hardware works. 4) If on a floor with known dead spots (3F south wing), relocate closer to an access point. 5) Submit a network diagnostic at netdiag.company.com.",
        "severity": "medium",
        "estimated_resolution_time": "20 minutes"
    },

    # ─── HARDWARE ──────────────────────────────────────────
    {
        "id": "kb3", "category": "Hardware",
        "keywords": ["printer", "offline", "print", "jam", "paper jam", "scanning"],
        "resolution_steps": "If the printer shows as offline: 1) Verify it has paper and no paper jams (open the front panel to check). 2) Press and hold the WiFi button for 3 seconds to reconnect to 'Corp-Devices' network. 3) On your computer, go to Settings → Printers → Remove the printer → Re-add it. 4) For persistent issues, the printer model/serial is on the label — include it when escalating.",
        "severity": "low",
        "estimated_resolution_time": "10 minutes"
    },
    {
        "id": "kb5", "category": "Hardware",
        "keywords": ["flickering", "screen", "monitor", "display", "conference", "external display", "hdmi"],
        "resolution_steps": "Monitor flickering troubleshooting: 1) Unplug the display cable (HDMI/USB-C/DisplayPort) from your laptop and wait 5 seconds. 2) Plug it back in firmly. 3) Check the connection at the back of the monitor. 4) Try a different cable if available. 5) For conference room displays, use the 'AV Reset' button on the room control panel. 6) If using a USB-C dock, try connecting directly to the monitor.",
        "severity": "medium",
        "estimated_resolution_time": "10 minutes"
    },
    {
        "id": "kb10", "category": "Hardware",
        "keywords": ["mouse", "keyboard", "ergonomic", "request", "peripheral", "headset", "webcam", "dock"],
        "resolution_steps": "Standard peripherals (mice, keyboards, headsets, webcams) can be picked up directly from the IT Supply Room on the 2nd floor between 9 AM and 4 PM. No ticket required for standard items. Ergonomic equipment (standing desk converters, special chairs) requires manager approval — submit a request at equipment.company.com.",
        "severity": "low",
        "estimated_resolution_time": "Same day"
    },
    {
        "id": "kb14", "category": "Hardware",
        "keywords": ["laptop", "slow", "performance", "fan noise", "hot", "overheating", "startup slow"],
        "resolution_steps": "For laptop performance issues: 1) Restart your laptop (not just sleep/wake). 2) Check Task Manager (Ctrl+Shift+Esc) for high CPU/memory processes. 3) Run Disk Cleanup. 4) Ensure Windows/macOS updates are current. 5) If the laptop is over 3 years old, you may be eligible for a refresh — check asset.company.com for your device age.",
        "severity": "medium",
        "estimated_resolution_time": "30 minutes"
    },

    # ─── SOFTWARE ──────────────────────────────────────────
    {
        "id": "kb4", "category": "Software",
        "keywords": ["figma", "install", "license", "software request", "software install"],
        "resolution_steps": "Figma licenses require manager approval. Since you requested Figma, I am automatically routing a license provisioning request to your department head. Once approved (typically 1-2 business days), it will appear in your Self-Service App Portal at apps.company.com. For urgent requests, CC your manager on the approval email.",
        "severity": "low",
        "estimated_resolution_time": "2 business days"
    },
    {
        "id": "kb9", "category": "Software",
        "keywords": ["adobe", "acrobat", "crash", "close", "pdf", "creative cloud"],
        "resolution_steps": "If Adobe Acrobat is crashing on startup: 1) Close all Adobe apps. 2) Navigate to %APPDATA%\\Adobe\\Acrobat\\ (Windows) or ~/Library/Preferences/Adobe/ (Mac). 3) Rename the 'Preferences' folder to 'Preferences_old'. 4) Restart Adobe Acrobat. 5) If using Creative Cloud, sign out and back in. 6) Run the Adobe Cleaner Tool from helpx.adobe.com if issues persist.",
        "severity": "low",
        "estimated_resolution_time": "15 minutes"
    },
    {
        "id": "kb15", "category": "Software",
        "keywords": ["zoom", "teams", "video", "microphone", "camera", "audio", "meeting"],
        "resolution_steps": "Video conferencing troubleshooting: 1) Check Settings → Audio/Video in the app to ensure the correct device is selected. 2) Close other apps that might be using the camera (check System Tray). 3) Test at zoom.us/test or Teams test call. 4) Ensure browser permissions allow camera/mic access. 5) Update the app to the latest version. 6) If using a dock, try connecting directly.",
        "severity": "medium",
        "estimated_resolution_time": "10 minutes"
    },

    # ─── INFRASTRUCTURE ────────────────────────────────────
    {
        "id": "kb6", "category": "Infrastructure",
        "keywords": ["database", "down", "unresponsive", "outage", "cluster", "production"],
        "resolution_steps": "CRITICAL INCIDENT PROTOCOL: Database unresponsiveness requires immediate escalation. Do NOT attempt manual restarts. Steps: 1) Check status.company.com for known outages. 2) Execute the 'Emergency DB Connection Drain' runbook (available to Level 3 Engineers). 3) Notify the on-call DBA via PagerDuty. 4) Open a P1 incident bridge at bridge.company.com/p1.",
        "severity": "critical",
        "estimated_resolution_time": "Immediate escalation"
    },

    # ─── DEVELOPMENT ───────────────────────────────────────
    {
        "id": "kb7", "category": "Development",
        "keywords": ["node", "npm", "eacces", "permission", "denied", "install", "npm install"],
        "resolution_steps": "NPM EACCES errors happen when installing global packages without root permissions. Do NOT use 'sudo'. Fix: 1) Run: npm config set prefix '~/.npm-global'. 2) Add to your shell profile: export PATH=~/.npm-global/bin:$PATH. 3) Restart your terminal. Alternatively, use 'npx' to run packages without global install.",
        "severity": "low",
        "estimated_resolution_time": "5 minutes"
    },
    {
        "id": "kb16", "category": "Development",
        "keywords": ["git", "clone", "ssh", "push", "pull", "permission denied", "repository"],
        "resolution_steps": "Git SSH issues: 1) Check if your SSH key is loaded: 'ssh-add -l'. 2) If empty, add your key: 'ssh-add ~/.ssh/id_ed25519'. 3) Test connectivity: 'ssh -T git@github.com'. 4) If you don't have an SSH key, generate one: 'ssh-keygen -t ed25519 -C your.email@company.com'. 5) Add the public key to your GitHub/GitLab profile under Settings → SSH Keys.",
        "severity": "low",
        "estimated_resolution_time": "10 minutes"
    },
    {
        "id": "kb17", "category": "Development",
        "keywords": ["jenkins", "ci/cd", "pipeline", "build", "deploy", "failed", "ci"],
        "resolution_steps": "Jenkins pipeline failures: 1) Check the build console output for the specific error. 2) Common issues: expired credentials (rotate in Jenkins Credentials Manager), insufficient disk space (check /var/jenkins), or dependency resolution failures (clear the Maven/npm cache). 3) For infrastructure issues, check jenkins.company.com/systemInfo. 4) Contact the Platform Engineering team for infrastructure-level failures.",
        "severity": "high",
        "estimated_resolution_time": "30 minutes"
    },

    # ─── EMAIL ─────────────────────────────────────────────
    {
        "id": "kb18", "category": "Email",
        "keywords": ["outlook", "sync", "email not syncing", "inbox", "send", "receive", "email"],
        "resolution_steps": "Outlook sync issues: 1) Check your internet connection. 2) Toggle Work Offline mode off (Send/Receive tab → Work Offline). 3) Try Outlook Web at outlook.office365.com to verify the issue is client-side. 4) Repair your Outlook profile: Control Panel → Mail → Show Profiles → Repair. 5) If mailbox is full, archive old emails or request a quota increase from your manager.",
        "severity": "medium",
        "estimated_resolution_time": "15 minutes"
    },
    {
        "id": "kb19", "category": "Email",
        "keywords": ["mailbox", "full", "quota", "storage", "out of space", "archive"],
        "resolution_steps": "Mailbox quota exceeded: 1) Delete large/old emails with attachments (sort by size). 2) Empty Deleted Items and Junk folders. 3) Enable Online Archive: Settings → View All Outlook Settings → General → Storage → Enable Archive. 4) For a permanent quota increase (requires manager approval), submit a request at it.company.com/email-quota.",
        "severity": "low",
        "estimated_resolution_time": "10 minutes"
    },

    # ─── SECURITY ──────────────────────────────────────────
    {
        "id": "kb20", "category": "Security",
        "keywords": ["mfa", "two factor", "2fa", "authenticator", "otp", "verification code"],
        "resolution_steps": "MFA setup/issues: 1) Go to security.company.com/mfa to manage your MFA settings. 2) For a new device, scan the QR code with Microsoft Authenticator or Google Authenticator. 3) If locked out (lost phone), contact the IT Helpdesk with your employee ID for a temporary bypass code. 4) Hardware security keys (YubiKey) can be registered as a backup at the same portal.",
        "severity": "high",
        "estimated_resolution_time": "10 minutes"
    },
    {
        "id": "kb21", "category": "Security",
        "keywords": ["phishing", "suspicious", "spam", "scam", "malware", "virus", "threat"],
        "resolution_steps": "Suspicious email protocol: 1) Do NOT click any links or download attachments. 2) Use the 'Report Phishing' button in Outlook (Home tab → Report Message). 3) If you already clicked a link, immediately change your password at identity.company.com/reset. 4) Run a full antivirus scan. 5) Forward the email to security@company.com with the header information.",
        "severity": "critical",
        "estimated_resolution_time": "Immediate"
    },

    # ─── MOBILE ────────────────────────────────────────────
    {
        "id": "kb22", "category": "Mobile",
        "keywords": ["mobile", "phone", "mdm", "intune", "company portal", "iphone", "android", "tablet"],
        "resolution_steps": "Mobile device enrollment: 1) Download 'Intune Company Portal' from App Store/Google Play. 2) Sign in with your corporate email. 3) Follow the enrollment wizard (takes ~3 minutes). 4) Once enrolled, company apps (Outlook, Teams, OneDrive) will auto-install. 5) For VPN on mobile, download 'Cisco AnyConnect' and use the server address: vpn.company.com. 6) If enrollment fails, ensure your device OS meets minimum requirements (iOS 16+ / Android 13+).",
        "severity": "low",
        "estimated_resolution_time": "15 minutes"
    },
]
