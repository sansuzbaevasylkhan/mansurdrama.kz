'use client';

import Link from 'next/link';
import { Home, AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-black p-4">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-red-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" aria-hidden />

      <div className="relative w-full max-w-lg text-center">
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-pink-600 shadow-2xl shadow-red-500/30">
          <AlertTriangle className="h-9 w-9 text-white" />
        </div>

        <p className="text-7xl sm:text-8xl font-extrabold tracking-tighter bg-gradient-to-r from-red-400 via-pink-400 to-accent-400 bg-clip-text text-transparent">
          500
        </p>

        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Сервер қатесі
        </h1>

        <p className="mt-3 text-white/60 max-w-md mx-auto">
          Бірдеңе дұрыс болмады. Бетті жаңартып көріңіз немесе басты бетке оралыңыз.
        </p>

        {error?.digest ? (
          <p className="mt-2 text-xs text-white/40 font-mono">
            Код: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-gradient-to-r from-primary-500 to-pink-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all"
          >
            <RefreshCcw className="h-4 w-4" />
            Қайта жүктеу
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors"
          >
            <Home className="h-4 w-4" />
            Басты бетке
          </Link>
        </div>
      </div>
    </div>
  );
}
