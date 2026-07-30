"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Upload, Eye, EyeOff, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Dialog, ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface Drama {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  posterUrl: string;
  totalEpisodes: number;
  isPublished: boolean;
  episodes: { id: string; episodeNumber: number }[];
}

interface FormState {
  id: string | null;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  totalEpisodes: string;
  isPublished: boolean;
}

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  slug: "",
  description: "",
  posterUrl: "",
  totalEpisodes: "1",
  isPublished: true,
};

export function DramasManager() {
  const { toast } = useToast();
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState<Drama | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dramas?admin=1");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDramas(data);
    } catch {
      toast({ title: "Дорамаларды жүктеу мүмкін болмады", variant: "destructive" });
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

  const openEdit = (drama: Drama) => {
    setForm({
      id: drama.id,
      title: drama.title,
      slug: drama.slug,
      description: drama.description ?? "",
      posterUrl: drama.posterUrl,
      totalEpisodes: String(drama.totalEpisodes),
      isPublished: drama.isPublished,
    });
    setDialogOpen(true);
  };

  const handlePosterUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subdir", "posters");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Жүктеу қатесі");
      setForm((f) => ({ ...f, posterUrl: data.url }));
      toast({ title: "Постер жүктелді", variant: "success" });
    } catch (err: any) {
      toast({ title: "Постерді жүктеу мүмкін болмады", description: err?.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const title = form.title.trim();
    const posterUrl = form.posterUrl.trim();
    const totalEpisodes = parseInt(form.totalEpisodes, 10);

    if (!title) {
      toast({ title: "Атауын енгізіңіз", variant: "warning" });
      return;
    }
    if (!posterUrl) {
      toast({ title: "Постер URL немесе суретін жүктеңіз", variant: "warning" });
      return;
    }
    if (!Number.isInteger(totalEpisodes) || totalEpisodes < 1) {
      toast({ title: "Бөлімдер саны дұрыс болуы керек", variant: "warning" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || null,
        posterUrl,
        totalEpisodes,
        isPublished: form.isPublished,
      };
      const res = await fetch(form.id ? `/api/dramas/${form.id}` : "/api/dramas", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Сақтау мүмкін болмады");

      toast({ title: form.id ? "Дорама жаңартылды" : "Дорама қосылды", variant: "success" });
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      toast({ title: "Қате шықты", description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (drama: Drama) => {
    try {
      const res = await fetch(`/api/dramas/${drama.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !drama.isPublished }),
      });
      if (!res.ok) throw new Error();
      setDramas((prev) =>
        prev.map((d) => (d.id === drama.id ? { ...d, isPublished: !d.isPublished } : d)),
      );
    } catch {
      toast({ title: "Күйін өзгерту мүмкін болмады", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dramas/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Дорама жойылды", variant: "success" });
      setToDelete(null);
      await load();
    } catch {
      toast({ title: "Дораманы жою мүмкін болмады", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-dark-800/50 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Дорамалар менеджері</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Дорама қосу
        </Button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-white/50 text-sm">Жүктелуде…</div>
      ) : dramas.length === 0 ? (
        <div className="py-10 text-center text-white/50 text-sm">Әзірге дорамалар жоқ</div>
      ) : (
        <div className="grid gap-3">
          {dramas.map((drama) => (
            <motion.div
              key={drama.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-3"
            >
              <div className="h-10 w-8 shrink-0 overflow-hidden rounded-lg bg-dark-900">
                {drama.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={drama.posterUrl} alt={drama.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Film className="h-3.5 w-3.5 text-white/30" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{drama.title}</p>
                <p className="truncate text-xs text-white/40">/{drama.slug}</p>
                <p className="text-xs text-white/40">
                  {drama.episodes.length}/{drama.totalEpisodes} бөлім
                </p>
              </div>
              <button
                onClick={() => togglePublish(drama)}
                className={`shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
                  drama.isPublished
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-white/5 text-white/40"
                }`}
                title={drama.isPublished ? "Жарияланған" : "Жасырын"}
              >
                {drama.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {drama.isPublished ? "Жарияланды" : "Жасырын"}
              </button>
              <Button size="icon" variant="outline" onClick={() => openEdit(drama)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => setToDelete(drama)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        title={form.id ? "Дораманы өңдеу" : "Жаңа дорама қосу"}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">Атауы *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Дорама атауы"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/70">Slug (сілтеме)</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="бос қалдырса, автоматты жасалады"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/70">Сипаттама</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Қысқаша сипаттама"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/70">Постер *</label>
            <div className="flex items-center gap-3">
              {form.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.posterUrl} alt="poster" className="h-16 w-12 rounded-lg object-cover" />
              ) : null}
              <Input
                value={form.posterUrl}
                onChange={(e) => setForm((f) => ({ ...f, posterUrl: e.target.value }))}
                placeholder="https://... немесе файл жүктеңіз"
              />
              <label className="shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePosterUpload(file);
                  }}
                />
                <span className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                  {uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Upload className="h-4 w-4 text-white" />
                  )}
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/70">Бөлімдер саны *</label>
            <Input
              type="number"
              min={1}
              value={form.totalEpisodes}
              onChange={(e) => setForm((f) => ({ ...f, totalEpisodes: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-white/5"
            />
            Жарияланған (сайтта көрінеді)
          </label>

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
        title="Дораманы жою"
        description={`"${toDelete?.title}" дорамасын жойғыңыз келе ме? Бұл әрекетті болдырмау мүмкін емес.`}
        loading={deleting}
      />
    </div>
  );
}
