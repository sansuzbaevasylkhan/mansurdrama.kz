'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Trash2,
  Users as UsersIcon,
  Pencil,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, ConfirmDialog } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { formatDateShort, cn } from '@/lib/utils';
import type { UserSummary, UserRole } from '@/types';

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UserSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UserSummary | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<UserSummary | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as UserSummary[];
      setUsers(data);
    } catch {
      toast({ title: 'Қолданушыларды жүктеу мүмкін болмады', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const onConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${pendingDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Қолданушы жойылды', variant: 'success' });
      setPendingDelete(null);
      await fetchUsers();
    } catch {
      toast({ title: 'Жою мүмкін болмады', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Қолданушылар
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Барлығы: {users.length} • Көрсетілген: {filtered.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Атауы немесе email…"
              className="h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 w-64"
            />
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Қосу
          </Button>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.04] text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Аватар</th>
                <th className="px-4 py-3 text-left">Атауы</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Күйі</th>
                <th className="px-4 py-3 text-left">Қосылған</th>
                <th className="px-4 py-3 text-right">Әрекет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-9" />
                    </td>
                  </tr>
                ))
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12">
                    <EmptyState
                      icon={<UsersIcon className="h-10 w-10" />}
                      title={search ? 'Іздеу нәтижесі бос' : 'Қолданушылар табылмады'}
                      description={
                        search
                          ? 'Іздеу шартын өзгертіп көріңіз.'
                          : 'Жаңа қолданушы қосыңыз.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                pageItems.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3 text-white/40 font-mono text-xs">
                      {u.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-sm font-semibold text-white">
                        {u.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          u.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-white/70">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {formatDateShort(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(u);
                            setFormOpen(true);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                          aria-label="Өңдеу"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setPendingDelete(u)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          aria-label="Жою"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/5">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Алдыңғы
            </Button>
            <span className="text-sm text-white/60">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Келесі
            </Button>
          </div>
        ) : null}
      </div>

      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
        onSaved={async () => {
          setFormOpen(false);
          await fetchUsers();
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={onConfirmDelete}
        loading={deleting}
        title="Қолданушыны жою"
        description={
          <>
            <span className="font-semibold text-white">{pendingDelete?.name}</span> (
            {pendingDelete?.email}) — бұл қолданушыны жойғыңыз келе ме? Бұл әрекетті қайтару мүмкін емес.
          </>
        }
      />
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30 px-2 py-0.5 text-xs text-white">
        <Crown className="h-3 w-3" />
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-white/70">
      Қолданушы
    </span>
  );
}

function UserFormDialog({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: UserSummary | null;
  onSaved: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('USER');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setEmail(editing.email);
      setRole(editing.role);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setRole('USER');
      setPassword('');
    }
  }, [open, editing]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Атауы мен email міндетті', variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        editing ? `/api/users/${editing.id}` : '/api/users',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            role,
            ...(editing || !password ? {} : { password }),
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Сақтау мүмкін болмады');
      }
      toast({
        title: editing ? 'Қолданушы жаңартылды' : 'Қолданушы қосылды',
        variant: 'success',
      });
      await onSaved();
    } catch (err: any) {
      toast({
        title: 'Қате',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={editing ? 'Қолданушыны өңдеу' : 'Жаңа қолданушы'}
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="user-name">Атауы</Label>
          <Input
            id="user-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5"
            placeholder="Айгерім"
            required
          />
        </div>
        <div>
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
            placeholder="aigerim@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="user-role">Роль</Label>
          <Select
            id="user-role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="mt-1.5"
          >
            <option value="USER">Қолданушы</option>
            <option value="ADMIN">Админ</option>
          </Select>
        </div>
        {!editing ? (
          <div>
            <Label htmlFor="user-password">Құпиясөз (міндетті емес)</Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
              placeholder="••••••"
            />
            <p className="mt-1 text-xs text-white/40">
              Кемінде 6 таңба. Бос қалдырсаңыз, кейінірек орнатуға болады.
            </p>
          </div>
        ) : null}
        <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Болдырмау
          </Button>
          <Button type="submit" loading={submitting}>
            {editing ? 'Жаңарту' : 'Сақтау'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
