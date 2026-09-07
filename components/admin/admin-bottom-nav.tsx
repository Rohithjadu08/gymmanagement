'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BellRing,
  MoreHorizontal,
  Dumbbell,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function AdminBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  if (pathname === '/admin/login') {
    return null;
  }

  const handleLogout = async () => {
    try {
      document.cookie = 'demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    window.location.href = '/admin/login';
  };

  const navTabs = [
    { name: 'Home', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Reminders', href: '/admin/reminders', icon: BellRing },
  ];

  const moreItems = [
    { name: 'Workout Routines', href: '/admin/workouts', icon: Dumbbell, desc: 'Assign & manage exercises' },
    { name: 'Membership Plans', href: '/admin/memberships', icon: Sparkles, desc: 'Pricing & treadmill add-ons' },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3, desc: 'Revenue & growth analytics' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, desc: 'Gym profile & configuration' },
  ];

  return (
    <>
      {/* Admin Android Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 px-2 py-1.5 pb-safe shadow-2xl">
        <div className="flex items-center justify-around">
          {navTabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== '/admin/dashboard' && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-bold transition-all min-w-[64px]',
                  isActive
                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Icon className={cn('h-5 w-5 mb-0.5', isActive ? 'text-emerald-400' : 'text-slate-400')} />
                <span>{tab.name}</span>
              </Link>
            );
          })}

          {/* More Tab Button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-bold transition-all min-w-[64px]',
              moreOpen
                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <MoreHorizontal className="h-5 w-5 mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Admin More Navigation Drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative z-50 bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 pb-safe shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <img
                  src="/images/shiva-gym-logo.png"
                  alt="Shiva Gym"
                  className="w-8 h-8 rounded-lg object-contain bg-slate-900 border border-slate-800 p-0.5"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">Shiva Gym Admin</h3>
                  <p className="text-[11px] text-slate-400">Additional Management Tools</p>
                </div>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center justify-between p-3.5 rounded-2xl border transition-all',
                      isActive
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 font-bold'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setMoreOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-rose-400 text-xs font-bold hover:bg-rose-950/80 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out of Admin Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
