import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, PriorityBadge, normalizePriority } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import {
  Search,
  Download,
  Filter as FilterIcon,
  MoreVertical,
  Pencil,
  CheckCircle,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/admin/tickets")({
  head: () => ({
    meta: [
      { title: "All Tickets — Tixly Admin" },
      { name: "description", content: "Manage, assign, and track all IT support requests across the organization." },
    ],
  }),
  component: AllTickets,
});

/** Priority rank for sorting: lower number = higher priority */
const PRIORITY_RANK: Record<string, number> = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

function AllTickets() {
  const [user, setUser] = useState({ name: "Loading...", subtitle: "Loading..." });
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Edit modal state
  const [editTicket, setEditTicket] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ subject: "", category: "", priority: "", status: "", assignee_id: "" });
  const [editSaving, setEditSaving] = useState(false);

  const loadTickets = () => fetchApi("/tickets/all").then(res => setAllTickets(res.tickets)).catch(() => { });

  useEffect(() => {
    fetchApi("/auth/me").then(u => {
      if (u.role === "User") {
        window.location.replace("/dashboard");
      } else {
        setUser({ name: u.name, subtitle: u.title || "Admin" });
      }
    }).catch(() => { });
    loadTickets();
    fetchApi("/admin/technicians").then(res => setTechnicians(res.technicians || [])).catch(() => { });
  }, []);

  const filteredTickets = useMemo(() => {
    return allTickets
      .filter(t => {
        const matchSearch = !searchQuery ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "all" || t.status === statusFilter;
        const matchPriority = priorityFilter === "all" || (t.priority?.toUpperCase?.() ?? "").includes(priorityFilter);
        const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
        return matchSearch && matchStatus && matchPriority && matchCategory;
      })
      .sort((a, b) => {
        const rankA = PRIORITY_RANK[normalizePriority(a.priority)] ?? 99;
        const rankB = PRIORITY_RANK[normalizePriority(b.priority)] ?? 99;
        return rankA - rankB;
      });
  }, [allTickets, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // CSV Export
  const handleExport = () => {
    const headers = ["ID", "Subject", "Category", "Status", "Priority", "Assignee", "Created At"];
    const rows = filteredTickets.map(t => [
      t.id,
      `"${(t.subject || "").replace(/"/g, '""')}"`,
      t.category,
      t.status,
      t.priority,
      t.assignee?.name || "Unassigned",
      t.created_at,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mark as Resolved
  const handleResolve = async (ticketId: string) => {
    await fetchApi(`/admin/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Resolved" }),
    }).catch(() => { });
    loadTickets();
  };

  // Delete
  const handleDelete = async (ticketId: string) => {
    if (!window.confirm(`Delete ticket ${ticketId}? This cannot be undone.`)) return;
    await fetchApi(`/admin/tickets/${ticketId}`, { method: "DELETE" }).catch(() => { });
    loadTickets();
  };

  // Open edit modal
  const openEdit = (ticket: any) => {
    setEditTicket(ticket);
    setEditForm({
      subject: ticket.subject || "",
      category: ticket.category || "",
      priority: ticket.priority || "",
      status: ticket.status || "",
      assignee_id: ticket.assignee_id || ticket.assignee?.id || "unassigned",
    });
  };

  // Save edit
  const handleEditSave = async () => {
    if (!editTicket) return;
    setEditSaving(true);
    try {
      await fetchApi(`/admin/tickets/${editTicket.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          subject: editForm.subject || undefined,
          category: editForm.category || undefined,
          priority: editForm.priority || undefined,
          status: editForm.status || undefined,
          assignee_id: editForm.assignee_id === "unassigned" ? "" : editForm.assignee_id,
        }),
      });
      setEditTicket(null);
      loadTickets();
    } catch (e) {
      console.error(e);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <AppShell variant="admin" user={user}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage, assign, and track all IT support requests across the organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets, requesters..."
              className="h-10 w-72 rounded-xl pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl" onClick={handleExport}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card shadow-soft">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
          <span className="inline-flex items-center gap-1 rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-medium">
            <FilterIcon className="h-3.5 w-3.5" /> Filters:
          </span>
          <Filter label="Status" value={statusFilter} onChange={setStatusFilter} options={["Open", "In Progress", "Pending User", "Pending Approval", "Resolved"]} />
          <Filter label="Priority" value={priorityFilter} onChange={setPriorityFilter} options={["CRITICAL", "HIGH", "MEDIUM", "LOW"]} />
          <Filter label="Category" value={categoryFilter} onChange={setCategoryFilter} options={["Hardware", "Software", "Network", "Access", "Infrastructure", "Escalated"]} />
        </div>

        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
          <span>Showing 1–{filteredTickets.length} of {filteredTickets.length}</span>
          <Button variant="outline" size="sm" className="ml-auto h-7 rounded-lg">‹</Button>
          <Button variant="outline" size="sm" className="h-7 rounded-lg">›</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Ticket ID</th>
                <th className="px-5 py-3 font-medium">Subject &amp; Requester</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Assignee</th>
                <th className="px-5 py-3 font-medium">SLA</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="transition hover:bg-muted/30">
                  <td className="px-5 py-4 font-mono text-xs font-medium">
                    <Link to="/admin/tickets/$ticketId" params={{ ticketId: t.id }} className="hover:text-brand-700">
                      #{t.id}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium">{t.subject}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="bg-gradient-brand text-[8px] text-primary-foreground">
                          {t.user_id ? t.user_id.slice(-2) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      {t.user_id}
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-4"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-5 py-4">
                    {t.assignee ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-gradient-brand text-[8px] text-primary-foreground">
                            {t.assignee.name?.split(" ").map((n: string) => n[0]).join("") || "B"}
                          </AvatarFallback>
                        </Avatar>
                        {t.assignee.name?.split(" ")[0] || "Auto"}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <SlaCell ticket={t} />
                  </td>
                  <td className="px-5 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openEdit(t)} className="cursor-pointer">
                          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Ticket
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResolve(t.id)} className="cursor-pointer">
                          <CheckCircle className="mr-2 h-3.5 w-3.5 text-status-resolved-foreground" />
                          Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(t.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Glassmorphism Edit Modal */}
      <Dialog open={!!editTicket} onOpenChange={(open) => { if (!open) setEditTicket(null); }}>
        <DialogContent
          className="sm:max-w-lg border-0 shadow-2xl"
          style={{
            background: "rgba(15, 15, 25, 0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white/90">
              Edit Ticket <span className="font-mono text-brand-400">#{editTicket?.id}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Subject */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                Subject
              </label>
              <Input
                value={editForm.subject}
                onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-brand-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                Category
              </label>
              <Select value={editForm.category} onValueChange={v => setEditForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Hardware", "Software", "Network", "Access", "Infrastructure", "Development", "Escalated", "General"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  Priority
                </label>
                <Select value={editForm.priority} onValueChange={v => setEditForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["P1 - CRITICAL", "P2 - HIGH", "P3 - MEDIUM", "P4 - LOW"].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  Status
                </label>
                <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Open", "In Progress", "Pending User", "Resolved", "On Hold"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assign Technician */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                Assign Technician
              </label>
              <Select
                value={editForm.assignee_id}
                onValueChange={v => setEditForm(f => ({ ...f, assignee_id: v }))}
              >
                <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Select technician..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {technicians.map((tech: any) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditTicket(null)}
              className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={editSaving}
              className="rounded-xl"
            >
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Filter({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto gap-1 rounded-lg bg-card text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function SlaCell({ ticket }: { ticket: any }) {
  if (ticket.status === "Resolved") {
    return <span className="text-xs font-medium text-status-resolved-foreground">Met (2m)</span>;
  }
  const remaining = ticket.sla_remaining_min ?? 135;
  const target = ticket.sla_target_min ?? 480;
  const pct = Math.max(0, Math.min(100, (remaining / target) * 100));
  const critical = pct < 25;
  const label = remaining < 60 ? `${remaining}m remaining` : `${Math.floor(remaining / 60)}h ${remaining % 60}m`;
  return (
    <div className="space-y-1">
      <div className={`text-xs font-medium ${critical ? "text-status-critical-foreground" : "text-foreground"}`}>
        {critical && "● "}{label}
      </div>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${critical ? "bg-status-critical-foreground" : "bg-brand-700"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
