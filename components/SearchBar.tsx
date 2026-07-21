'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Дорама атауы немесе slug іздеу…',
}: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 pl-11 pr-11 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-all"
      />
      {value ? (
        <button
          onClick={() => onChange('')}
          aria-label="Тазалау"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </motion.div>
  );
}
