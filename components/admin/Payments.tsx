'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Check,
  X,
  Download,
  Phone,
  Film,
  Clock,
  Wallet,
  Inbox,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface PaymentRow {
  id: string;
  dramaSlug: string;
  dramaTitle?: string | null;
  fullName: string;
  phone: string;
  receiptUrl: string;
  type: 'next_episode' | 'full_season';
  amount: number;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

const POLL_INTERVAL_MS = 7000;

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').replace(/^8/, '7').replace(/^7?/, '7');
  const rest = digits.slice(1).padEnd(10, ' ');
  const p1 = rest.slice(0, 3).trim();
  const p2 = rest.slice(3, 6).trim();
  const p3 = rest.slice(6, 8).trim();
  const p4 = rest.slice(8, 10).trim();
  return `+7 ${p1}${p2 ? ' ' + p2 : ''}${p3 ? ' ' + p3 : ''}${p4 ? ' ' + p4 : ''}`.trim();
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('kk-KZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const TYPE_LABEL: Record<PaymentRow['type'], string> = {
  next_episode: 'Келесі серия',
  full_season: 'Толық серия',
};

async function forceDownload(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: open directly if fetch/blob fails (e.g. CORS)
    window.open(url, '_blank');
  }
}

export function Payments() {
  const [rows, setRows] = React.useState<PaymentRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPending = React.useCallback(async (silent = false) => {
    try {
      const res = await fetch('/api/payments?status=pending', { cache: 'no-store' });
      if (!res.ok) throw new Error('Сұраныстар жүктелмеді');
      const data: PaymentRow[] = await res.json();
      setRows(data);
      setError(null);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Белгісіз қате');
    }
  }, []);

  React.useEffect(() => {
    fetchPending();
    pollRef.current = setInterval(() => fetchPending(true), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchPending]);

  const handleAction = async (id: string, action: 'confirm' | 'reject') => {
    setBusyId(id);
    const prevRows = rows;
    // Optimistic update — remove from list immediately
    setRows((r) => (r ? r.filter((row) => row.id !== id) : r));
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Серверде қате шықты');
    } catch (e) {
      // Revert on failure
      setRows(prevRows);
      setError(e instanceof Error ? e.message : 'Әрекет орындалмады');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Төлемдер</h1>
          <p className="text-sm text-white/50">Тексерілуді күтіп тұрған төлем сұраныстары</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Автожаңарту {POLL_INTERVAL_MS / 1000} сек сайын
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {rows === null ? (
        <div className="flex items-center gap-2 text-white/50 text-sm py-10 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Жүктелуде…
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-white/40">
          <Inbox className="h-8 w-8" />
          <p className="text-sm">Тексеруді күтіп тұрған төлем жоқ</p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <motion.div
                key={row.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 md:p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  {/* Person */}
                  <div className="md:w-44 shrink-0">
                    <p className="text-sm font-semibold text-white truncate">{row.fullName}</p>
                    <p className="flex items-center gap-1.5 text-xs text-white/50 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {formatPhone(row.phone)}
                    </p>
                  </div>

                  {/* Drama / type / amount */}
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/35">
                        <Film className="h-3 w-3" />
                        Драма
                      </p>
                      <p className="text-sm text-white/90 truncate">
                        {row.dramaTitle || row.dramaSlug}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/35">
                        <Wallet className="h-3 w-3" />
                        Сома
                      </p>
                      <p className="text-sm text-white/90">
                        {row.amount.toLocaleString('ru-RU')}₸
                        <span className="text-white/40"> · {TYPE_LABEL[row.type]}</span>
                      </p>
                    </div>
                    <div className="min-w-0 hidden sm:block">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/35">
                        <Clock className="h-3 w-3" />
                        Уақыты
                      </p>
                      <p className="text-sm text-white/90">{formatDate(row.createdAt)}</p>
                    </div>
                  </div>

                  {/* Receipt + actions */}
                  <div className="flex items-center gap-2 md:shrink-0">
                    <button
                      onClick={() => forceDownload(row.receiptUrl, `chek-${row.fullName}-${row.id}.pdf`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 hover:text-white transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Чек
                    </button>
                    <button
                      onClick={() => handleAction(row.id, 'confirm')}
                      disabled={busyId === row.id}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50',
                        'text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20',
                      )}
                    >
                      {busyId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Растау
                    </button>
                    <button
                      onClick={() => handleAction(row.id, 'reject')}
                      disabled={busyId === row.id}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50',
                        'text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20',
                      )}
                    >
                      {busyId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      Болдырмау
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}