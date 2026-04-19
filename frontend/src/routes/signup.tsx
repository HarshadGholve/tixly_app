import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { ArrowRight, Eye, EyeOff, Mail, Tag, User as UserIcon, Crown, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Tixly" },
      { name: "description", content: "Create your Tixly account and start automating IT requests today." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"User" | "Admin">("User");
  const [show, setShow] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          full_name: `${firstName} ${lastName}`.trim(),
          organization
        }),
      });
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.user.id);
      toast.success("Account created successfully!");
      if (res.user.role === "Admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      fetchApi("/auth/me").then(u => {
        toast.success("Account created successfully with Google!");
        window.history.replaceState({}, document.title, "/signup");
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

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-10">
        <Logo size="lg" />

        <div className="mt-8 w-full max-w-md rounded-3xl border border-border/60 bg-card/80 p-8 shadow-elevated backdrop-blur">
          <h1 className="text-center text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Start automating IT requests today
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={onSubmit}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">First Name</label>
                <Input placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 h-10 rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-medium">Last Name</label>
                <Input placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 h-10 rounded-xl" />
              </div>
            </div>

            <Field label="Work Email" icon={<Mail className="h-4 w-4" />}>
              <Input placeholder="jane@company.com" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-10 rounded-xl pl-9" />
            </Field>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Organization Code</label>
                <span className="text-[10px] text-muted-foreground">Optional</span>
              </div>
              <Field icon={<Tag className="h-4 w-4" />}>
                <Input placeholder="Enter invite code..." value={organization} onChange={e => setOrganization(e.target.value)} className="h-10 rounded-xl pl-9" />
              </Field>
            </div>

            <div>
              <label className="text-xs font-medium">Account Role</label>
              <div className="mt-1 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                <RoleToggle
                  active={role === "User"}
                  onClick={() => setRole("User")}
                  icon={<UserIcon className="h-4 w-4" />}
                  label="User"
                />
                <RoleToggle
                  active={role === "Admin"}
                  onClick={() => setRole("Admin")}
                  icon={<Crown className="h-4 w-4" />}
                  label="Admin"
                  badge="🔒"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Password</label>
              <div className="relative mt-1">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="h-10 rounded-xl pr-10"
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

            <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
              <div className="text-xs font-semibold">Password requirements:</div>
              <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                {["At least 8 characters", "One uppercase & one lowercase letter", "One number or special symbol"].map(
                  (r) => (
                    <li key={r} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-status-resolved-foreground" /> {r}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <Checkbox className="mt-0.5" /> I agree to the{" "}
              <a className="text-brand-700 hover:underline">Terms of Service</a> and{" "}
              <a className="text-brand-700 hover:underline">Privacy Policy</a>.
            </label>

            <Button type="submit" className="h-11 w-full rounded-xl">
              Create Account <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <div className="pt-4 pb-2 space-y-3">
              <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                Or Continue With
              </p>
              <div className="h-px bg-border/60 w-full" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl"
              onClick={() => window.location.href = "http://localhost:8000/api/auth/google/login"}
            >
              <span className="font-bold mr-2">G</span> Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-brand-700 hover:underline">
                Log in here
              </Link>
            </p>
          </form>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          © 2026 Tixly · Secure Authentication
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && <label className="text-xs font-medium">{label}</label>}
      <div className="relative mt-1">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

function RoleToggle({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon} {label} {badge && <span className="text-xs opacity-60">{badge}</span>}
    </button>
  );
}