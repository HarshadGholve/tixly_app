import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  Users,
  Plus,
  Search,
  Trash2,
  Pencil,
  Shield,
  Wrench,
  User as UserIcon,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — Tixly" },
      { name: "description", content: "Create, edit, and manage users and technicians." },
    ],
  }),
  component: AdminUsersPage,
});

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  skills?: string[];
}

function AdminUsersPage() {
  const [adminUser, setAdminUser] = useState({ name: "Loading...", subtitle: "Admin" });
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Create user dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("User");
  const [newSkills, setNewSkills] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit user dialog
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApi("/auth/me")
      .then((u) => setAdminUser({ name: u.name, subtitle: u.email }))
      .catch(() => {});
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchApi("/admin/users");
      setUsers(res.users);
    } catch {
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  const createUser = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setCreating(true);
    try {
      const body: any = { name: newName, email: newEmail, role: newRole };
      if (newRole === "Technician" && newSkills.trim()) {
        body.skills = newSkills.split(",").map((s) => s.trim()).filter(Boolean);
      }
      await fetchApi("/admin/users", {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success(`${newRole} "${newName}" created successfully`);
      setCreateOpen(false);
      setNewName("");
      setNewEmail("");
      setNewRole("User");
      setNewSkills("");
      loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to create user");
    }
    setCreating(false);
  };

  const openEdit = (u: AppUser) => {
    setEditUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditSkills(u.skills?.join(", ") || "");
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const body: any = { name: editName, email: editEmail, role: editRole };
      if (editRole === "Technician") {
        body.skills = editSkills.split(",").map((s) => s.trim()).filter(Boolean);
      }
      await fetchApi(`/admin/users/${editUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast.success(`User "${editName}" updated`);
      setEditUser(null);
      loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to update user");
    }
    setSaving(false);
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchApi(`/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`User "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    }
    setDeleting(false);
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleIcon = (role: string) => {
    if (role === "Admin") return <Shield className="h-3 w-3" />;
    if (role === "Technician") return <Wrench className="h-3 w-3" />;
    return <UserIcon className="h-3 w-3" />;
  };

  const roleBadgeCls = (role: string) => {
    if (role === "Admin") return "bg-brand-200 text-brand-800";
    if (role === "Technician") return "bg-status-warning text-status-warning-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <AppShell variant="admin" user={adminUser}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} total users · {users.filter((u) => u.role === "Technician").length} technicians
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/40 shadow-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user, technician, or admin to the platform.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jane.d@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newRole === "Technician" && (
                <div className="space-y-1.5">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="Network, Hardware, Security"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createUser} disabled={creating}>
                {creating && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Create {newRole}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-border/60 bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-700"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px] rounded-xl">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="User">Users</SelectItem>
            <SelectItem value="Technician">Technicians</SelectItem>
            <SelectItem value="Admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <section className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Skills</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-700" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">No users match your filters.</p>
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${roleBadgeCls(u.role)}`}
                    >
                      {roleIcon(u.role)} {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.skills && u.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.skills.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit user"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-status-critical/20 hover:text-status-critical-foreground transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="glass border-white/40 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details, role, and skills.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Technician">Technician</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editRole === "Technician" && (
              <div className="space-y-1.5">
                <Label>Skills (comma-separated)</Label>
                <Input
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  placeholder="Network, Hardware, Security"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})?
              This will also unassign them from any tickets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
