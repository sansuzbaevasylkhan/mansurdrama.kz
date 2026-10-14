'use client';

import * as React from 'react';
import { Settings, Cpu } from 'lucide-react';
import { AppConfigManager } from '@/components/admin/AppConfigManager';
import { ToastProvider } from '@/components/ui/toast';

export default function AdminConfigPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center shadow-lg shadow-gray-500/30">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Қолданба конфигурациясы</h1>
              <p className="text-sm text-white/60">Версияларды және жаңартуларды басқару</p>
            </div>
          </div>

          <AppConfigManager />
        </div>
      </div>
    </ToastProvider>
  );
}
