import React from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      <AdminSidebar />
      <main className="lg:pl-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

