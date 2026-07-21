'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { HeroSection } from '@/components/HeroSection';
import { SearchBar } from '@/components/SearchBar';
import { DramaCard } from '@/components/DramaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Film } from 'lucide-react';

interface DramaListItem {
  id: string;
  title: string;
  slug: string;
  posterUrl: string;
  totalEpisodes: number;
  views?: number;
  rating?: number;
}

export default function HomePage() {
  const [dramas, setDramas] = React.useState<DramaListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const url = search
          ? `/api/dramas?q=${encodeURIComponent(search)}`
          : '/api/dramas';
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Дорамаларды жүктеу мүмкін болмады');
        const data = (await res.json()) as DramaListItem[];
        if (!cancelled) {
          setDramas(data);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Қате');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(load, 200); // light debounce
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <HeroSection />
      <section
        id="dramas"
        className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1"
      >
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Каталог
            </h2>
            <p className="text-sm text-white/60 mt-1">
              {loading ? 'Жүктелуде…' : `${dramas.length} дорама табылды`}
            </p>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {error ? (
          <EmptyState
            icon={<Film className="h-10 w-10" />}
            title="Дорамаларды жүктеу мүмкін болмады"
            description={error}
            action={
              <button
                onClick={() => window.location.reload()}
                className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm"
              >
                Қайта көру
              </button>
            }
          />
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : dramas.length === 0 ? (
          <EmptyState
            icon={<Film className="h-12 w-12" />}
            title={search ? 'Іздеу нәтижесі бос' : 'Әлі дорама жоқ'}
            description={
              search
                ? `"${search}" бойынша ештеңе табылмады. Басқа сұрау жасап көріңіз.`
                : 'Админ панелі арқылы алғашқы дораманы қосыңыз.'
            }
            action={
              search ? (
                <button
                  onClick={() => setSearch('')}
                  className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm"
                >
                  Іздеуді тазалау
                </button>
              ) : null
            }
          />
        ) : (
          <AnimatePresence>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5"
            >
              {dramas.map((d) => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <DramaCard drama={d} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}

