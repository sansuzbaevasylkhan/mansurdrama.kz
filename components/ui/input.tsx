'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, type = 'text', ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full h-11 px-4 rounded-xl bg-white/5 border text-white placeholder:text-white/40',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40',
          'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          'file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-sm',
          invalid
            ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500/60'
            : 'border-white/10',
          className,
        )}
        {...props}
      />
    );
  },
);

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full min-h-[96px] px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-white/40',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40',
          'transition-all duration-200 resize-vertical',
          invalid
            ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500/60'
            : 'border-white/10',
          className,
        )}
        {...props}
      />
    );
  },
);
