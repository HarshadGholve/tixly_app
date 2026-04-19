export type TicketStatus = "Open" | "In Progress" | "Pending User" | "Pending Approval" | "Resolved" | "On Hold";
export type TicketPriority = "Critical" | "High" | "Medium" | "Low";
export type UserRole = "User" | "Technician" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  phone?: string;
  location?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description?: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  user_id: string;
  requester: User;
  assignee?: User | null;
  assignee_id?: string | null;
  created_at: string;
  updated_at: string;
  sla_remaining_min?: number;
  sla_target_min?: number;
  sla_elapsed_min?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot" | "system" | "agent";
  content: string;
  timestamp: string;
  isInternalNote?: boolean;
  authorName?: string;
  authorAvatar?: string;
  attachment?: { name: string; type: string };
}

export interface KBEntry {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  resolution_steps: string;
}

export interface AutomationLog {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
}
