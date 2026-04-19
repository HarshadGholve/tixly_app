import type { Ticket, User, ChatMessage, KBEntry, AutomationLog } from "./types";

export const currentUser: User = {
  id: "u1",
  name: "Jane Doe",
  email: "jane@company.com",
  role: "User",
  title: "Senior Marketing Manager",
  phone: "+1 (555) 123-4567",
  location: "Remote (New York)",
};

export const adminUser: User = {
  id: "a1",
  name: "Sarah Admin",
  email: "sarah@company.com",
  role: "Admin",
  title: "System Admin",
};

export const teammates: User[] = [
  { id: "t1", name: "Michael Chen", email: "michael@company.com", role: "Technician", title: "L2 Network Support" },
  { id: "t2", name: "Jessica Reyes", email: "jessica@company.com", role: "Technician", title: "Hardware Support" },
  { id: "t3", name: "David White", email: "david@company.com", role: "Technician", title: "Software Licenses" },
  { id: "t4", name: "Emma Thompson", email: "emma@company.com", role: "User", title: "Senior Marketing Manager" },
  { id: "t5", name: "Marcus Johnson", email: "marcus@company.com", role: "User", title: "Designer" },
];

const findUser = (id: string) => [currentUser, adminUser, ...teammates].find((u) => u.id === id)!;

export const tickets: Ticket[] = [
  {
    id: "INC-1042",
    subject: "VPN Authentication Failed",
    description:
      'I am unable to connect to the corporate VPN using my standard credentials. The Cisco AnyConnect client throws an "Authentication failed" error immediately after entering my password and 2FA token. This started happening this morning after the recent OS update. I have tried restarting my machine and resetting my network adapter, but the issue persists.',
    category: "Network & Access",
    status: "In Progress",
    priority: "High",
    user_id: "u1",
    requester: currentUser,
    assignee: teammates[0],
    assignee_id: "t1",
    created_at: "2026-04-17T10:42:00Z",
    updated_at: "2026-04-17T11:30:00Z",
    sla_remaining_min: 252,
    sla_target_min: 480,
  },
  {
    id: "REQ-0891",
    subject: "Request Adobe Creative Cloud License",
    description: "Need Adobe Creative Cloud for upcoming brand campaign work.",
    category: "Software",
    status: "Pending Approval",
    priority: "Low",
    user_id: "u1",
    requester: currentUser,
    assignee: null,
    created_at: "2026-04-16T14:15:00Z",
    updated_at: "2026-04-16T16:30:00Z",
  },
  {
    id: "INC-0855",
    subject: "Monitor Display Flickering",
    description: "External Dell monitor flickers after wake from sleep.",
    category: "Hardware",
    status: "Resolved",
    priority: "Medium",
    user_id: "u1",
    requester: currentUser,
    assignee: teammates[1],
    created_at: "2023-10-12T09:00:00Z",
    updated_at: "2023-10-14T15:20:00Z",
  },
  {
    id: "INC-0812",
    subject: "Password Reset for SAP",
    description: "Locked out of SAP after too many attempts.",
    category: "Access & Identity",
    status: "Resolved",
    priority: "High",
    user_id: "u1",
    requester: currentUser,
    assignee: adminUser,
    created_at: "2023-10-05T11:00:00Z",
    updated_at: "2023-10-05T11:30:00Z",
  },
  {
    id: "INC-8294",
    subject: "VPN Connection Failing Remote",
    description:
      'Hi IT Team, I\'ve been trying to connect to the corporate VPN for the past hour and keep getting "Error 789: L2TP connection failed". I\'ve restarted my laptop and router twice but no luck. I need this urgently for the 10 AM client presentation. Please help! Emma',
    category: "Network Support",
    status: "Open",
    priority: "Critical",
    user_id: "t4",
    requester: teammates[3],
    assignee: null,
    created_at: "2026-04-17T09:15:00Z",
    updated_at: "2026-04-17T09:18:00Z",
    sla_remaining_min: 45,
    sla_target_min: 60,
    sla_elapsed_min: 15,
  },
  {
    id: "REQ-4421",
    subject: "Adobe Creative Cloud License",
    category: "Software Licenses",
    status: "In Progress",
    priority: "High",
    user_id: "t5",
    requester: teammates[4],
    assignee: teammates[0],
    created_at: "2026-04-16T13:00:00Z",
    updated_at: "2026-04-17T08:00:00Z",
    sla_remaining_min: 135,
    sla_target_min: 480,
  },
  {
    id: "INC-8290",
    subject: "Password Reset Required",
    category: "Access & Identity",
    status: "Resolved",
    priority: "Normal",
    user_id: "u1",
    requester: { id: "t6", name: "Sarah Jenkins", email: "sj@company.com", role: "User" },
    assignee: { id: "bot", name: "Tixly Bot", email: "bot@company.com", role: "Technician", title: "Automation" },
    created_at: "2026-04-16T10:00:00Z",
    updated_at: "2026-04-16T10:02:00Z",
  },
];

export function getTicket(id: string) {
  return tickets.find((t) => t.id === id);
}

export const myTicketSummary = {
  total: 24,
  inProgress: 3,
  pendingUser: 1,
  resolved30d: 12,
};

export const userOverview = {
  open: 12,
  inProgress: 5,
  resolved30d: 48,
  slaCompliance: 98,
};

export const adminMetrics = {
  totalVolume: 2845,
  autoResolved: 68,
  slaMet: 94.2,
  activeBacklog: 142,
  highPriority: 28,
  normalPriority: 114,
  volumeDelta: 12,
  autoDelta: 5.2,
  slaDelta: -1.1,
};

export const trendData = Array.from({ length: 7 }).map((_, i) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const human = [120, 135, 110, 95, 80, 60, 70][i];
  const bot = [100, 115, 95, 80, 70, 55, 60][i];
  return { day: days[i], Human: human, Bot: bot };
});

export const categoryData = [
  { name: "Access/VPN", value: 35 },
  { name: "Hardware", value: 28 },
  { name: "Software", value: 22 },
  { name: "Other", value: 15 },
];

export const queueBacklog = [
  { queue: "Network Support", assignee: teammates[0], open: 42, slaRisk: "3 Critical" as const },
  { queue: "Hardware Provisioning", assignee: teammates[1], open: 28, slaRisk: "1 Warning" as const },
  { queue: "Software Licenses", assignee: teammates[2], open: 15, slaRisk: "Healthy" as const },
];

export const systemAlerts = [
  {
    id: "a1",
    title: "SLA Breach Warning",
    detail: "3 tickets in Network Support approaching 4hr limit.",
    severity: "critical" as const,
  },
  {
    id: "a2",
    title: "Volume Spike Detected",
    detail: "Password resets up 40% in last 2 hours.",
    severity: "info" as const,
  },
];

export const chatHistory: ChatMessage[] = [
  {
    id: "m1",
    role: "bot",
    content:
      "Hi Jane! I'm your IT Support Assistant. How can I help you today? You can type your issue or choose from these common requests:",
    timestamp: "2026-04-17T10:42:00Z",
  },
  {
    id: "m2",
    role: "user",
    content:
      'I\'m trying to connect to the VPN but it keeps giving me an "Authentication Failed" error. I\'ve tried restarting my client.',
    timestamp: "2026-04-17T10:43:00Z",
  },
  {
    id: "m3",
    role: "bot",
    content:
      "I understand you're having trouble with VPN authentication. Let's get this sorted out. I can run a diagnostic on your VPN profile and reset your connection tokens. This usually resolves authentication issues.",
    timestamp: "2026-04-17T10:43:30Z",
  },
  {
    id: "m4",
    role: "user",
    content: "Yes, please run it.",
    timestamp: "2026-04-17T10:44:00Z",
  },
];

export const adminTicketConversation: ChatMessage[] = [
  {
    id: "c1",
    role: "user",
    content:
      'Hi IT Team, I\'ve been trying to connect to the corporate VPN for the past hour and keep getting "Error 789: L2TP connection failed". I\'ve restarted my laptop and router twice but no luck. I need this urgently for the 10 AM client presentation. Please help! Emma',
    timestamp: "2026-04-17T09:15:00Z",
    authorName: "Emma Thompson",
  },
  {
    id: "c2",
    role: "system",
    content: 'Priority automatically set to Critical due to keyword "urgently".',
    timestamp: "2026-04-17T09:15:30Z",
  },
  {
    id: "c3",
    role: "system",
    content:
      'Known issue with L2TP connections on latest Windows Update (KB5034765). Automation playbook "VPN Fix" is recommended.',
    timestamp: "2026-04-17T09:16:00Z",
    isInternalNote: true,
    authorName: "System Alert",
  },
];

export const automationLogs: AutomationLog[] = [
  {
    id: "al1",
    title: "Keyword Priority Triage",
    detail: 'Triggered by keyword "urgently". Set Priority to Critical.',
    timestamp: "09:16 AM",
    status: "success",
  },
  {
    id: "al2",
    title: "Auto-Response Bot",
    detail: "Sent initial triage message and prompt for automated fix.",
    timestamp: "09:17 AM",
    status: "success",
  },
  {
    id: "al3",
    title: "Waiting for user input...",
    detail: "Awaiting confirmation to run VPN Fix playbook.",
    timestamp: "—",
    status: "pending",
  },
];

export const kbEntries: KBEntry[] = [
  {
    id: "kb1",
    title: "Reset corporate VPN profile",
    category: "Network & Access",
    keywords: ["vpn", "authentication", "l2tp"],
    resolution_steps: "Clear cached tokens, reinstall VPN profile, re-authenticate.",
  },
  {
    id: "kb2",
    title: "Active Directory password reset",
    category: "Access & Identity",
    keywords: ["password", "reset", "ad"],
    resolution_steps: "Verify identity, trigger AD reset, send temp password.",
  },
];
