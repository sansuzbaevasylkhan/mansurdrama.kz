'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  status: string;
  scheduledAt: string | null;
  drama: { title: string };
}

export function ScheduledEpisodes() {
  const [episodes, setEpisodes] = React.useState<ScheduledEpisode[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const fetchScheduled = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/episodes/scheduled'); // Need to implement this
      if (!res.ok) throw new Error('Деректерді алу мүмкін болмады');
      const data = await res.json();
      setEpisodes(data.episodes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchScheduled();
  }, [fetchScheduled]);

  const publishNow = async (id: string) => {
    setBusyId(id);
    try {
      // We'll use the publish-due logic or a specific single-publish endpoint
      const res = await fetch(`/api/admin/episodes/${id}/publish`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Жариялау мүмкін болмады');
      await fetchScheduled();
    } catch (e) {
      alert('Қате кетті');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  if (!episodes || episodes.length === 0) return <div className="text-center py-20 text-white/40">Жоспарланған эпизодтар жоқ</div>;

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {episodes.map((ep) => (
          <motion.div
            key={ep.id}
            className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white/40">Эп. {ep.episodeNumber}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-500">
                  {ep.status}
                </span>
              </div>
              <p className="text-sm text-white font-medium">{ep.drama.title} — {ep.title}</p>
              <p className="text-xs text-white/50 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Жариялау уақыты: {ep.scheduledAt ? new Date(ep.scheduledAt).toLocaleString('kk-KZ') : 'Белгіленбеген'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => publishNow(ep.id)}
                disabled={busyId === ep.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-primary-500 text-white hover:bg-primary-600 transition disabled:opacity-50"
              >
                {busyId === ep.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Қазір жариялау
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
