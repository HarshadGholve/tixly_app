import { useEffect, useRef, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter, createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bot,
  Send,
  Paperclip,
  KeyRound,
  Wifi,
  Package,
  Printer,
  Sparkles,
  Check,
  Loader2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  ExternalLink,
  Zap,
  User as UserIcon,
} from "lucide-react";

export const Route = createFileRoute("/chatbot")({
  head: () => ({
    meta: [
      { title: "Chatbot — Tixly" },
      { name: "description", content: "Ask the IT support assistant about VPN, password, software, or hardware issues." },
    ],
  }),
  component: ChatbotPage,
});

interface Msg {
  id: string;
  role: "user" | "bot";
  content: string;
  streaming?: boolean;
  chips?: { icon: React.ReactNode; label: string }[];
  ticketId?: string;
}

interface Extraction {
  category: string;
  system: string;
  priority: string;
  environment: string;
  ready: boolean;
}

interface TicketPopup {
  id: string;
  subject: string;
  priority: string;
  category: string;
  assignee: string;
}

const INITIAL_BOT: Msg = {
  id: "m0",
  role: "bot",
  content: "Hi! I'm your IT Support Assistant. Describe your issue or pick a common request below.",
  chips: [
    { icon: <KeyRound className="h-3 w-3" />, label: "Reset password" },
    { icon: <Wifi className="h-3 w-3" />, label: "VPN issue" },
    { icon: <Package className="h-3 w-3" />, label: "Request software" },
    { icon: <Printer className="h-3 w-3" />, label: "Printer setup" },
  ],
};

function ChatbotPage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "Loading...", email: "Loading..." });

  useEffect(() => {
    fetchApi("/auth/me")
      .then((u) => setUser({ name: u.name, email: u.email }))
      .catch(() => { });
  }, []);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const sessionId = useMemo(() => `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`, []);

  const [messages, setMessages] = useState<Msg[]>([INITIAL_BOT]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [extraction, setExtraction] = useState<Extraction>({
    category: "—",
    system: "—",
    priority: "Medium",
    environment: "—",
    ready: false,
  });

  // LLM Toggle state
  const [llmMode, setLlmMode] = useState<"mock" | "llm">("mock");
  const [llmToggling, setLlmToggling] = useState(false);
  const [llmConfigured, setLlmConfigured] = useState(false);

  // Ticket popup state
  const [ticketPopup, setTicketPopup] = useState<TicketPopup | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch LLM status on mount
  useEffect(() => {
    fetchApi("/llm/status")
      .then((res) => {
        setLlmMode(res.mode);
        setLlmConfigured(res.llm_configured);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const toggleLLM = async () => {
    setLlmToggling(true);
    const newMode = llmMode === "mock" ? "llm" : "mock";
    try {
      const res = await fetchApi("/llm/toggle", {
        method: "POST",
        body: JSON.stringify({ mode: newMode }),
      });
      setLlmMode(res.mode);
    } catch {
      // Stay on current mode
    }
    setLlmToggling(false);
  };

  const showTicketPopup = (ticket: any) => {
    setTicketPopup({
      id: ticket.id,
      subject: ticket.subject || "IT Support Request",
      priority: ticket.priority || "P3 - MEDIUM",
      category: ticket.category || "General",
      assignee: ticket.assignee?.name || "Unassigned",
    });
    // Auto-dismiss after 8 seconds
    setTimeout(() => setTicketPopup(null), 8000);
  };

  const streamBotReply = (full: string, chips?: { icon: React.ReactNode; label: string }[], ticketId?: string) => {
    const id = `b-${Date.now()}`;
    setMessages((m) => [...m, { id, role: "bot", content: "", streaming: true, chips, ticketId }]);
    setIsStreaming(true);
    let i = 0;
    const tick = () => {
      i += Math.max(1, Math.round(full.length / 80));
      const slice = full.slice(0, i);
      setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, content: slice } : msg)));
      if (i < full.length) {
        setTimeout(tick, 25);
      } else {
        setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, streaming: false } : msg)));
        setIsStreaming(false);
      }
    };
    setTimeout(tick, 350);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content: trimmed }]);
    setInput("");

    setIsStreaming(true);

    try {
      const res = await fetchApi("/chat/message", {
        method: "POST",
        body: JSON.stringify({
          chat_id: sessionId,
          message: trimmed
        }),
      });

      if (res.extracted_info) {
        setExtraction((prev) => ({
          category: res.extracted_info.category || prev.category,
          system: res.extracted_info.system || prev.system,
          priority: res.extracted_info.priority || prev.priority,
          environment: res.extracted_info.environment || prev.environment,
          ready: true,
        }));
      }

      setIsStreaming(false);

      const chips = res.suggestions?.map((s: string) => ({
        icon: <Bot className="h-3 w-3" />,
        label: s
      }));

      streamBotReply(res.reply, chips, res.ticket_id || undefined);
    } catch (err: any) {
      setIsStreaming(false);
      streamBotReply("Sorry, I encountered an error connecting to the backend. Please try again.");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <AppShell variant="user" user={{ name: user.name, subtitle: user.email }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IT Support Assistant</h1>
          <p className="text-sm text-muted-foreground">Describe your issue or select a common request below.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-status-resolved-foreground" />
          System Status: Optimal
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-border/60 bg-card shadow-soft">
          {/* Chatbot Header with LLM Toggle */}
          <div className="flex items-center justify-between border-b border-border/60 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Tixly Bot</div>
                <div className="text-xs text-muted-foreground">Powered by AI Automation</div>
              </div>
            </div>
            {/* LLM Toggle */}
            <button
              onClick={toggleLLM}
              disabled={llmToggling || !llmConfigured || messages.length > 1}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium transition-all hover:border-brand-700 disabled:opacity-50"
              title={
                !llmConfigured
                  ? "Groq API not configured"
                  : messages.length > 1
                  ? "Cannot change mode during an active chat"
                  : `Currently: ${llmMode === "llm" ? "Groq AI" : "Mock KB"}`
              }
            >
              {llmToggling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : llmMode === "llm" ? (
                <ToggleRight className="h-4 w-4 text-status-resolved-foreground" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  llmMode === "llm"
                    ? "bg-status-resolved text-status-resolved-foreground"
                    : "bg-status-warning text-status-warning-foreground"
                }`}
              >
                {llmMode === "llm" ? "Groq AI" : "Mock KB"}
              </span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-brand-50 to-card p-5">
            <div suppressHydrationWarning className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">
              Today, {typeof window !== "undefined" ? new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
            </div>

            {messages.map((m) =>
              m.role === "bot" ? (
                <BotMsg key={m.id}>
                  <BotContent content={m.content} streaming={m.streaming} ticketId={m.ticketId} />
                  {m.chips && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.chips.map((c) => (
                        <Chip key={c.label} icon={c.icon} onClick={() => send(c.label)}>
                          {c.label}
                        </Chip>
                      ))}
                    </div>
                  )}
                </BotMsg>
              ) : (
                <UserMsg key={m.id} initials={initials}>
                  {m.content}
                </UserMsg>
              ),
            )}

            {isStreaming && !messages.some(m => m.streaming) && (
              <div className="flex items-start gap-2">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-card px-4 py-4 text-sm shadow-soft">
                  <div className="flex flex-row gap-1.5 items-center h-2">
                    <span className="w-1.5 h-1.5 bg-brand-700/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-700/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-700/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-border/60 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message or upload a screenshot..."
                disabled={isStreaming}
                maxLength={500}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const attachmentText = `[Attached Image: ${file.name}]`;
                    setInput((prev) => prev ? `${prev} ${attachmentText}` : attachmentText);
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              AI can make mistakes. Please verify important information.
            </p>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-brand-700" /> Ticket Extraction
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {extraction.ready ? "Draft" : "Empty"}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              The bot is automatically filling out this ticket based on your conversation.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <ExtractField 
                label="Category" 
                value={extraction.category} 
                pending={!extraction.ready} 
                onChange={(v) => setExtraction({...extraction, category: v})}
                isSelect
                options={["Network", "Hardware", "Software", "Access", "Infrastructure", "Development", "Security", "Email", "Cloud", "Onboarding", "General"]}
              />
              <ExtractField 
                label="Impacted System" 
                value={extraction.system} 
                pending={!extraction.ready} 
                onChange={(v) => setExtraction({...extraction, system: v})}
              />
              <ExtractField
                label="Priority (auto-assessed)"
                value={extraction.priority}
                pending={!extraction.ready}
                onChange={(v) => setExtraction({...extraction, priority: v})}
                isSelect
                options={["P1 - CRITICAL", "P2 - HIGH", "P3 - MEDIUM", "P4 - LOW"]}
              />
              <ExtractField
                label="Environment"
                value={isStreaming && !extraction.ready ? "Analyzing..." : extraction.environment}
                pending={!extraction.ready || isStreaming}
                onChange={(v) => setExtraction({...extraction, environment: v})}
              />
            </div>

            <Button
              className="mt-4 w-full rounded-xl"
              disabled={!extraction.ready}
              onClick={async () => {
                try {
                  const tkt = await fetchApi("/tickets/", {
                    method: "POST",
                    body: JSON.stringify({ subject: `${extraction.system} Issue`, category: extraction.category })
                  });
                  showTicketPopup(tkt);
                } catch (e: any) { }
              }}
            >
              Create Ticket Now
            </Button>
          </div>
        </aside>
      </div>

      {/* Ticket Created Popup */}
      <Dialog open={!!ticketPopup} onOpenChange={(open) => !open && setTicketPopup(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-status-resolved-foreground">
              <CheckCircle2 className="h-5 w-5" /> Ticket Created!
            </DialogTitle>
          </DialogHeader>
          {ticketPopup && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ticket ID</span>
                  <span className="font-mono text-sm font-bold text-brand-700">{ticketPopup.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Subject</span>
                  <span className="text-xs font-medium max-w-[180px] truncate">{ticketPopup.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold">
                    <span className={`h-1.5 w-1.5 rounded-full ${priorityDotFull(ticketPopup.priority)}`} />
                    {ticketPopup.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Category</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{ticketPopup.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Assigned To</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium">
                    <UserIcon className="h-3 w-3" /> {ticketPopup.assignee}
                  </span>
                </div>
              </div>
              <Button
                className="w-full rounded-xl"
                onClick={() => {
                  setTicketPopup(null);
                  router.navigate({ to: `/tickets/${ticketPopup!.id}` });
                }}
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Ticket →
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}



function priorityDotFull(p: string) {
  const up = p.toUpperCase();
  if (up.includes("CRITICAL")) return "bg-status-critical-foreground";
  if (up.includes("HIGH")) return "bg-status-warning-foreground";
  if (up.includes("MEDIUM")) return "bg-brand-700";
  return "bg-status-resolved-foreground";
}

/** Renders bot message content with clickable ticket links */
function BotContent({ content, streaming, ticketId }: { content: string; streaming?: boolean; ticketId?: string }) {
  // Parse ticket links like [View Ticket →](/tickets/TK-1234)
  const parts = content.split(/(\[View Ticket →\]\(\/tickets\/[A-Z]+-\d+\))/g);

  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        const linkMatch = part.match(/\[View Ticket →\]\(\/tickets\/(TK-\d+)\)/);
        if (linkMatch) {
          return (
            <Link
              key={i}
              to={`/tickets/${linkMatch[1]}`}
              className="inline-flex items-center gap-1 rounded-md bg-brand-200 px-2 py-0.5 text-xs font-semibold text-brand-800 hover:bg-brand-300 transition-colors"
            >
              <ExternalLink className="h-3 w-3" /> View Ticket {linkMatch[1]}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
      {streaming && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-brand-700 align-middle" />}
    </p>
  );
}

function BotMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-card px-4 py-3 text-sm shadow-soft">{children}</div>
    </div>
  );
}

function UserMsg({ children, initials }: { children: React.ReactNode; initials: string }) {
  return (
    <div className="flex items-start justify-end gap-2">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-300 px-4 py-3 text-sm">{children}</div>
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-gradient-brand text-[10px] text-primary-foreground">{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}

function Chip({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition hover:border-brand-700 hover:text-brand-700"
    >
      {icon} {children}
    </button>
  );
}

function ExtractField({
  label,
  value,
  pending,
  onChange,
  isSelect,
  options,
}: {
  label: string;
  value: any;
  pending?: boolean;
  onChange?: (val: string) => void;
  isSelect?: boolean;
  options?: string[];
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 ${onChange && !pending ? 'py-1' : 'py-2'} text-xs focus-within:border-brand-700 focus-within:ring-1 focus-within:ring-brand-700 transition-all`}>
        {pending ? (
          <span className="py-1 text-muted-foreground flex items-center gap-1.5">
            {value === "Analyzing..." && <Loader2 className="h-3 w-3 animate-spin" />}
            {value}
          </span>
        ) : onChange ? (
          isSelect ? (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent outline-none py-1 text-foreground"
            >
              {options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent outline-none py-1 text-foreground"
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          )
        ) : (
          <span className="py-1">{value}</span>
        )}
      </div>
    </div>
  );
}