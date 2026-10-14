'use client';

import * as React from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
import { RefundList } from '@/components/admin/RefundList';
import { ToastProvider } from '@/components/ui/toast';

export default function AdminRefundsPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Қайтару өтініштері</h1>
              <p className="text-sm text-white/60">Төлемді қайтару сұраныстарын басқару</p>
            </div>
          </div>

          <RefundList />
        </div>
      </div>
    </ToastProvider>
  );
}
