import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
  Inbox,
  Loader2,
  CheckCheck,
  TimerReset,
  MessageSquare,
  Plus,
  Ticket,
  Lightbulb,
  ArrowRight,
  Wifi,
  KeyRound,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "User Dashboard — Tixly" },
      { name: "description", content: "Overview of your IT requests, SLA compliance, and quick actions." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [user, setUser] = useState({ name: "Loading...", email: "Loading..." });
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await fetchApi("/auth/me").catch(() => ({ name: "Local User", email: "user@local", role: "User" }));
        if (u.role === "Admin") {
          window.location.replace("/admin");
          return;
        }
        setUser({ name: u.name, email: u.email });

        const s = await fetchApi("/tickets/summary").catch(() => ({ open: 0, inProgress: 0, resolved: 0 }));
        setStats(s);

        const m = await fetchApi("/tickets/my").catch(() => ({ tickets: [] }));
        setActivities(m.tickets.slice(-3).reverse());
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <AppShell variant="user" user={{ name: user.name, subtitle: user.email }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="flex items-center gap-2">
          <span suppressHydrationWarning className="rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground">
            📅 Today, {new Date().toLocaleDateString()}
          </span>
          <Button asChild className="rounded-xl">
            <Link to="/chatbot">Create Ticket</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Inbox className="h-5 w-5" />}
          label="Open Tickets"
          value={stats.open}
          badge={
            <span className="rounded-full bg-status-warning px-2 py-0.5 text-[10px] font-medium text-status-warning-foreground">
              Requires Action
            </span>
          }
        />
        <StatCard icon={<Loader2 className="h-5 w-5" />} label="In-Progress" value={stats.inProgress} />
        <StatCard icon={<CheckCheck className="h-5 w-5" />} label="Resolved (30 days)" value={stats.resolved} />
        <StatCard
          icon={<TimerReset className="h-5 w-5" />}
          label="SLA Compliance"
          value={`98%`}
          badge={
            <span className="rounded-full bg-status-resolved px-2 py-0.5 text-[10px] font-medium text-status-resolved-foreground">
              On Track
            </span>
          }
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <QuickAction to="/chatbot" icon={<MessageSquare className="h-5 w-5" />} title="Start Chatbot" sub="Get instant automated help" />
              <QuickAction to="/chatbot" icon={<Plus className="h-5 w-5" />} title="Create Ticket" sub="Submit a new request" />
              <QuickAction to="/tickets" icon={<Ticket className="h-5 w-5" />} title="View My Tickets" sub="Check status & updates" />
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft opacity-90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Recommended Automation Tips</h2>
                <span className="rounded-full bg-brand-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-800 shadow-sm">
                  Sneak Peek ✨
                </span>
              </div>
              <Lightbulb className="h-4 w-4 text-brand-700" />
            </div>
            <div className="mt-4 space-y-3">
              <Tip
                icon={<KeyRound className="h-4 w-4" />}
                title="Automate Password Resets"
                badge="Coming Soon"
                desc="Did you know you can reset your AD password instantly using the chatbot? No wait time required."
                cta="Notify Me"
              />
              <Tip
                icon={<Wifi className="h-4 w-4" />}
                title="Guest Wi-Fi Access"
                badge="In Development"
                desc="Generate temporary guest Wi-Fi credentials in seconds through the automated portal."
                cta="Join Waitlist"
              />
              <Tip
                icon={<Mail className="h-4 w-4" />}
                title="Email Notifications"
                badge="Coming Soon"
                desc="Get instant email alerts when your tickets are created, updated, or resolved."
                cta="Enable Alerts"
              />
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link to="/tickets" className="text-xs font-medium text-brand-700 hover:underline">
              View All
            </Link>
          </div>
          <ol className="mt-4 space-y-4">
            {activities.length === 0 ? (
              <li className="text-xs text-muted-foreground">No recent activity.</li>
            ) : (
              activities.map(a => (
                <ActivityItem
                  key={a.id}
                  when={new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  title={a.status === 'Resolved' ? "Ticket Resolved" : "Ticket Created"}
                  detail={`${a.subject} (${a.id})`}
                  dot={a.status === 'Resolved' ? "resolved" : "info"}
                />
              ))
            )}
          </ol>
        </section>
      </div>
    </AppShell>
  );
}

function QuickAction({
  to,
  icon,
  title,
  sub,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border/60 bg-gradient-to-br from-brand-100 to-brand-200/60 p-5 text-center transition-all hover:shadow-elevated"
    >
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-card text-brand-700 shadow-soft">
        {icon}
      </div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </Link>
  );
}

function Tip({
  icon,
  title,
  desc,
  cta,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  badge?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-200 text-brand-700">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">{title}</div>
            {badge && (
              <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
          <button className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
            {cta} <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  when,
  title,
  detail,
  dot = "default",
}: {
  when: string;
  title: string;
  detail: string;
  dot?: "default" | "resolved" | "info";
}) {
  const dotClass =
    dot === "resolved"
      ? "bg-status-resolved text-status-resolved-foreground"
      : dot === "info"
        ? "bg-status-progress text-status-progress-foreground"
        : "bg-brand-300 text-brand-700";
  return (
    <li className="flex gap-3">
      <span className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full ${dotClass} text-[10px]`}>
        ●
      </span>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[10px] text-muted-foreground">{when}</div>
        </div>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}
