'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Film } from 'lucide-react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';

interface DramaCardProps {
  drama: {
    id: string;
    title: string;
    slug: string;
    posterUrl: string;
    totalEpisodes: number;
    views?: number;
    rating?: number;
  };
}

export function DramaCard({ drama }: DramaCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md"
    >
      <Link href={`/drama/${drama.slug}`} className="block">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-dark-800">
          {drama.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={drama.posterUrl}
              alt={drama.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/30">
              <Film className="h-12 w-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          {drama.views && drama.views > 0 ? (
            <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
              <Play className="h-3 w-3 fill-white" />
              {formatNumber(drama.views)}
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="line-clamp-2 text-sm font-semibold text-white">
              {drama.title}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
              <span>
                {drama.totalEpisodes} бөлім
              </span>
              {drama.rating && drama.rating > 0 ? (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {drama.rating.toFixed(1)}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default DramaCard;
