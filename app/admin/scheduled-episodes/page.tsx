'use client';

import * as React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { ScheduledEpisodes } from '@/components/admin/ScheduledEpisodes';
import { ToastProvider } from '@/components/ui/toast';

export default function AdminScheduledEpisodesPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Жоспарланған эпизодтар</h1>
              <p className="text-sm text-white/60">Эпизодтарды алдын ала жариялау кестесі</p>
            </div>
          </div>

          <ScheduledEpisodes />
        </div>
      </div>
    </ToastProvider>
  );
}
