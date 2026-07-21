'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-5 w-5" />,
  success: <CheckCircle2 className="h-5 w-5" />,
  destructive: <XCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
};

const VARIANT_CLASS: Record<ToastVariant, string> = {
  default: 'border-white/10 bg-dark-800/95 text-white',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  destructive: 'border-red-500/30 bg-red-500/10 text-red-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastItem = { id, duration: 4500, variant: 'default', ...t };
      setItems((prev) => [...prev, item]);
      if (item.duration && item.duration > 0) {
        setTimeout(() => dismiss(id), item.duration);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center px-4 sm:items-end sm:right-4 sm:left-auto"
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 16, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className={cn(
                'pointer-events-auto mb-2 w-full max-w-sm overflow-hidden rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/40',
                VARIANT_CLASS[t.variant ?? 'default'],
              )}
            >
              <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5 shrink-0">{ICONS[t.variant ?? 'default']}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{t.title}</p>
                  {t.description ? (
                    <p className="mt-0.5 text-xs opacity-80">{t.description}</p>
                  ) : null}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Жабу"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // Allow useToast() outside of a provider (e.g. in server components) without crashing.
    return {
      toast: () => {},
      dismiss: () => {},
    } satisfies ToastContextValue;
  }
  return ctx;
}
