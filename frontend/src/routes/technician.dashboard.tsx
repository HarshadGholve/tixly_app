import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  Inbox,
  Loader2,
  CheckCheck,
  AlertTriangle,
  Wrench,
  Clock,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";

export const Route = createFileRoute("/technician/dashboard")({
  head: () => ({
    meta: [
      { title: "Technician Dashboard — Tixly" },
      { name: "description", content: "Manage your assigned IT tickets, view metrics, and track performance." },
    ],
  }),
  component: TechnicianDashboard,
});

function TechnicianDashboard() {
  const [user, setUser] = useState({ name: "Loading...", email: "Loading..." });
  const [metrics, setMetrics] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await fetchApi("/auth/me").catch(() => ({
          name: "Technician",
          email: "tech@local",
          role: "Technician",
        }));
        if (u.role === "User") {
          window.location.replace("/dashboard");
          return;
        }
        if (u.role === "Admin") {
          window.location.replace("/admin");
          return;
        }
        setUser({ name: u.name, email: u.email });

        const dash = await fetchApi("/technician/dashboard").catch(() => null);
        if (dash) setMetrics(dash.metrics);

        const tixRes = await fetchApi("/technician/tickets").catch(() => ({ tickets: [] }));
        setTickets(tixRes.tickets.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <AppShell variant="technician" user={{ name: user.name, subtitle: user.email }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technician Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your assigned tickets, workload, and performance at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            suppressHydrationWarning
            className="rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground"
          >
            📅 Today, {new Date().toLocaleDateString()}
          </span>
          <Button asChild className="rounded-xl">
            <Link to="/technician/tickets">View All Tickets</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Inbox className="h-5 w-5" />}
          label="Assigned to Me"
          value={metrics?.total_assigned ?? "—"}
          badge={
            metrics?.high_priority > 0 ? (
              <span className="rounded-full bg-status-critical px-2 py-0.5 text-[10px] font-medium text-status-critical-foreground">
                {metrics.high_priority} High Priority
              </span>
            ) : undefined
          }
        />
        <StatCard icon={<Loader2 className="h-5 w-5" />} label="In Progress" value={metrics?.in_progress ?? "—"} />
        <StatCard icon={<CheckCheck className="h-5 w-5" />} label="Resolved" value={metrics?.resolved ?? "—"} />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Resolution Rate"
          value={`${metrics?.resolution_rate ?? 0}%`}
          badge={
            <span className="rounded-full bg-status-resolved px-2 py-0.5 text-[10px] font-medium text-status-resolved-foreground">
              Avg {metrics?.avg_resolution_time ?? "—"}
            </span>
          }
        />
      </div>

      {/* Tickets Table + Skills */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Active Tickets</h2>
            <Link
              to="/technician/tickets"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                    No tickets assigned yet. 🎉
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 font-mono text-xs font-semibold text-brand-700">
                      <Link to={`/tickets/${t.id}`} className="hover:underline">
                        {t.id}
                      </Link>
                    </td>
                    <td className="py-3 max-w-[200px] truncate">{t.subject}</td>
                    <td className="py-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <div className="space-y-6">
          {/* Skills Card */}
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-4 w-4 text-brand-700" />
              <h2 className="text-sm font-semibold">My Expertise</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(metrics as any)?.skills?.length > 0
                ? (metrics as any).skills.map((s: string) => <SkillChip key={s}>{s}</SkillChip>)
                : (
                  <>
                    <SkillChip>Network</SkillChip>
                    <SkillChip>Infrastructure</SkillChip>
                    <SkillChip>Hardware</SkillChip>
                  </>
                )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/technician/tickets"
                className="rounded-xl border border-border/60 bg-muted/40 p-4 text-center text-xs font-medium transition hover:border-brand-700"
              >
                <Inbox className="mx-auto mb-1 h-4 w-4 text-brand-700" />
                My Queue
              </Link>
              <Link
                to="/settings"
                className="rounded-xl border border-border/60 bg-muted/40 p-4 text-center text-xs font-medium transition hover:border-brand-700"
              >
                <UserIcon className="mx-auto mb-1 h-4 w-4 text-brand-700" />
                Profile
              </Link>
            </div>
          </section>
        </div>
      </div>
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

function SkillChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-200 to-brand-300 px-3 py-1 text-xs font-medium text-brand-800">
      {children}
    </span>
  );
}
