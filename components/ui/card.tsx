'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, hoverable = false, glass = true, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-white/10',
        glass ? 'bg-white/[0.03] backdrop-blur-md' : 'bg-dark-800/80',
        hoverable &&
          'transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-primary-500/10',
        className,
      )}
      {...props}
    />
  );
});

export function MotionCard({
  className,
  children,
  ...rest
}: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={cn(
        'rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden',
        className,
      )}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  );
}
