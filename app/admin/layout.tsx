import React from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminMobileHeader } from '@/components/admin/admin-mobile-header';
import { AdminBottomNav } from '@/components/admin/admin-bottom-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans flex flex-col lg:flex-row">
      <AdminSidebar />
      <AdminMobileHeader />
      <main className="flex-1 lg:pl-64 min-h-screen p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {children}
        </div>
      </main>
      <AdminBottomNav />
    </div>
  );
}


