import React from 'react';
import { MemberSidebar } from '@/components/member/member-sidebar';
import { MemberMobileHeader } from '@/components/member/member-mobile-header';
import { MemberBottomNav } from '@/components/member/member-bottom-nav';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans flex flex-col lg:flex-row">
      <MemberSidebar />
      <MemberMobileHeader />
      <main className="flex-1 lg:pl-64 min-h-screen p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {children}
        </div>
      </main>
      <MemberBottomNav />
    </div>
  );
}


