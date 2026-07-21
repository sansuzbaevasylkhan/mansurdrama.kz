'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white/5',
        'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/[0.06] after:to-transparent after:animate-shimmer',
        className,
      )}
      aria-hidden
    />
  );
}

export function DramaCardSkeleton() {
  return <Skeleton className="h-[260px] w-full" />;
}

export function HeroSkeleton() {
  return (
    <Skeleton className="w-full h-[60vh] md:h-[80vh] rounded-none" />
  );
}


