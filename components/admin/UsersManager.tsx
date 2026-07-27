"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, User as UserIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar: string | null;
}

interface FormState {
  id: string | null;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  password: string;
}

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  email: "",
  role: "USER",
  password: "",
};

export function UsersManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch {
      toast({ title: "Қолданушыларды жүктеу мүмкін болмады", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (user: UserRow) => {
    setForm({ id: user.id, name: user.name, email: user.email, role: user.role, password: "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      toast({ title: "Атын енгізіңіз", variant: "warning" });
      return;
    }
    if (!email || !email.includes("@")) {
      toast({ title: "Дұрыс email енгізіңіз", variant: "warning" });
      return;
    }
    if (!form.id && form.password && form.password.length < 6) {
      toast({ title: "Құпия сөз кемінде 6 таңба болуы керек", variant: "warning" });
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!form.id;
      const payload: Record<string, unknown> = { name, email, role: form.role };
      if (!isEdit) payload.password = form.password || undefined;

      const res = await fetch(isEdit ? `/api/users/${form.id}` : "/api/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Сақтау мүмкін болмады");

      toast({ title: isEdit ? "Қолданушы жаңартылды" : "Қолданушы қосылды", variant: "success" });
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      toast({ title: "Қате шықты", description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Қолданушы жойылды", variant: "success" });
      setToDelete(null);
      await load();
    } catch {
      toast({ title: "Қолданушыны жою мүмкін болмады", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-dark-800/50 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Пайдаланушылар менеджері</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Қолданушы қосу
        </Button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-white/50 text-sm">Жүктелуде…</div>
      ) : users.length === 0 ? (
        <div className="py-10 text-center text-white/50 text-sm">Әзірге қолданушылар жоқ</div>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dark-900">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5 text-white/30" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-white/40">{user.email}</p>
              </div>
              {user.role === "ADMIN" ? (
                <span className="flex shrink-0 items-center gap-1 rounded-lg bg-primary-500/10 px-2 py-1 text-xs font-medium text-primary-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </span>
              ) : (
                <span className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs font-medium text-white/40">
                  Қолданушы
                </span>
              )}
              <Button size="icon" variant="outline" onClick={() => openEdit(user)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => setToDelete(user)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        title={form.id ? "Қолданушыны өңдеу" : "Жаңа қолданушы қосу"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">Аты *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Аты-жөні"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/70">Email *</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com"
            />
          </div>
          {!form.id ? (
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Құпия сөз</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Кемінде 6 таңба (міндетті емес)"
              />
            </div>
          ) : null}
          <div>
            <label className="mb-1.5 block text-sm text-white/70">Рөлі</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "USER" | "ADMIN" }))}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:border-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="USER" className="bg-dark-800">Қолданушы</option>
              <option value="ADMIN" className="bg-dark-800">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>
              Болдырмау
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Сақтау
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Қолданушыны жою"
        description={`"${toDelete?.name}" қолданушысын жойғыңыз келе ме?`}
        loading={deleting}
      />
    </div>
  );
}
