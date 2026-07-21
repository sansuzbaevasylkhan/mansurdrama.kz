'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      {/* Backdrop gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[860px] rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 blur-3xl opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            Жаңа маусым · 100+ дорама
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Қысқа драмалар
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-pink-400 to-accent-400 bg-clip-text text-transparent">
              әлеміне қош келдіңіз
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/70">
            Кез-келген құрылғыда — телефон, планшет, ноутбук. Жоғары сапалы
            бейне, жылдам жүктелу. Тегін көру.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="#dramas"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-gradient-to-r from-primary-500 to-pink-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all"
            >
              <Play className="h-4 w-4 fill-white" />
              Көруді бастау
            </Link>
            <Link
              href="#dramas"
              className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors"
            >
              Каталог
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
