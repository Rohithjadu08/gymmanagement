import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        active:
          'border-emerald-500/40 bg-emerald-950/80 text-emerald-300 ring-1 ring-emerald-500/30',
        dueSoon:
          'border-amber-500/40 bg-amber-950/80 text-amber-300 ring-1 ring-amber-500/30',
        overdue:
          'border-rose-500/40 bg-rose-950/80 text-rose-300 ring-1 ring-rose-500/30',
        secondary:
          'border-slate-700 bg-slate-800 text-slate-300',
        outline: 'border-slate-700 text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
