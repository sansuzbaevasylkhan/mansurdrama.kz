'use client';

import * as React from 'react';
import { DollarSign } from 'lucide-react';
import { Payments } from '@/components/admin/Payments';
import { ToastProvider } from '@/components/ui/toast';

export default function AdminPaymentsPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Төлемдерді растау</h1>
              <p className="text-sm text-white/60">Kaspi чек арқылы қолмен ашу</p>
            </div>
          </div>

          <Payments />
        </div>
      </div>
    </ToastProvider>
  );
}

