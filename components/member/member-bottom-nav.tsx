'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Dumbbell,
  CreditCard,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MemberBottomNav() {
  const pathname = usePathname();

  if (pathname === '/member/login') {
    return null;
  }

  const memberNavTabs = [
    { name: 'Home', href: '/member/dashboard', icon: LayoutDashboard },
    { name: 'Fitness (3D)', href: '/member/fitness', icon: Activity },
    { name: 'Workouts', href: '/member/workouts', icon: Dumbbell },
    { name: 'Payments', href: '/member/payments', icon: CreditCard },
    { name: 'Profile', href: '/member/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 px-2 py-1.5 pb-safe shadow-2xl">
      <div className="flex items-center justify-around">
        {memberNavTabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/member/dashboard' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl text-[10px] font-bold transition-all min-w-[58px]',
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
      </div>
    </nav>
  );
}
