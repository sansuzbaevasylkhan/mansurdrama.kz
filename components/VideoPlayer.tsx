'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

export function VideoPlayer({
  videoUrl,
  posterUrl,
  title,
  autoPlay = false,
  className,
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [muted, setMuted] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setCurrent(v.currentTime);
      if (v.duration > 0) {
        setProgress((v.currentTime / v.duration) * 100);
      }
    };
    const onLoaded = () => {
      setIsLoading(false);
      setDuration(v.duration || 0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('playing', onPlaying);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('playing', onPlaying);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const fullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/40',
        className,
      )}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        preload="metadata"
        className="w-full h-full aspect-video bg-black"
        onClick={togglePlay}
      />
      {isLoading ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      ) : null}
      {!isPlaying && !isLoading ? (
        <button
          onClick={togglePlay}
          aria-label="Ойнату"
          className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        >
          <Play className="h-7 w-7 fill-white" />
        </button>
      ) : null}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6">
        {title ? (
          <p className="text-xs text-white/80 mb-1.5 truncate">{title}</p>
        ) : null}
        <div
          onClick={seek}
          className="h-1.5 w-full cursor-pointer rounded-full bg-white/20"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-pink-500 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-white">
          <button
            onClick={togglePlay}
            className="rounded-lg p-1.5 hover:bg-white/10"
            aria-label={isPlaying ? 'Тоқтату' : 'Ойнату'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
          </button>
          <button
            onClick={toggleMute}
            className="rounded-lg p-1.5 hover:bg-white/10"
            aria-label={muted ? 'Дыбысты қосу' : 'Дыбысты өшіру'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <span className="text-xs tabular-nums text-white/70">
            {formatTime(current)} / {formatTime(duration)}
          </span>
          <span className="flex-1" />
          <button
            onClick={fullscreen}
            className="rounded-lg p-1.5 hover:bg-white/10"
            aria-label="Толық экран"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}
