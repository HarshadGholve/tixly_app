import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  trendData,
  systemAlerts,
} from "@/lib/mock-data";
import {
  Inbox,
  Bot,
  ShieldCheck,
  Layers,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ListChecks,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Tixly" },
      { name: "description", content: "IT operations analytics, ticket volume, automation success, and SLA compliance." },
    ],
  }),
  component: AdminDashboard,
});

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function AdminDashboard() {
  const [user, setUser] = useState({ name: "Loading...", subtitle: "Loading..." });
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    autoResolved: 0,
    slaMet: 0,
    activeBacklog: 0,
    highPriority: 0,
    normalPriority: 0,
    volumeDelta: 0,
    autoDelta: 0,
    slaDelta: 0,
    categories: [] as any[],
  });
  const [backlog, setBacklog] = useState<any[]>([]);

  useEffect(() => {
    fetchApi("/auth/me").then(u => {
      if (u.role === "User") {
        window.location.replace("/dashboard");
      } else {
        setUser({ name: u.name, subtitle: u.title || "Admin" });
      }
    }).catch(() => { });
    fetchApi("/tickets/admin/metrics").then(setMetrics).catch(() => { });
    fetchApi("/tickets/admin/backlog").then(setBacklog).catch(() => { });
  }, []);

  return (
    <AppShell variant="admin" user={user}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IT Operations Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Overview of ticket volume, automation success, and SLA compliance.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5" /> Last 30 Days
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Inbox className="h-5 w-5" />}
          label="Total Volume"
          value={metrics.totalVolume.toLocaleString()}
          trend={{ value: `${metrics.volumeDelta}%`, direction: "up", positive: true }}
        />
        <StatCard
          icon={<Bot className="h-5 w-5" />}
          label="Auto-Resolved"
          value={`${metrics.autoResolved}%`}
          trend={{ value: `${metrics.autoDelta}%`, direction: "up", positive: true }}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="SLA Met"
          value={`${metrics.slaMet}%`}
          trend={{ value: `${Math.abs(metrics.slaDelta)}%`, direction: "down", positive: false }}
        />
        <StatCard
          icon={<Layers className="h-5 w-5" />}
          label="Active Backlog"
          value={metrics.activeBacklog}
          footer={
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">High Priority</span>
                <span className="font-semibold text-status-critical-foreground">{metrics.highPriority}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-status-critical-foreground/70"
                  style={{ width: metrics.activeBacklog > 0 ? `${(metrics.highPriority / metrics.activeBacklog) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Normal Priority</span>
                <span className="font-semibold">{metrics.normalPriority}</span>
              </div>
            </div>
          }
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Volume Trends & Resolution</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <LegendDot color="var(--color-chart-1)" label="Human" />
              <LegendDot color="var(--color-chart-3)" label="Bot" />
            </div>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="human" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="Human" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#human)" />
                <Area type="monotone" dataKey="Bot" stroke="var(--color-chart-3)" strokeWidth={2} fill="url(#bot)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Tickets by Category</h2>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categories.length > 0 ? metrics.categories : [{ name: "No Data", value: 100 }]}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="var(--color-card)"
                  strokeWidth={3}
                >
                  {metrics.categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2 text-sm">
            {metrics.categories.map((c, i) => (
              <li key={c.name} className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {c.name}
                </span>
                <span className="text-xs font-semibold">{c.value}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Queue Backlog</h2>
            <Link to="/admin/tickets" className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
              View All Queues <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Queue Name</th>
                <th className="pb-3 font-medium">Assignee</th>
                <th className="pb-3 font-medium">Open</th>
                <th className="pb-3 font-medium">SLA Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {backlog.map((q) => (
                <tr key={q.queue}>
                  <td className="py-3 font-medium">{q.queue}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-brand text-[10px] text-primary-foreground">
                          {q.assignee.name.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{q.assignee.name.split(" ")[0]} {q.assignee.name.split(" ")[1]?.[0]}.</span>
                    </div>
                  </td>
                  <td className="py-3 font-semibold">{q.open}</td>
                  <td className="py-3">
                    <RiskBadge risk={q.slaRisk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-status-critical-foreground" /> System Alerts
            </h2>
            <div className="mt-3 space-y-3">
              {systemAlerts.map((a) => (
                <Alert
                  key={a.id}
                  icon={a.severity === "critical" ? <AlertTriangle className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  title={a.title}
                  detail={a.detail}
                  severity={a.severity}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold">Quick Actions</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/admin/tickets" className="rounded-xl border border-border/60 bg-muted/40 p-4 text-center text-xs font-medium transition hover:border-brand-700">
                <ListChecks className="mx-auto mb-1 h-4 w-4 text-brand-700" /> View All Tickets
              </Link>
              <button className="rounded-xl border border-border/60 bg-muted/40 p-4 text-center text-xs font-medium transition hover:border-brand-700">
                <Users className="mx-auto mb-1 h-4 w-4 text-brand-700" /> Manage Queues
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}

function RiskBadge({ risk }: { risk: "3 Critical" | "1 Warning" | "Healthy" }) {
  const cls =
    risk === "3 Critical"
      ? "bg-status-critical text-status-critical-foreground"
      : risk === "1 Warning"
        ? "bg-status-warning text-status-warning-foreground"
        : "bg-status-resolved text-status-resolved-foreground";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" /> {risk}
    </span>
  );
}

function Alert({
  icon,
  title,
  detail,
  severity,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  severity: "critical" | "info";
}) {
  const cls = severity === "critical" ? "bg-status-critical/40" : "bg-brand-200/60";
  const iconCls = severity === "critical" ? "text-status-critical-foreground" : "text-brand-700";
  return (
    <div className={`rounded-xl p-3 ${cls}`}>
      <div className="flex items-start gap-2">
        <span className={iconCls}>{icon}</span>
        <div>
          <div className="text-xs font-semibold">{title}</div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  );
}
