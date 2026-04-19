import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge, PriorityBadge, normalizePriority } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import {
  Inbox,
  Loader2,
  Clock3,
  CheckCheck,
  Plus,
  Search,
  RefreshCcw,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "My Tickets — Tixly" },
      { name: "description", content: "Manage and track your IT support requests." },
    ],
  }),
  component: MyTickets,
});

/** Priority rank for sorting: lower number = higher priority */
const PRIORITY_RANK: Record<string, number> = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

function MyTickets() {
  const [user, setUser] = useState({ name: "Loading...", email: "Loading..." });
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [summary, setSummary] = useState({
    total: 0,
    inProgress: 0,
    pendingUser: 0,
    resolved30d: 0,
  });

  useEffect(() => {
    fetchApi("/auth/me").then(u => setUser({ name: u.name, email: u.email })).catch(() => { });
    fetchApi("/tickets/my").then(res => {
      setMyTickets(res.tickets);
      setSummary({
        total: res.total_count,
        inProgress: res.tickets.filter((t: any) => t.status === "In Progress").length,
        pendingUser: res.tickets.filter((t: any) => t.status === "Pending User").length,
        resolved30d: res.tickets.filter((t: any) => t.status === "Resolved").length
      });
    }).catch(() => { });
  }, []);

  const filteredTickets = useMemo(() => {
    return myTickets
      .filter(t => {
        const matchSearch = !searchQuery || t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase());
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
  }, [myTickets, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  return (
    <AppShell variant="user" user={{ name: user.name, subtitle: user.email }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage and track your IT support requests.</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link to="/chatbot">
            <Plus className="mr-1 h-4 w-4" /> New Ticket
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Inbox className="h-5 w-5" />} label="Total Tickets" value={summary.total} />
        <StatCard icon={<Loader2 className="h-5 w-5" />} label="In Progress" value={summary.inProgress} />
        <StatCard icon={<Clock3 className="h-5 w-5" />} label="Pending User" value={summary.pendingUser} />
        <StatCard icon={<CheckCheck className="h-5 w-5" />} label="Resolved (30d)" value={summary.resolved30d} />
      </div>

      <section className="mt-6 rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 p-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets by ID, title, or keyword..."
              className="h-10 rounded-xl pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Filter label="All Statuses" value={statusFilter} onChange={setStatusFilter} options={["Open", "In Progress", "Pending User", "Resolved"]} />
          <Filter label="All Priorities" value={priorityFilter} onChange={setPriorityFilter} options={["CRITICAL", "HIGH", "MEDIUM", "LOW"]} />
          <Filter label="All Categories" value={categoryFilter} onChange={setCategoryFilter} options={["Hardware", "Software", "Network", "Access", "Infrastructure", "Escalated"]} />
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setPriorityFilter("all"); setCategoryFilter("all"); }}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Ticket ID</th>
                <th className="px-5 py-3 font-medium">Title / Subject</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Last Updated</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="transition hover:bg-muted/30">
                  <td className="px-5 py-4 font-mono text-xs font-medium">{t.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-xs text-muted-foreground">{t.category}</div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-4"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-muted-foreground">
                    {new Date(t.updated_at || t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button asChild variant="ghost" size="icon" className="rounded-lg">
                      <Link to="/tickets/$ticketId" params={{ ticketId: t.id }}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 p-4 text-xs text-muted-foreground">
          <span>Showing 1 to {filteredTickets.length} of {filteredTickets.length} tickets</span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="rounded-lg h-8 w-8 p-0">‹</Button>
            <Button size="sm" className="rounded-lg h-8 w-8 p-0">1</Button>
            <Button size="sm" variant="outline" className="rounded-lg h-8 w-8 p-0">2</Button>
            <Button size="sm" variant="outline" className="rounded-lg h-8 w-8 p-0">3</Button>
            <Button size="sm" variant="outline" className="rounded-lg h-8 w-8 p-0">›</Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Filter({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-[150px] rounded-xl bg-card">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
