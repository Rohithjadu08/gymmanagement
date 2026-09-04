import React from 'react';
import { MemberSidebar } from '@/components/member/member-sidebar';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      <MemberSidebar />
      <main className="lg:pl-64 min-h-screen p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

