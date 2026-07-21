'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Film,
  Users,
  LogOut,
  Globe,
  DollarSign,
} from 'lucide-react';

import { cn } from '@/lib/utils';

type Tab = 'dashboard' | 'dramas' | 'users' | 'payments';

interface SidebarProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  user: { name: string; email: string };
}

const NAV: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Басты бет', icon: LayoutDashboard },
  { key: 'dramas', label: 'Дорамалар', icon: Film },
  { key: 'users', label: 'Қолданушылар', icon: Users },
  { key: 'payments', label: 'Төлемдер', icon: DollarSign },
];


export function Sidebar({ tab, onTabChange, user }: SidebarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  return (
    <aside className="md:w-64 md:min-h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-white/5 bg-dark-900/60 backdrop-blur-xl">
      <div className="flex md:flex-col h-full">
        {/* Brand */}
        <div className="p-4 md:p-6 border-b md:border-b border-white/5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Film className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">MansurDrama</p>
            <p className="text-[11px] text-white/50">Admin Panel</p>
          </div>
        </div>

        {/* Nav — horizontal on mobile, vertical on desktop */}
        <nav className="flex-1 flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = key === tab;
            return (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap',
                  active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="hidden md:block p-3 border-t border-white/5 space-y-2">
          <div className="rounded-xl p-3 bg-white/5 border border-white/5">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-white/50 truncate">{user.email}</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <Globe className="h-3.5 w-3.5" />
            Сайтқа өту
          </Link>
          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-red-500/10 transition disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            {loggingOut ? 'Шығу…' : 'Шығу'}
          </button>
        </div>
      </div>
    </aside>
  );
}