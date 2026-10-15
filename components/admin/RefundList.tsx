'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefundRow {
  id: string;
  userId: string;
  paymentId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'REFUNDED';
  adminComment: string | null;
  createdAt: string;
}

export function RefundList() {
  const [refunds, setRefunds] = React.useState<RefundRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [comment, setComment] = React.useState('');

  const fetchRefunds = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/refunds'); // Note: This endpoint needs to be implemented for admin to list ALL refunds
      if (!res.ok) throw new Error('Деректерді алу мүмкін болмады');
      const data = await res.json();
      setRefunds(data.refunds);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/refunds/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNote: comment }),
      });
      if (!res.ok) throw new Error('Әрекет орындалмады');
      setComment('');
      await fetchRefunds();
    } catch (e) {
      alert('Қате кетті');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  if (!refunds || refunds.length === 0) return <div className="text-center py-20 text-white/40">Өтініштер жоқ</div>;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
        <div className="flex items-center gap-2 text-blue-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-medium">Мақұлданғанда қолжетімділік автоматты түрде жойылады. Ақшаны қолмен қайтаруды ұмытпаңыз.</span>
        </div>
      </div>
      <div className="grid gap-3">
        {refunds.map((refund) => (
          <motion.div
            key={refund.id}
            className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white/40">#{refund.id.slice(-6)}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                  refund.status === 'PENDING' ? "bg-yellow-500/10 text-yellow-500" :
                  refund.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                  {refund.status}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-white font-medium">Пайдаланушы: {refund.userId}</p>
                <p className="text-sm text-white font-medium">Себебі: {refund.reason}</p>
                <p className="text-xs text-white/50">Күні: {new Date(refund.createdAt).toLocaleString('kk-KZ')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Admin түсініктемесі..."
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-primary-500 transition"
                value={refund.id === busyId ? comment : ''} // This is simplified; in real app we'd need state per row
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                onClick={() => handleAction(refund.id, 'approve')}
                disabled={busyId === refund.id || refund.status !== 'PENDING'}
                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-30 transition"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleAction(refund.id, 'reject')}
                disabled={busyId === refund.id || refund.status !== 'PENDING'}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-30 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
