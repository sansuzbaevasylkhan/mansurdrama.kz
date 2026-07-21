'use client';

import * as React from 'react';
import { Lock, Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

const KASPI_NUMBER = '+7 776 010 9510';


export function EpisodePaywall({
  dramaId,
  episodeNumber,
  lockedTitle,
}: {
  dramaId: string;
  episodeNumber: number;
  lockedTitle?: string;
}) {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');

  const [receipt, setReceipt] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const singlePrice = 1500;
  const fullPrice = 3000;

  async function submit(type: 'SINGLE_EPISODE' | 'FULL_PACKAGE') {
    if (!email) {
      toast({ title: 'Қате', description: 'Email енгізіңіз', variant: 'warning' });

      return;
    }
    if (!receipt) {
      toast({ title: 'Қате', description: 'Чек файлын таңдаңыз', variant: 'warning' });

      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.set('email', email);
      fd.set('dramaId', dramaId);
      fd.set('type', type);
      if (type === 'SINGLE_EPISODE') {
        fd.set('episodeNumber', String(episodeNumber));
      }
      fd.set('receipt', receipt);

      const res = await fetch('/api/payments', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Төлемді жіберу мүмкін болмады');
      }

      setSent(true);
      toast({ title: 'Төлем жіберілді', description: 'Әкімші тексеріп, ашады', variant: 'success' });

    } catch (e: any) {
      toast({ title: 'Қате', description: e?.message || 'Қате', variant: 'destructive' });

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-200">
          <Lock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-white">
            {lockedTitle ? `Құлыпталған: ${lockedTitle}` : 'Құлыпталған бөлім'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-white/60">
            1-10 серия тегін. 11+ үшін қолмен төлем қажет.
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-white/60">1 серия</p>
              <p className="text-lg font-bold text-white">{singlePrice} ₸</p>
              <Button
                className="mt-2 w-full"
                size="sm"
                onClick={() => submit('SINGLE_EPISODE')}
                disabled={loading || sent}
              >
                {sent ? <CheckCircle2 className="h-4 w-4" /> : 'Төлеу'}
              </Button>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-white/60">Толық пакет</p>
              <p className="text-lg font-bold text-white">{fullPrice} ₸</p>
              <Button
                className="mt-2 w-full"
                size="sm"
                onClick={() => submit('FULL_PACKAGE')}
                disabled={loading || sent}
              >
                {sent ? <CheckCircle2 className="h-4 w-4" /> : 'Төлеу'}
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-xs text-white/60">Kaspi</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-white">{KASPI_NUMBER}</p>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="email">Email (әкімшіге байланыс)</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
              />
            </div>

            <div>
              <Label htmlFor="receipt">Чек скриншоты/файлы</Label>
              <div className="mt-2 flex items-center gap-3">
                <label
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 hover:text-white cursor-pointer"
                  htmlFor="receipt"
                >
                  <Upload className="h-4 w-4" />
                  {receipt ? receipt.name : 'Файл таңдаңыз'}
                </label>
                <Input
                  id="receipt"
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Жіберілуде…
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

