'use client';

import React from 'react';
import Link from 'next/link';
import { BellRing, ShieldCheck } from 'lucide-react';

export function AdminMobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 pt-safe">
      <div className="flex items-center justify-between">
        {/* Brand & Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md border border-slate-800 bg-slate-900 p-0.5 shrink-0">
            <img
              src="/images/shiva-gym-logo.png"
              alt="SHIVA GYM Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-wide leading-none">SHIVA GYM</h1>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase mt-0.5">ADMIN APP</p>
          </div>
        </Link>

        {/* Quick Fee Reminders Shortcut */}
        <Link
          href="/admin/reminders"
          className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors"
          title="Fee Reminders"
        >
          <BellRing className="w-4 h-4 text-emerald-400" />
        </Link>
      </div>
    </header>
  );
}
