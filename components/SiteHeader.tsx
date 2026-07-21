'use client';

import * as React from 'react';
import Link from 'next/link';
import { Tv } from 'lucide-react';
import { motion } from 'framer-motion';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: -8, scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30"
          >
            <Tv className="h-4 w-4 text-white" />
          </motion.div>
          <div className="leading-none">
            <p className="text-base font-bold tracking-tight text-white">
              MansurDrama
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/40">
              Short Drama · HD
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Басты бет
          </Link>
          <Link
            href="#dramas"
            className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Каталог
          </Link>
          <Link
            href="/admin"
            className="ml-1 inline-flex h-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 text-sm text-white transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
