import { cn } from "@/lib/utils";
import type { TicketStatus, TicketPriority } from "@/lib/types";

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-status-open text-status-open-foreground",
  "In Progress": "bg-status-progress text-status-progress-foreground",
  "Pending User": "bg-status-warning text-status-warning-foreground",
  "Pending Approval": "bg-status-warning text-status-warning-foreground",
  Resolved: "bg-status-resolved text-status-resolved-foreground",
  "On Hold": "bg-muted text-muted-foreground",
};

const priorityStyles: Record<TicketPriority, string> = {
  Critical: "bg-status-critical text-status-critical-foreground",
  High: "bg-status-warning text-status-warning-foreground",
  Medium: "bg-status-progress text-status-progress-foreground",
  Low: "bg-muted text-muted-foreground",
};

/**
 * Normalizes backend priority format to frontend TicketPriority type.
 * Backend stores: "P1 - CRITICAL", "P2 - HIGH", "P3 - MEDIUM", "P4 - LOW"
 * Frontend expects: "Critical", "High", "Medium", "Low"
 * Also handles undefined/null gracefully.
 */
export function normalizePriority(priority: string | undefined | null): TicketPriority {
  if (!priority) return "Medium";
  const upper = priority.toUpperCase();
  if (upper.includes("CRITICAL") || upper.includes("P1")) return "Critical";
  if (upper.includes("HIGH") || upper.includes("P2")) return "High";
  if (upper.includes("LOW") || upper.includes("P4")) return "Low";
  
  // If it's already a valid frontend value, pass it through
  const valid: TicketPriority[] = ["Critical", "High", "Medium", "Low"];
  if (valid.includes(priority as TicketPriority)) return priority as TicketPriority;
  
  // Fallback to Medium
  return "Medium";
}

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: string; // accepts both backend and frontend formats
  className?: string;
}) {
  const normalized = normalizePriority(priority);
  const dot = normalized === "Critical" ? "▲" : normalized === "High" ? "↑" : normalized === "Low" ? "↓" : "—";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        priorityStyles[normalized],
        className,
      )}
    >
      <span className="text-[10px]">{dot}</span>
      {normalized}
    </span>
  );
}
