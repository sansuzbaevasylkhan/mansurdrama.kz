'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ProgressBar } from '@/components/ui/progress';
import { Dialog, ConfirmDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { formatNumber, formatDateShort, cn } from '@/lib/utils';
import { uploadFileDirect } from '@/lib/client-upload';
import type { DramaSummary, EpisodeSummary } from '@/types';

interface DramaWithEpisodes extends DramaSummary {
  episodes: EpisodeSummary[];
}

interface EpisodeDraft {
  id: string;
  episodeNumber: number;
  title: string;
  videoFile: File | null;
  videoUrl: string;
  progress: number;
  uploading: boolean;
  uploaded: boolean;
  isExisting?: boolean;
  existingId?: string;
}

export function DramaManagement() {
  const { toast } = useToast();
  const [dramas, setDramas] = React.useState<DramaWithEpisodes[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const pageSize = 9;

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DramaWithEpisodes | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<DramaWithEpisodes | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchDramas = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dramas?admin=1', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as DramaWithEpisodes[];
      setDramas(data);
    } catch (err) {
      toast({ title: 'Дорамаларды жүктеу мүмкін болмады', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchDramas();
  }, [fetchDramas]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return dramas;
    const q = search.toLowerCase();
    return dramas.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q),
    );
  }, [dramas, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const onCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const onEdit = (d: DramaWithEpisodes) => {
    setEditing(d);
    setFormOpen(true);
  };
  const onDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dramas/${pendingDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Дорама жойылды', variant: 'success' });
      setPendingDelete(null);
      await fetchDramas();
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Дорамалар</h1>
          <p className="text-sm text-white/60 mt-1">
            Барлығы: {dramas.length} • Көрсетілген: {filtered.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Іздеу…"
              className="h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 w-56"
            />
          </div>
          <Button onClick={onCreate} size="md">
            <Plus className="h-4 w-4" />
            Дорама қосу
          </Button>
        </div>
      </header>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="mt-3 h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Film className="h-12 w-12" />}
          title={search ? 'Іздеу бойынша табылмады' : 'Әлі дорама жоқ'}
          description={
            search
              ? 'Басқа сұрау жасап көріңіз.'
              : 'Бірінші дораманы қосып, контент орналастырыңыз.'
          }
          action={
            !search ? (
              <Button onClick={onCreate}>
                <Plus className="h-4 w-4" /> Дорама қосу
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {pageItems.map((d) => (
                <DramaCard
                  key={d.id}
                  drama={d}
                  onEdit={() => onEdit(d)}
                  onDelete={() => setPendingDelete(d)}
                />
              ))}
            </AnimatePresence>
          </div>
          {totalPages > 1 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          ) : null}
        </>
      )}

      <DramaFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
        onSaved={async () => {
          setFormOpen(false);
          await fetchDramas();
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Дораманы жою"
        description={
          <>
            <span className="font-semibold text-white">{pendingDelete?.title}</span> — бұл дораманы және оның барлық бөлімдерін жойғыңыз келе ме? Бұл әрекетті қайтару мүмкін емес.
          </>
        }
      />
    </div>
  );
}

function DramaCard({
  drama,
  onEdit,
  onDelete,
}: {
  drama: DramaWithEpisodes;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-dark-800">
        {drama.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={drama.posterUrl}
            alt={drama.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/30">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-semibold text-white line-clamp-2">
            {drama.title}
          </p>
          <p className="text-xs text-white/70 mt-0.5">
            {drama.episodes.length} / {drama.totalEpisodes} бөлім
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="text-[11px] text-white/40 truncate" title={drama.slug}>
          /{drama.slug}
        </p>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Өңдеу"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            aria-label="Жою"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
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
        onClick={() => onChange(page + 1)}
      >
        Келесі
      </Button>
    </div>
  );
}

// --------------------------------------------------------------------
// Drama form (create + edit)
// --------------------------------------------------------------------

function DramaFormDialog({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: DramaWithEpisodes | null;
  onSaved: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [slugAuto, setSlugAuto] = React.useState(true);
  const [description, setDescription] = React.useState('');
  const [totalEpisodes, setTotalEpisodes] = React.useState(1);
  const [posterFile, setPosterFile] = React.useState<File | null>(null);
  const [posterPreview, setPosterPreview] = React.useState<string | null>(null);
  const [posterUploading, setPosterUploading] = React.useState(false);
  const [posterUrl, setPosterUrl] = React.useState('');
  const [episodes, setEpisodes] = React.useState<EpisodeDraft[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Reset on open / editing change.
  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setSlug(editing.slug);
      setSlugTouched(true);
      setSlugAuto(false);
      setDescription(editing.description ?? '');
      setTotalEpisodes(editing.totalEpisodes || editing.episodes.length || 1);
      setPosterUrl(editing.posterUrl);
      setPosterPreview(editing.posterUrl);
      setPosterFile(null);
      // Pre-populate existing episodes.
      setEpisodes(
        editing.episodes.map((e) => ({
          id: e.id,
          episodeNumber: e.episodeNumber,
          title: e.title,
          videoFile: null,
          videoUrl: e.videoUrl,
          progress: 100,
          uploading: false,
          uploaded: true,
          isExisting: true,
          existingId: e.id,
        })),
      );
    } else {
      setTitle('');
      setSlug('');
      setSlugTouched(false);
      setSlugAuto(true);
      setDescription('');
      setTotalEpisodes(1);
      setPosterFile(null);
      setPosterPreview(null);
      setPosterUrl('');
      setEpisodes([
        {
          id: `tmp-${Date.now()}`,
          episodeNumber: 1,
          title: 'Бөлім 1',
          videoFile: null,
          videoUrl: '',
          progress: 0,
          uploading: false,
          uploaded: false,
        },
      ]);
    }
  }, [open, editing]);

  // Auto-slug from title (debounced).
  React.useEffect(() => {
    if (!open || !slugAuto) return;
    const handle = setTimeout(async () => {
      if (!title.trim()) {
        setSlug('');
        return;
      }
      try {
        const res = await fetch(
          `/api/slug?title=${encodeURIComponent(title)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.slug) setSlug(data.slug);
        }
      } catch {
        // Non-fatal
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [title, slugAuto, open]);

  // Keep episode array length in sync with totalEpisodes.
  React.useEffect(() => {
    if (!open) return;
    setEpisodes((prev) => {
      const next = [...prev];
      if (next.length < totalEpisodes) {
        for (let i = next.length; i < totalEpisodes; i++) {
          next.push({
            id: `tmp-${Date.now()}-${i}`,
            episodeNumber: i + 1,
            title: `Бөлім ${i + 1}`,
            videoFile: null,
            videoUrl: '',
            progress: 0,
            uploading: false,
            uploaded: false,
          });
        }
      } else if (next.length > totalEpisodes) {
        next.length = totalEpisodes;
      }
      // Re-number sequentially.
      next.forEach((ep, idx) => {
        ep.episodeNumber = idx + 1;
      });
      return next;
    });
  }, [totalEpisodes, open]);

  const onPosterSelected = (file: File | null) => {
    setPosterFile(file);
    if (posterPreview && posterPreview.startsWith('blob:')) {
      URL.revokeObjectURL(posterPreview);
    }
    if (file) {
      setPosterPreview(URL.createObjectURL(file));
    } else {
      setPosterPreview(posterUrl || null);
    }
  };

  const uploadPoster = async (): Promise<string | null> => {
    if (!posterFile) return posterUrl;
    setPosterUploading(true);
    try {
      return await uploadFileDirect(posterFile, 'posters');
    } catch (err: any) {
      toast({ title: 'Қате', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setPosterUploading(false);
    }
  };

  const uploadEpisodeVideo = async (idx: number): Promise<string | null> => {
    const ep = episodes[idx];
    if (!ep || !ep.videoFile || ep.isExisting) {
      // Бұрын жүктелген бөлім — жаңа жүктеу қажет емес, бар videoUrl-ды қайтарамыз.
      return ep?.videoUrl || null;
    }
    setEpisodes((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], uploading: true, progress: 0 };
      return next;
    });
    try {
      // Видео Vercel функциясы арқылы емес, тікелей Supabase Storage-қа
      // жүктеледі — 4.5MB body лимитінен асатын нақты MP4 файлдары
      // осылай ғана сенімді жүктеледі.
      const url = await uploadFileDirect(ep.videoFile, 'videos', (pct) => {
        setEpisodes((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], progress: pct };
          return next;
        });
      });
      setEpisodes((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          videoUrl: url,
          uploading: false,
          uploaded: true,
          progress: 100,
        };
        return next;
      });
      return url;
    } catch (err: any) {
      setEpisodes((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], uploading: false };
        return next;
      });
      toast({
        title: 'Видео жүктелмеді',
        description: err?.message || 'Қате',
        variant: 'destructive',
      });
      return null;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Атауын енгізіңіз', variant: 'warning' });
      return;
    }
    if (!editing && !posterFile) {
      toast({ title: 'Постер жүктеңіз', variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      let finalPosterUrl = posterUrl;
      if (posterFile) {
        const uploaded = await uploadPoster();
        if (!uploaded) {
          setSubmitting(false);
          return;
        }
        finalPosterUrl = uploaded;
      }

      // Step 1: create or update the drama (without uploaded videos).
      let dramaId: string;
      if (editing) {
        const res = await fetch(`/api/dramas/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            slug,
            description: description || null,
            posterUrl: finalPosterUrl,
            totalEpisodes,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Дораманы жаңарту мүмкін болмады');
        }
        dramaId = editing.id;
      } else {
        const res = await fetch('/api/dramas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            slug,
            description: description || null,
            posterUrl: finalPosterUrl,
            totalEpisodes,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Дораманы сақтау мүмкін болмады');
        }
        const data = await res.json();
        dramaId = data.id;
      }

      // Step 2: upload any pending episode videos.
      const newEpisodes = episodes.filter(
        (e) => !e.isExisting && e.videoFile && !e.uploaded,
      );
      const uploadedEpisodes: { episodeNumber: number; title: string; videoUrl: string }[] = [];

      for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i];
        if (ep.isExisting) continue;
        if (!ep.videoFile) continue;
        if (ep.uploaded && ep.videoUrl) {
          uploadedEpisodes.push({
            episodeNumber: ep.episodeNumber,
            title: ep.title,
            videoUrl: ep.videoUrl,
          });
          continue;
        }
        const uploadedUrl = await uploadEpisodeVideo(i);
        if (!uploadedUrl) {
          setSubmitting(false);
          return;
        }
        uploadedEpisodes.push({
          episodeNumber: ep.episodeNumber,
          title: ep.title,
          videoUrl: uploadedUrl,
        });
      }

      // Step 3: create all the episodes for this drama in one go.
      if (uploadedEpisodes.length > 0) {
        const res = await fetch(`/api/dramas/${dramaId}/episodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ episodes: uploadedEpisodes }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Бөлімдерді сақтау мүмкін болмады');
        }
      }

      toast({
        title: editing ? 'Дорама жаңартылды' : 'Дорама қосылды',
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
      size="2xl"
      title={editing ? 'Дораманы өңдеу' : 'Жаңа дорама'}
      description={
        editing
          ? 'Ақпаратты жаңартып, жаңа бөлімдер қосыңыз.'
          : 'Атауы, постер және бөлімдерді MP4 форматында жүктеңіз.'
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Poster + Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
          <div>
            <Label>Постер</Label>
            <label
              className={cn(
                'mt-2 relative flex aspect-[2/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-white/15 bg-white/5 hover:bg-white/10 transition-colors',
                posterPreview && 'border-solid border-white/10',
              )}
            >
              {posterPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterPreview}
                  alt="Постер алдын ала қарау"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-white/50" />
                  <span className="mt-2 text-xs text-white/60">Постер жүктеу</span>
                  <span className="mt-1 text-[10px] text-white/40">
                    JPG, PNG, WEBP · 10MB
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onPosterSelected(e.target.files?.[0] || null)}
              />
              {posterPreview ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onPosterSelected(null);
                  }}
                  className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80"
                  aria-label="Постерді алып тастау"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>
            {posterUploading ? (
              <p className="mt-2 text-xs text-white/60 flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Жүктелуде…
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Дораманың атауы</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Glory"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                  setSlugAuto(false);
                }}
                placeholder="the-glory"
                className="mt-1.5 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-white/40">
                Атаудан автоматты түрде жасалады. Қолмен өзгертуге болады.
              </p>
            </div>
            <div>
              <Label htmlFor="totalEpisodes">Бөлімдер саны</Label>
              <Input
                id="totalEpisodes"
                type="number"
                min={1}
                max={500}
                value={totalEpisodes}
                onChange={(e) =>
                  setTotalEpisodes(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="description">Сипаттама (міндетті емес)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Қысқаша сипаттама…"
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Episodes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Бөлімдер</Label>
            <span className="text-xs text-white/50">
              {episodes.length} бөлім • Әрқайсысына MP4
            </span>
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 -mr-1">
            {episodes.map((ep, idx) => (
              <EpisodeRow
                key={ep.id}
                episode={ep}
                onFileSelected={(file) => {
                  setEpisodes((prev) => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], videoFile: file };
                    return next;
                  });
                }}
                onTitleChange={(title) => {
                  setEpisodes((prev) => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], title };
                    return next;
                  });
                }}
                onRemove={
                  episodes.length > 1 && !ep.isExisting
                    ? () => {
                        setEpisodes((prev) => prev.filter((_, i) => i !== idx));
                        setTotalEpisodes((c) => Math.max(1, c - 1));
                      }
                    : undefined
                }
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-white/5">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Болдырмау
          </Button>
          <Button type="submit" loading={submitting} size="lg">
            {submitting ? 'Сақталуда…' : editing ? 'Жаңарту' : 'Сақтау'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function EpisodeRow({
  episode,
  onFileSelected,
  onTitleChange,
  onRemove,
}: {
  episode: EpisodeDraft;
  onFileSelected: (file: File | null) => void;
  onTitleChange: (t: string) => void;
  onRemove?: () => void;
}) {
  const isReady = episode.isExisting || (episode.uploaded && !!episode.videoUrl);
  const isUploading = episode.uploading;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/30 to-accent-500/30 text-sm font-bold text-white">
          {episode.episodeNumber}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={episode.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="h-8 flex-1 rounded-lg bg-white/5 border border-white/10 px-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              placeholder={`Бөлім ${episode.episodeNumber} атауы`}
            />
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                aria-label="Бөлімді алып тастау"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {episode.isExisting ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="truncate">{episode.videoUrl.split('/').pop()}</span>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/5 px-3 text-xs text-white/60 hover:bg-white/10 transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span className="truncate">
                  {episode.videoFile
                    ? episode.videoFile.name
                    : 'MP4 видео жүктеу'}
                </span>
              </div>
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                className="sr-only"
                onChange={(e) =>
                  onFileSelected(e.target.files?.[0] || null)
                }
              />
            </label>
          )}
          {isUploading ? (
            <div className="space-y-1">
              <ProgressBar
                value={episode.progress}
                showPercent
                label="Жүктелуде"
              />
            </div>
          ) : null}
          {isReady && !isUploading ? (
            <p className="text-[11px] text-emerald-400/80">✓ Дайын</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
