import { useEffect, useRef, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
}

interface Extraction {
  category: string;
  system: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  environment: string;
  ready: boolean;
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const streamBotReply = (full: string, chips?: { icon: React.ReactNode; label: string }[]) => {
    const id = `b-${Date.now()}`;
    setMessages((m) => [...m, { id, role: "bot", content: "", streaming: true, chips }]);
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

      streamBotReply(res.reply, chips);
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
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Tixly Bot</div>
              <div className="text-xs text-muted-foreground">Powered by AI Automation</div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-brand-50 to-card p-5">
            <div suppressHydrationWarning className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">
              Today, {typeof window !== "undefined" ? new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
            </div>

            {messages.map((m) =>
              m.role === "bot" ? (
                <BotMsg key={m.id}>
                  <p className="whitespace-pre-wrap">
                    {m.content}
                    {m.streaming && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-brand-700 align-middle" />}
                  </p>
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
              <ExtractField label="Category" value={extraction.category} pending={!extraction.ready} />
              <ExtractField label="Impacted System" value={extraction.system} pending={!extraction.ready} />
              <ExtractField
                label="Priority (auto-assessed)"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${priorityDot(extraction.priority)}`} />
                    {extraction.priority}
                  </span>
                }
                pending={!extraction.ready}
              />
              <ExtractField
                label="Environment"
                value={
                  isStreaming ? (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    extraction.environment
                  )
                }
                pending={!extraction.ready || isStreaming}
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
                  router.navigate({ to: `/tickets/${tkt.id}` });
                } catch (e: any) { }
              }}
            >
              Create Ticket Now
            </Button>
            <Button variant="outline" className="mt-2 w-full rounded-xl" onClick={() => send("Escalate to human")}>
              Escalate to Human
            </Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function priorityDot(p: Extraction["priority"]) {
  if (p === "Critical") return "bg-status-critical-foreground";
  if (p === "High") return "bg-status-warning-foreground";
  if (p === "Medium") return "bg-status-warning-foreground";
  return "bg-status-resolved-foreground";
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
}: {
  label: string;
  value: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs">
        <span>{value}</span>
        {!pending && <Check className="h-3.5 w-3.5 text-status-resolved-foreground" />}
      </div>
    </div>
  );
}