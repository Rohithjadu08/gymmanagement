'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex flex-col space-y-1.5 pb-4 border-b border-slate-800', className)}>{children}</div>;
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn('text-xl font-bold text-white', className)}>{children}</h2>;
}

export function DialogDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-sm text-slate-400', className)}>{children}</p>;
}

export function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-center justify-end gap-3 pt-6 border-t border-slate-800', className)}>{children}</div>;
}

