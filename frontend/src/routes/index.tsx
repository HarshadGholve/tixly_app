import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  User as UserIcon,
  Crown,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tixly — Resolve IT Tickets Before They Happen" },
      {
        name: "description",
        content:
          "Role-aware IT automation chatbot that handles requests, predicts issues, and enforces SLAs—empowering users and freeing up admins.",
      },
      { property: "og:title", content: "Tixly — Resolve IT Tickets Before They Happen" },
      {
        property: "og:description",
        content:
          "Intelligent ticketing dashboard with chatbot triage, SLA tracking, and AI-driven automation.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Logo size="md" />
          <span className="rounded-md bg-brand-200 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl">
            <Link to="/signup">Sign Up Free</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pt-10 pb-16 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-brand-700 shadow-soft backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          Automation Engine Live
        </div>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          Resolve IT Tickets
          <br />
          <span className="bg-gradient-to-r from-brand-700 via-primary to-brand-600 bg-clip-text text-transparent">
            Before They Happen
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          The role aware IT automation chatbot that handles requests, predicts issues, and
          enforces SLAs empowering users and freeing up admins.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-xl shadow-glow">
            <Link to="/signup">
              Start Automating Now
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl bg-card">
            {/* <Link to="/login">Continue with Google</Link> */}
          </Button>
        </div>

        {/* Mock chatbot preview */}
        <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-border/60 bg-card/80 p-6 shadow-elevated backdrop-blur">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">IT Support Assistant</div>
                <div className="text-xs text-muted-foreground">Always Online</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-status-resolved-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-status-resolved-foreground" />
              SLA: 99.9%
            </span>
          </div>

          <div className="mt-4 space-y-3 text-left">
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-300 px-4 py-2 text-sm text-foreground">
              I need access to the production database for the Q3 report.
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2 text-sm">
              I can help with that. Based on your role, this requires admin approval.
              <div className="mt-2 rounded-lg border border-border/70 bg-card p-2 text-xs">
                <div className="font-semibold">Ticket #REQ-8362 Created</div>
                <div className="text-muted-foreground">Routed to: Database Team</div>
                <button className="mt-1 text-brand-700 hover:underline">View Ticket Status</button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2">
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Type your request..."
              readOnly
            />
            <button className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-1">Reset Password</span>
            <span className="rounded-full bg-muted px-2 py-1">Software Install</span>
            <span className="rounded-full bg-muted px-2 py-1">VPN Access</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatPill icon={<Zap className="h-5 w-5" />} value="78%" label="Tickets Auto-Resolved" sub="Without human escalation" />
          <StatPill icon={<TrendingUp className="h-5 w-5" />} value="< 2 min" label="Average Response Time" sub="Down from 24 hours" />
          <StatPill icon={<ShieldCheck className="h-5 w-5" />} value="100%" label="SLA Compliance" sub="Automated escalation" />
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Role-Based Access Control</h2>
          <p className="mt-2 text-muted-foreground">
            Tailored experiences and permissions depending on your role within the organization.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <RoleCard
            icon={<UserIcon className="h-5 w-5" />}
            title="Standard User"
            subtitle="Self-service & ticket tracking"
            features={[
              "Chatbot-driven instant issue resolution",
              "Create and track personal tickets",
              "Access to knowledge base articles",
              "Automated software request workflows",
            ]}
          />
          <RoleCard
            icon={<Crown className="h-5 w-5" />}
            title="IT Administrator"
            subtitle="Full system control & analytics"
            dark
            features={[
              "Manage global ticket queue & assignments",
              "Configure automation workflows & SLAs",
              "Access visual analytics & reporting dashboard",
              "Manage user roles and permissions",
            ]}
          />
        </div>
      </section>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © 2026 Tixly · Secure Authentication
      </footer>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center shadow-soft backdrop-blur">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-brand-200 text-brand-700">
        {icon}
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  subtitle,
  features,
  dark,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  features: string[];
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? "rounded-2xl border border-foreground/10 bg-foreground p-6 text-background shadow-elevated"
          : "rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={
            dark
              ? "grid h-10 w-10 place-items-center rounded-xl bg-background/10 text-background"
              : "grid h-10 w-10 place-items-center rounded-xl bg-brand-200 text-brand-700"
          }
        >
          {icon}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className={dark ? "text-xs text-background/60" : "text-xs text-muted-foreground"}>
            {subtitle}
          </div>
        </div>
      </div>
      <ul className="mt-5 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2
              className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-status-resolved" : "text-status-resolved-foreground"}`}
            />
            <span className={dark ? "text-background/90" : ""}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
