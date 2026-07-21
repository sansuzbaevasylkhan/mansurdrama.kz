'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hideClose?: boolean;
}

const SIZE = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  hideClose,
}: DialogProps) {
  // Lock body scroll while open.
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // ESC to close.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={cn(
              'relative w-full overflow-hidden rounded-2xl',
              'bg-gradient-to-b from-dark-800/95 to-dark-900/95 backdrop-blur-2xl',
              'border border-white/10 shadow-2xl shadow-black/50',
              SIZE[size],
            )}
          >
            {(title || !hideClose) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-white/5">
                <div className="min-w-0">
                  {title ? (
                    <h2 className="text-lg font-semibold text-white tracking-tight">
                      {title}
                    </h2>
                  ) : null}
                  {description ? (
                    <p className="mt-1 text-sm text-white/60">{description}</p>
                  ) : null}
                </div>
                {!hideClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Жабу"
                    className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : null}
              </div>
            )}
            <div className="px-6 py-5 max-h-[calc(100vh-160px)] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Жою',
  cancelText = 'Болдырмау',
  variant = 'destructive',
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'primary';
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      {description ? (
        <p className="text-sm text-white/70 mb-5">{description}</p>
      ) : null}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="h-10 px-4 rounded-xl text-white/80 hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'h-10 px-4 rounded-xl font-semibold transition-all',
            variant === 'destructive'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-primary-500 to-pink-500 text-white',
            'disabled:opacity-50',
          )}
        >
          {loading ? 'Үстеліп жатыр…' : confirmText}
        </button>
      </div>
    </Dialog>
  );
}
