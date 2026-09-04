import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Iron Pulse Fitness | Gym Management System',
  description: 'Premium fitness facility and gym management system for members, payments, and training programs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
