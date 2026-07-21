import * as React from 'react';
import { cn } from '@/lib/utils';

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'text-sm font-medium text-white/80 tracking-wide',
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
