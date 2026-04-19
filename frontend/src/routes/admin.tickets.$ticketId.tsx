import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { automationLogs } from "@/lib/mock-data";
import { fetchApi } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Share2,
  MessageSquare,
  Sparkles,
  Lock,
  Send,
  Paperclip,
  ListChecks,
  Mail,
  Phone,
  MapPin,
  Check,
  Loader2,
  Bot,
} from "lucide-react";

export const Route = createFileRoute("/admin/tickets/$ticketId")({
  head: ({ params }) => ({
    meta: [
      { title: `Admin · ${params.ticketId} — Tixly` },
      { name: "description", content: `Admin view for ticket ${params.ticketId}.` },
    ],
  }),
  component: AdminTicketDetail,
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

function AdminTicketDetail() {
  const { ticketId } = Route.useParams();
  const [adminUser, setAdminUser] = useState({ name: "Admin", title: "Administrator" });
  const [ticket, setTicket] = useState<any | null>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssignee, setSavingAssignee] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  useEffect(() => {
    fetchApi("/auth/me").then(u => setAdminUser({ name: u.name, title: u.title || "Administrator" })).catch(() => { });
    fetchApi(`/admin/tickets/${ticketId}`).then(t => {
      setTicket(t);
      setSelectedStatus(t?.status || "");
      setSelectedAssignee(t?.assignee_id || t?.assignee?.id || "unassigned");
      setSelectedPriority(t?.priority || "");
    }).catch(() => { });
    fetchApi("/admin/technicians").then(res => setTechnicians(res.technicians || [])).catch(() => { });
  }, [ticketId]);

  if (!ticket) {
    return (
      <AppShell variant="admin" user={{ name: adminUser.name, subtitle: adminUser.title }}>
        <div className="flex h-[50vh] items-center justify-center">
          <p className="animate-pulse text-muted-foreground">Loading ticket details...</p>
        </div>
      </AppShell>
    );
  }

  const initials = (n: string) => n.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  const created = new Date(ticket.created_at);
  const hoursAgo = Math.max(1, Math.round((Date.now() - created.getTime()) / 3600000));

  const handleStatusSave = async () => {
    setSavingStatus(true);
    await fetchApi(`/admin/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: selectedStatus, priority: selectedPriority }),
    }).catch(() => { });
    setSavingStatus(false);
    // Re-fetch
    fetchApi(`/admin/tickets/${ticketId}`).then(setTicket).catch(() => { });
  };

  const handleAssigneeSave = async (techId: string) => {
    setSelectedAssignee(techId);
    setSavingAssignee(true);
    await fetchApi(`/admin/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({ assignee_id: techId === "unassigned" ? "" : techId }),
    }).catch(() => { });
    setSavingAssignee(false);
    fetchApi(`/admin/tickets/${ticketId}`).then(setTicket).catch(() => { });
  };

  const requesterName = ticket.requester?.name || ticket.user_id || "Unknown User";

  return (
    <AppShell variant="admin" user={{ name: adminUser.name, subtitle: adminUser.title }}>
      {/* Header bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <Link to="/admin/tickets" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">#{ticket.id}: {ticket.subject}</h1>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>🕒 Created {hoursAgo} hours ago</span>
              <span>·</span>
              <span>{ticket.category}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            <Share2 className="mr-1 h-3.5 w-3.5" /> Share
          </Button>
          <Button size="sm" className="rounded-xl">
            <MessageSquare className="mr-1 h-3.5 w-3.5" /> Open in Chatbot
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
        {/* LEFT: Properties + SLA + Requester */}
        <aside className="space-y-4">
          <Card title="Properties">
            <Field label="Status">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Open", "In Progress", "Pending User", "Resolved", "On Hold"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="h-9 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["P1 - CRITICAL", "P2 - HIGH", "P3 - MEDIUM", "P4 - LOW"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Assign Technician">
              <Select
                value={selectedAssignee}
                onValueChange={handleAssigneeSave}
                disabled={savingAssignee}
              >
                <SelectTrigger className="h-9 rounded-lg">
                  <SelectValue placeholder="Select technician...">
                    {savingAssignee ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                      </span>
                    ) : (
                      technicians.find(t => t.id === selectedAssignee)?.name ||
                      ticket.assignee?.name ||
                      "Unassigned"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Button
              size="sm"
              className="mt-1 w-full rounded-lg"
              onClick={handleStatusSave}
              disabled={savingStatus}
            >
              {savingStatus ? (
                <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Saving...</>
              ) : (
                <><Check className="mr-1 h-3.5 w-3.5" />Apply Changes</>
              )}
            </Button>
          </Card>

          <Card title="SLA Status" titleAction={<button className="text-[10px] font-medium text-brand-700 hover:underline">Override</button>}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-status-critical text-status-critical-foreground font-bold">
                45m
              </div>
              <div>
                <div className="text-sm font-semibold">First Response</div>
                <div className="text-xs text-status-critical-foreground">Breaching soon</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <Row label="Target" value="15m" />
              <Row label="Elapsed" value="12m" />
            </div>
          </Card>

          <Card title="Requester">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs">
                  {initials(requesterName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold">{requesterName}</div>
                <div className="text-[11px] text-muted-foreground">
                  {ticket.requester?.title ?? "Company Employee"}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <ContactRow icon={<Mail className="h-3 w-3" />} value={ticket.requester?.email || ticket.user_id} link />
              <ContactRow icon={<Phone className="h-3 w-3" />} value="+1 (555) 123-4567" />
              <ContactRow icon={<MapPin className="h-3 w-3" />} value="Remote" />
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Tickets
              </div>
              <div className="mt-2 space-y-1">
                <RecentTicket id="#REQ-9332" status="Resolved" />
                <RecentTicket id="#INC-7821" status="Resolved" subject="Password..." />
              </div>
            </div>
          </Card>
        </aside>

        {/* CENTER: Conversation */}
        <div className="space-y-4">
          <div className="flex items-center gap-1 border-b border-border/60">
            <Tab active>Conversation</Tab>
            <Tab>Internal Notes (2)</Tab>
            <Tab>Audit Log</Tab>
          </div>

          <div className="space-y-4">
            {ticket.history?.length > 0 ? (
              ticket.history.map((msg: any, i: number) => (
                msg.role === "bot" || msg.role === "system" ? (
                  <ConvMessage
                    key={i}
                    who={msg.role === "system" ? "System Alert" : "Tixly Bot"}
                    when={new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    internal={msg.role === "system"}
                    icon={<Lock className="h-3 w-3" />}
                    content={msg.content}
                  />
                ) : (
                  <ConvMessage
                    key={i}
                    who={requesterName}
                    when={new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    initials={initials(requesterName)}
                    content={msg.content}
                  />
                )
              ))
            ) : (
              <ConvMessage
                who={requesterName}
                when={new Date(ticket.created_at).toLocaleString()}
                initials={initials(requesterName)}
                content={ticket.subject}
              />
            )}
          </div>

          {/* Reply box */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
            <div className="flex items-center gap-1 border-b border-border/60 pb-2">
              <Tab active small>Public Reply</Tab>
              <Tab small>Internal Note</Tab>
            </div>
            <textarea
              placeholder="Type your response... Use @ to mention someone"
              rows={3}
              className="mt-3 w-full resize-none rounded-xl bg-background p-3 text-sm outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                <button className="rounded-lg p-1.5 hover:bg-muted"><Paperclip className="h-3.5 w-3.5" /></button>
                <button className="rounded-lg p-1.5 hover:bg-muted"><ListChecks className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="open">
                  <SelectTrigger className="h-8 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">● Open</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="rounded-lg"><Send className="mr-1 h-3.5 w-3.5" /> Send</Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: AI Suggestions + Logs */}
        <aside className="space-y-4">
          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-700" /> AI Suggestions
              </span>
            }
          >
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-brand-100 to-brand-200/60 p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Run Automated Playbook</div>
                <span className="rounded-full bg-card px-2 py-0.5 text-[9px] font-bold text-brand-700">
                  98% Match
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Automated repair based on the detected issue category.
              </p>
              <Button size="sm" className="mt-2 h-7 w-full rounded-lg text-xs">
                ▶ Execute Now
              </Button>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Draft Reply</div>
                <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                  AI
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Generate a draft response for this ticket type.
              </p>
            </div>
          </Card>

          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <Bot className="h-4 w-4 text-brand-700" /> Automation Logs
              </span>
            }
          >
            <div className="space-y-3">
              {automationLogs.map((log) => (
                <div key={log.id} className="border-l-2 border-border pl-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold">{log.title}</div>
                    <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{log.detail}</p>
                  {log.status === "success" && (
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-status-resolved-foreground">
                      <Check className="h-2.5 w-2.5" /> Success
                    </div>
                  )}
                  {log.status === "pending" && (
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" /> Waiting...
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="mt-3 w-full rounded-lg border border-border/60 bg-card py-1.5 text-xs font-medium hover:border-brand-700">
              View Full Audit Log
            </button>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

function Card({
  title,
  children,
  titleAction,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  titleAction?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        {titleAction}
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ContactRow({ icon, value, link }: { icon: React.ReactNode; value: string; link?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className={link ? "text-brand-700" : ""}>{value}</span>
    </div>
  );
}

function RecentTicket({ id, status, subject }: { id: string; status: "Resolved"; subject?: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 text-[11px]">
      <span className="font-mono text-muted-foreground">{id} {subject && <span className="ml-1">{subject}</span>}</span>
      <span className="font-medium text-status-resolved-foreground">{status}</span>
    </div>
  );
}

function Tab({
  children,
  active,
  small,
}: {
  children: React.ReactNode;
  active?: boolean;
  small?: boolean;
}) {
  const size = small ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      className={`${size} font-medium transition-colors ${active ? "border-b-2 border-brand-700 text-brand-700" : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {children}
    </button>
  );
}

function ConvMessage({
  who,
  when,
  initials,
  content,
  internal,
  icon,
}: {
  who: string;
  when: string;
  initials?: string;
  content: string;
  internal?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`flex gap-3 rounded-2xl p-4 ${internal ? "bg-status-warning/40" : "bg-card"} shadow-soft`}>
      {initials ? (
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs">{initials}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="grid h-9 w-9 place-items-center rounded-full bg-status-warning text-status-warning-foreground">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{who}</span>
          {internal && (
            <span className="rounded-md bg-status-warning-foreground/20 px-1.5 py-0.5 text-[10px] font-medium text-status-warning-foreground">
              Internal Note
            </span>
          )}
          <span className="ml-auto text-[11px] text-muted-foreground">{when}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function SystemNote({ text }: { text: string }) {
  return (
    <div className="text-center text-[11px] text-muted-foreground">
      <span className="rounded-full bg-muted px-3 py-1">{text}</span>
    </div>
  );
}
