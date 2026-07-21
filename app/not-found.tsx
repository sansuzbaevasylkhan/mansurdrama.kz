import Link from 'next/link';
import { Home, Film, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-black p-4">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" aria-hidden />

      <div className="relative w-full max-w-lg text-center">
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-2xl shadow-primary-500/30">
          <Film className="h-9 w-9 text-white" />
        </div>

        <p className="text-7xl sm:text-8xl font-extrabold tracking-tighter bg-gradient-to-r from-primary-400 via-pink-400 to-accent-400 bg-clip-text text-transparent">
          404
        </p>

        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Дорама табылмады
        </h1>

        <p className="mt-3 text-white/60 max-w-md mx-auto">
          Сіз іздеген бет жоқ немесе жойылған. Каталогтан басқа дорама таңдап көріңіз.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-gradient-to-r from-primary-500 to-pink-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all"
          >
            <Home className="h-4 w-4" />
            Басты бетке
          </Link>
          <Link
            href="/#dramas"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors"
          >
            <Search className="h-4 w-4" />
            Каталогқа өту
          </Link>
        </div>
      </div>
    </div>
  );
}
