'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Film, Users, TrendingUp, Plus, Tv } from 'lucide-react';

interface DashboardHomeProps {
  onOpenDramas: () => void;
  onOpenUsers: () => void;
  dramaCount: number;
  userCount: number;
}

export function DashboardHome({
  onOpenDramas,
  onOpenUsers,
  dramaCount,
  userCount,
}: DashboardHomeProps) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-primary-400 font-semibold">
          Басқару панелі
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Қош келдіңіз 👋
        </h1>
        <p className="mt-2 text-white/60 max-w-2xl">
          Дорамалар мен қолданушыларды бір жерден басқарыңыз. Бөлім таңдаңыз немесе төмендегі батырмаларды басыңыз.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <BigAction
          title="Дорамалар"
          subtitle="Дорама қосу, өңдеу, бөлімдерді басқару"
          icon={<Film className="h-8 w-8" />}
          gradient="from-primary-500 via-pink-500 to-rose-500"
          stat={`${dramaCount} дорама`}
          onClick={onOpenDramas}
        />
        <BigAction
          title="Қолданушылар"
          subtitle="Қолданушылар тізімі, іздеу, жою"
          icon={<Users className="h-8 w-8" />}
          gradient="from-accent-500 via-violet-500 to-indigo-500"
          stat={`${userCount} қолданушы`}
          onClick={onOpenUsers}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Барлық дорама" value={dramaCount} icon={<Tv className="h-4 w-4" />} />
        <StatCard label="Қолданушы" value={userCount} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Жүйе" value="OK" icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Тақырып" value="Dark" icon={<Plus className="h-4 w-4" />} />
      </div>
    </div>
  );
}

function BigAction({
  title,
  subtitle,
  icon,
  gradient,
  stat,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  stat: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 text-left"
    >
      <div
        className={`absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br ${gradient} opacity-30 blur-2xl transition-opacity group-hover:opacity-50`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity`}
      />
      <div className="relative">
        <div
          className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/30`}
        >
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm text-white/60">{subtitle}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/80">
          {stat}
        </div>
      </div>
    </motion.button>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 text-xs text-white/50">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
