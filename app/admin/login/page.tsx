'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={null}>
      <AdminLoginForm />
    </React.Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Кіру мүмкін болмады');
      }
      toast({ title: 'Қош келдіңіз!', variant: 'success' });
      const from = search.get('from') || '/admin';
      router.replace(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Кіру мүмкін болмады');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-black p-4">
      {/* Decorative background orbs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/10 bg-dark-900/70 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8 sm:p-10">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Panel
            </h1>
            <p className="mt-1 text-sm text-white/60">
              MansurDrama.kz басқару панелі
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Құпиясөз</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                  invalid={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white"
                  aria-label={showPassword ? 'Жасыру' : 'Көрсету'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error ? (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              disabled={!password}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Тексерілуде…
                </>
              ) : (
                'Кіру'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
            Кіру деректері .env файлында (ADMIN_PASSWORD).
          </p>
        </div>
      </motion.div>
    </div>
  );
}
