import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Film, Star, Eye } from 'lucide-react';
import { getDramaBySlug, getDramasBySearch } from '@/lib/db';
import { VideoPlayer } from '@/components/VideoPlayer';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { DramaCard } from '@/components/DramaCard';
import { getSiteUrl, formatNumber } from '@/lib/utils';
import type { DramaListItem } from './_types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const drama = await getDramaBySlug(slug);
  if (!drama) {
    return { title: 'Дорама табылмады · MansurDrama.kz' };
  }
  const url = `${getSiteUrl()}/drama/${drama.slug}`;
  const description = drama.description?.slice(0, 200) || `${drama.title} — ${drama.totalEpisodes} бөлім. HD сапада көріңіз.`;
  return {
    title: `${drama.title} · MansurDrama.kz`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: drama.title,
      description,
      url,
      siteName: 'MansurDrama.kz',
      type: 'video.tv_show',
      images: drama.posterUrl ? [{ url: drama.posterUrl, width: 600, height: 900, alt: drama.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: drama.title,
      description,
      images: drama.posterUrl ? [drama.posterUrl] : [],
    },
  };
}

export default async function DramaPage({ params }: PageProps) {
  const { slug } = await params;
  const drama = await getDramaBySlug(slug);
  if (!drama || !drama.isPublished) notFound();

  const related = (await getDramasBySearch(''))
    .filter((d) => d.id !== drama.id)
    .slice(0, 6) as unknown as DramaListItem[];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Back link */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Каталогқа оралу
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-10">
          <div className="mx-auto md:mx-0 w-44 sm:w-56 md:w-full">
            <div className="overflow-hidden rounded-2xl border border-white/10 aspect-[2/3] bg-dark-800">
              {drama.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={drama.posterUrl}
                  alt={drama.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/30">
                  <Film className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {drama.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/70">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
                <Film className="h-3.5 w-3.5" />
                {drama.totalEpisodes} бөлім
              </span>
              {drama.rating > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {drama.rating.toFixed(1)}
                </span>
              ) : null}
              {drama.views > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
                  <Eye className="h-3.5 w-3.5" />
                  {formatNumber(drama.views)} көрілім
                </span>
              ) : null}
            </div>
            {drama.description ? (
              <p className="mt-4 text-white/70 max-w-2xl">{drama.description}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Episodes */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4">
          Бөлімдер
        </h2>
        {drama.episodes.length === 0 ? (
          <p className="text-white/60 text-sm">Әлі бөлімдер қосылмаған.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {drama.episodes.map((ep) => (
              <div
                key={ep.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/30 to-accent-500/30 text-sm font-bold text-white">
                    {ep.episodeNumber}
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">
                    {ep.title}
                  </h3>
                </div>
                <VideoPlayer
                  videoUrl={ep.videoUrl}
                  posterUrl={drama.posterUrl}
                  title={`${drama.title} — ${ep.title}`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 ? (
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4">
            Ұқсас дорамалар
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {related.map((d) => (
              <DramaCard key={d.id} drama={d} />
            ))}
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </div>
  );
}
