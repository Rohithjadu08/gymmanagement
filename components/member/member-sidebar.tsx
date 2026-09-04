'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  CreditCard,
  Dumbbell,
  LogOut,
  Menu,
  X,
  Sparkles,
  Activity,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const memberNavItems = [
  { name: 'Dashboard', href: '/member/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', href: '/member/profile', icon: User },
  { name: 'My Membership', href: '/member/membership', icon: Sparkles },
  { name: 'My Payments', href: '/member/payments', icon: CreditCard },
  { name: 'My Workouts', href: '/member/workouts', icon: Dumbbell },
  { name: 'My Fitness (3D)', href: '/member/fitness', icon: Activity },
];

export function MemberSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname === '/member/login') {
    return null;
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    router.push('/member/login');
  };

  const NavContent = () => (
    <div className="flex h-full flex-col justify-between p-4 text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">SHIVA GYM</h1>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">SHAPE YOUR BODY</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1">
          {memberNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/member/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <NavContent />
      </aside>

      {/* Mobile Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 lg:hidden sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="font-bold text-white text-sm">ATHLETE PORTAL</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-950 shadow-2xl border-r border-slate-800 z-50">
            <NavContent />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl p-2 lg:hidden flex justify-around items-center">
        {memberNavItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors',
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name.replace('My ', '')}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

