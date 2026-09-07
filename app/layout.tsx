import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaProvider } from '@/components/shared/pwa-provider';

export const metadata: Metadata = {
  title: 'Shiva Gym — Management & Fitness App',
  description: 'Official SHIVA GYM Management System for members, payments, workouts, and 3D fitness portal. Contact: Balaji (9600879081).',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Shiva Gym',
  },
  icons: {
    icon: '/images/shiva-gym-logo.png',
    shortcut: '/images/shiva-gym-logo.png',
    apple: '/images/shiva-gym-logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}

