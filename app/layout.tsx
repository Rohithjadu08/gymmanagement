import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHIVA GYM — SHAPE YOUR BODY | Management & Fitness Portal',
  description: 'Official SHIVA GYM Management System for members, payments, workouts, and treadmill services. Contact: Balaji (9600879081).',
  icons: {
    icon: '/images/shiva-gym-logo.png',
    shortcut: '/images/shiva-gym-logo.png',
    apple: '/images/shiva-gym-logo.png',
  },
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
