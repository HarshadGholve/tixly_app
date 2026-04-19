import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  ArrowLeft,
  Download,
  Check,
  Send,
  Paperclip,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Clock3,
} from "lucide-react";

export const Route = createFileRoute("/tickets/$ticketId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.ticketId} — Tixly` },
      { name: "description", content: `Details and activity for ticket ${params.ticketId}.` },
    ],
  }),
  component: TicketDetail,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <p className="text-lg font-semibold">Ticket not found</p>
        <Link to="/tickets" className="text-brand-700 hover:underline">Back to tickets</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="text-center">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => router.invalidate()} className="mt-4 rounded-xl">Retry</Button>
        </div>
      </div>
    );
  },
});

function TicketDetail() {
  const { ticketId } = Route.useParams();
  const [user, setUser] = useState({ name: "Loading...", email: "Loading..." });
  const [ticketState, setTicketState] = useState<{ ticket: any; messages: any[] } | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchApi("/auth/me").then(u => setUser({ name: u.name, email: u.email })).catch(() => { });
    fetchApi(`/tickets/${ticketId}`).then(setTicketState).catch(() => { });
  }, [ticketId]);

  if (!ticketState) {
    return (
      <AppShell variant="user" user={{ name: user.name, subtitle: user.email }}>
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading ticket details...</p>
        </div>
      </AppShell>
    );
  }

  const { ticket, messages } = ticketState;

  const initials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AA";

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await fetchApi(`/tickets/${ticketId}/reply`, {
        method: "POST",
        body: JSON.stringify({ message: replyText })
      });
      setReplyText("");
      // re-fetch implicitly 
      const updated = await fetchApi(`/tickets/${ticketId}`);
      setTicketState(updated);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell variant="user" user={{ name: user.name, subtitle: user.email }}>
      <div className="mb-2 flex items-center gap-3 text-xs">
        <Link to="/tickets" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Tickets
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono font-medium">{ticket.id}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl">
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
          <Button className="rounded-xl">
            <Check className="mr-1 h-4 w-4" /> Close Ticket
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Properties */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 sm:grid-cols-4">
            <Prop label="Status" value={<StatusBadge status={ticket.status} />} />
            <Prop label="Priority" value={<PriorityBadge priority={ticket.priority} />} />
            <Prop label="Category" value={ticket.category} />
            <Prop
              label="SLA Target"
              value={
                <span className="inline-flex items-center gap-1.5 text-status-progress-foreground">
                  <Clock3 className="h-3.5 w-3.5" /> 4h 12m remaining
                </span>
              }
            />
          </div>

          {/* Description */}
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{ticket.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Attachment name="error_screenshot.png" />
              <Attachment name="system_logs.txt" />
            </div>
          </section>

          {/* Activity */}
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold">Activity & Updates</h2>
            <div className="mt-5 space-y-5">
              {messages?.map((msg: any, i: number) => (
                <Reply
                  key={i}
                  name={msg.role === "user" ? user.name : ticket.assignee?.name || "Tixly Bot"}
                  role={msg.role === "user" ? "Requester" : "Support Agent"}
                  time={new Date(msg.timestamp || ticket.created_at).toLocaleString()}
                  initials={initials(msg.role === "user" ? user.name : ticket.assignee?.name || "Bot")}
                  content={msg.content}
                  self={msg.role === "user"}
                />
              ))}
            </div>
          </section>

          {/* Reply */}
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <textarea
              placeholder="Type your reply here..."
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full resize-none rounded-xl border border-border/60 bg-background p-3 text-sm outline-none focus:border-brand-700"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <button className="rounded-lg p-1.5 hover:bg-muted"><Paperclip className="h-4 w-4" /></button>
                <button className="rounded-lg p-1.5 hover:bg-muted"><ImageIcon className="h-4 w-4" /></button>
              </div>
              <Button onClick={handleReply} className="rounded-xl"><Send className="mr-1 h-4 w-4" /> Send Reply</Button>
            </div>
          </section>
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned To
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs">
                  {ticket.assignee ? initials(ticket.assignee.name) : "—"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold">{ticket.assignee?.name ?? "Unassigned"}</div>
                <div className="text-xs text-muted-foreground">{ticket.assignee?.title ?? "—"}</div>
              </div>
            </div>
          </div>

          <div className="flex h-[480px] flex-col rounded-2xl border border-border/60 bg-card shadow-soft">
            <div className="border-b border-border/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-brand-700" /> Ask Tixly
              </div>
              <div className="text-[11px] text-muted-foreground">Contextual help for this ticket</div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              <div className="rounded-xl bg-muted/60 p-3 text-xs">
                I see you're having VPN issues after an OS update. Would you like me to guide you through a quick
                client re-installation while you wait for Michael?
              </div>
              {["Yes, show me how to reinstall", "What is the typical resolution time?", "Escalate this ticket"].map(
                (q) => (
                  <button
                    key={q}
                    className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-left text-xs hover:border-brand-700 hover:text-brand-700"
                  >
                    {q}
                  </button>
                ),
              )}
            </div>
            <div className="border-t border-border/60 p-3">
              <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs">
                <input
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                />
                <Send className="h-3.5 w-3.5 text-brand-700" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Prop({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-card p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}

function Attachment({ name }: { name: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs">
      <FileText className="h-3.5 w-3.5 text-brand-700" /> {name}
    </div>
  );
}

function ActivityRow({
  icon,
  title,
  role,
  time,
  content,
  muted,
}: {
  icon: React.ReactNode;
  title: string;
  role?: string;
  time: string;
  content: string;
  muted?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-200 text-brand-700">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-semibold">
            {title} {role && <span className="ml-1 text-[10px] font-medium text-muted-foreground">{role}</span>}
          </div>
          <div className="text-[10px] text-muted-foreground">{time}</div>
        </div>
        <p className={muted ? "mt-1 text-xs text-muted-foreground" : "mt-1 text-sm"}>{content}</p>
      </div>
    </div>
  );
}

function Reply({
  name,
  role,
  time,
  initials,
  content,
  self,
}: {
  name: string;
  role?: string;
  time: string;
  initials: string;
  content: string;
  self?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className={self ? "bg-brand-300 text-brand-700 text-xs" : "bg-gradient-brand text-primary-foreground text-xs"}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-semibold">
            {name} {role && <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{role}</span>}
          </div>
          <div className="text-[10px] text-muted-foreground">{time}</div>
        </div>
        <div className={`mt-1 rounded-2xl px-4 py-3 text-sm ${self ? "bg-brand-100" : "bg-muted/60"}`}>
          {content}
        </div>
      </div>
    </div>
  );
}
