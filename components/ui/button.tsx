'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/25 hover:from-primary-600 hover:to-pink-600 hover:shadow-primary-500/40',
  secondary:
    'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white backdrop-blur-md',
  outline:
    'border border-white/15 bg-transparent hover:bg-white/5 text-white',
  ghost:
    'bg-transparent hover:bg-white/5 text-white/80 hover:text-white',
  destructive:
    'bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl',
  icon: 'h-10 w-10 rounded-lg',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none',
          'transition-all duration-200 transform-gpu will-change-transform',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'active:scale-[0.97]',
          VARIANT[variant],
          SIZE[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="3"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  },
);
