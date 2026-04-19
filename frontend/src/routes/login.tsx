import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — Tixly" },
      { name: "description", content: "Log in to your Tixly account to manage IT tickets and automation." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      fetchApi("/auth/me").then(u => {
        toast.success("Logged in with Google!");
        window.history.replaceState({}, document.title, "/login");
        if (u.role === "Admin") {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/dashboard" });
        }
      }).catch(() => {
        toast.error("Failed to fetch user role.");
        navigate({ to: "/login" });
      });
    }
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.user.id);
      toast.success("Successfully logged in.");

      if (res.user.role === "Admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials.");
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-300 via-brand-400 to-brand-500 p-10 text-foreground md:flex">
        <Logo size="md" />
        <div className="mx-auto w-full max-w-lg">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Effortlessly manage your
            <br />
            IT tickets and operations.
          </h2>
          <p className="mt-4 max-w-md text-sm text-foreground/70">
            Log in to access your intelligent dashboard, resolve requests faster, and empower your
            team with AI-driven automation.
          </p>

          <div className="relative mt-10 max-w-md rounded-2xl border border-white/40 bg-card/70 p-5 shadow-elevated backdrop-blur">
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Tickets Resolved" value="1,284" delta="+12%" />
              <Stat label="Avg Response" value="2m 14s" delta="-5%" />
              <Stat label="Active Users" value="24" sub="Online" />
            </div>
            <div className="mt-4 grid h-20 grid-cols-5 items-end gap-2">
              {[40, 70, 55, 90, 65].map((h, i) => (
                <div
                  key={i}
                  className="rounded-md bg-gradient-to-t from-primary/70 to-primary/30"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className="absolute -right-3 top-3 flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 shadow-elevated">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-status-resolved text-status-resolved-foreground text-xs">
                ✓
              </span>
              <div className="text-xs">
                <div className="font-semibold">System Status</div>
                <div className="text-muted-foreground">All operational</div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-foreground/60">© 2026 Tixly · Secure Authentication</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center bg-background p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex justify-center">
            <Logo size="md" />
          </div>
          <h1 className="text-center text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter your email and password to access your account.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={onSubmit}
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox /> Remember Me
              </label>
              <a className="text-sm font-medium text-brand-700 hover:underline" href="#">
                Forgot Your Password?
              </a>
            </div>

            <Button type="submit" className="h-11 w-full rounded-xl">
              Log In
            </Button>

            <div className="pt-4 pb-2 space-y-3">
              <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                Or Continue With
              </p>
              <div className="h-px bg-border w-full" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl"
                onClick={() => window.location.href = "http://localhost:8000/api/auth/google/login"}
              >
                <span className="font-bold">G</span> Google
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't Have An Account?{" "}
              <Link to="/signup" className="font-medium text-brand-700 hover:underline">
                Register Now.
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, delta, sub }: { label: string; value: string; delta?: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-background/40 p-2 text-left">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
      {delta && <div className="text-[10px] text-status-resolved-foreground">▲ {delta}</div>}
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}