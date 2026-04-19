import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Camera, Lock, ShieldCheck, User as UserIcon, KeyRound, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — Tixly" },
      { name: "description", content: "Manage your profile, password, and request elevated access." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchApi("/auth/me").then(u => {
      setUser(u);
      const parts = u.name ? u.name.split(" ") : [""];
      setFirst(parts[0] || "");
      setLast(parts.slice(1).join(" ") || "");
      setEmail(u.email || "");
      setPhone(u.phone || "");
    }).catch(() => { });
  }, []);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const [requestedRole, setRequestedRole] = useState("Technician");
  const [reason, setReason] = useState("");
  const [requestStatus, setRequestStatus] = useState<"idle" | "pending">("idle");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "AA";

  if (!user) {
    return (
      <AppShell variant="user" user={{ name: "Loading...", subtitle: "Loading..." }}>
        <p className="p-8 text-muted-foreground animate-pulse">Loading profile...</p>
      </AppShell>
    );
  }

  // Adjust appshell layout internally if they navigate here from admin
  const isCurrentlyAdmin = user.role === "Admin" || user.role === "Technician";

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 700));
    setSavingProfile(false);
    toast.success("Profile updated successfully");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPwd !== confirmPwd) return toast.error("Passwords do not match");
    setSavingPwd(true);
    await new Promise((r) => setTimeout(r, 700));
    setSavingPwd(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    toast.success("Password changed");
  };

  const requestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) return toast.error("Please provide a brief justification (10+ chars)");
    setSubmittingRequest(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmittingRequest(false);
    setRequestStatus("pending");
    toast.success(`Request to become ${requestedRole} submitted for review`);
  };

  return (
    <AppShell variant={isCurrentlyAdmin ? "admin" : "user"} user={{ name: user.name, subtitle: user.email }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information, security, and access level.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal info */}
        <section className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-brand-700" />
            <h2 className="text-base font-semibold">Personal Information</h2>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {avatar && <AvatarImage src={avatar} alt="avatar" />}
              <AvatarFallback className="bg-gradient-brand text-lg font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => fileRef.current?.click()}>
                <Camera className="mr-2 h-3.5 w-3.5" /> Upload photo
              </Button>
              <p className="mt-1.5 text-xs text-muted-foreground">PNG or JPG, max 2MB</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="first">First name</Label>
              <Input id="first" value={first} onChange={(e) => setFirst(e.target.value)} maxLength={50} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last">Last name</Label>
              <Input id="last" value={last} onChange={(e) => setLast(e.target.value)} maxLength={50} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={savingProfile} className="rounded-lg">
                {savingProfile && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Save changes
              </Button>
            </div>
          </form>
        </section>

        {/* Right column */}
        <div className="space-y-6">
          {/* Password */}
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-700" />
              <h2 className="text-base font-semibold">Change Password</h2>
            </div>
            <form onSubmit={changePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cpwd">Current password</Label>
                <Input id="cpwd" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="npwd">New password</Label>
                <Input id="npwd" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpwd2">Confirm new password</Label>
                <Input id="cpwd2" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
              </div>
              <Button type="submit" disabled={savingPwd} className="w-full rounded-lg">
                {savingPwd && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                <KeyRound className="mr-2 h-3.5 w-3.5" /> Update password
              </Button>
            </form>
          </section>
        </div>

        {/* Elevated access — full width */}
        <section className="lg:col-span-3 rounded-2xl border border-border/60 bg-gradient-to-br from-brand-50 to-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-700" />
              <h2 className="text-base font-semibold">Request Elevated Access</h2>
            </div>
            {requestStatus === "pending" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-status-warning/30 px-3 py-1 text-xs font-medium text-status-warning-foreground">
                <CheckCircle2 className="h-3 w-3" /> Pending approval
              </span>
            )}
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Need elevated permissions? Submit a request and an Admin will review it. Your current role is{" "}
            <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-full">{user.role}</span>.
          </p>

          <form onSubmit={requestAccess} className="grid gap-4 md:grid-cols-[200px_1fr_auto] md:items-end">
            <div className="space-y-1.5">
              <Label>Requested role</Label>
              <Select value={requestedRole} onValueChange={setRequestedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technician">Technician</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reason">Justification</Label>
              <Textarea
                id="reason"
                rows={2}
                placeholder="Briefly explain why you need this access level..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
              />
            </div>
            <Button type="submit" disabled={submittingRequest || requestStatus === "pending"} className="rounded-lg">
              {submittingRequest && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Submit request
            </Button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
