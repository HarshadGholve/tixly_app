import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { ListChecks, Search, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/technician/tickets")({
  head: () => ({
    meta: [
      { title: "My Tickets — Tixly" },
      { name: "description", content: "View and manage all tickets assigned to you." },
    ],
  }),
  component: TechnicianTicketsPage,
});

function TechnicianTicketsPage() {
  const [user, setUser] = useState({ name: "Loading...", email: "Loading..." });
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/auth/me")
      .then((u) => setUser({ name: u.name, email: u.email }))
      .catch(() => {});
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const res = await fetchApi("/technician/tickets").catch(() => ({ tickets: [] }));
    setTickets(res.tickets);
  };

  const updateStatus = async (ticketId: string, newStatus: string) => {
    setUpdating(ticketId);
    try {
      await fetchApi(`/technician/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)),
      );
      toast.success(`Ticket ${ticketId} updated to ${newStatus}`);
    } catch (e: any) {
      toast.error("Failed to update ticket");
    }
    setUpdating(null);
  };

  const filtered = tickets.filter((t) => {
    const matchFilter = filter === "all" || t.status === filter;
    const matchSearch =
      !search ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.id?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <AppShell variant="technician" user={{ name: user.name, subtitle: user.email }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Assigned Tickets</h1>
          <p className="text-sm text-muted-foreground">
            {tickets.length} total tickets · {tickets.filter((t) => t.status === "Open").length} open
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full rounded-xl border border-border/60 bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-700"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[150px] rounded-xl">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <section className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Ticket ID</th>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Priority</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  <ListChecks className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">No tickets match your filters.</p>
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-brand-700">
                    <Link to={`/tickets/${t.id}`} className="hover:underline">
                      {t.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 max-w-[250px] truncate">{t.subject}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-6 py-4">
                    {t.status === "Open" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-xs h-7"
                        disabled={updating === t.id}
                        onClick={() => updateStatus(t.id, "In Progress")}
                      >
                        {updating === t.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Start Work"
                        )}
                      </Button>
                    )}
                    {t.status === "In Progress" && (
                      <Button
                        size="sm"
                        className="rounded-lg text-xs h-7 bg-status-resolved-foreground hover:bg-status-resolved-foreground/90"
                        disabled={updating === t.id}
                        onClick={() => updateStatus(t.id, "Resolved")}
                      >
                        {updating === t.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Resolve
                          </>
                        )}
                      </Button>
                    )}
                    {t.status === "Resolved" && (
                      <span className="text-[10px] text-muted-foreground">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const p = priority?.toUpperCase() ?? "";
  const cls = p.includes("CRITICAL")
    ? "bg-status-critical text-status-critical-foreground"
    : p.includes("HIGH")
      ? "bg-status-warning text-status-warning-foreground"
      : p.includes("MEDIUM")
        ? "bg-brand-200 text-brand-800"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {priority ?? "—"}
    </span>
  );
}
