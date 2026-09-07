'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BellRing,
  BarChart3,
  Settings,
  LogOut,
  Dumbbell,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/admin/members', icon: Users },
  { name: 'Workout Routines', href: '/admin/workouts', icon: Dumbbell },
  { name: 'Membership Plans', href: '/admin/memberships', icon: Sparkles },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Fee Reminders', href: '/admin/reminders', icon: BellRing },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const NavContent = () => (
    <div className="flex h-full flex-col justify-between p-4 text-slate-300">
      <div>
        {/* Brand Header with Official Shiva Gym Logo */}
        <div className="flex flex-col items-center justify-center p-3 pb-4 border-b border-slate-800 space-y-2 text-center">
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 flex items-center justify-center p-1.5 group hover:border-emerald-500/50 transition-all">
            <img
              src="/images/shiva-gym-logo.png"
              alt="SHIVA GYM Official Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">SHIVA GYM</h1>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">SHAPE YOUR BODY</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
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
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <NavContent />
    </aside>
  );
}
