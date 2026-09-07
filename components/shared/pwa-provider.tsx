'use client';

import React, { useEffect, useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone PWA mode
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // 2. Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Shiva Gym PWA SW registered:', reg.scope))
        .catch((err) => console.warn('PWA SW registration failed:', err));
    }

    // 3. Online/Offline Listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    // 4. Native Install Prompt Listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isInStandaloneMode) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted Shiva Gym PWA installation');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  return (
    <>
      {children}

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-900/95 text-rose-100 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg border-b border-rose-700 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-rose-300 animate-pulse" />
            <span>You are currently offline. Some features require an active internet connection.</span>
          </div>
          <button onClick={() => setIsOffline(false)} className="p-1 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Android Chrome PWA Install Banner */}
      {showInstallBanner && !isStandalone && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-[90] bg-slate-900 border border-emerald-500/40 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <img
              src="/images/shiva-gym-logo.png"
              alt="Shiva Gym App"
              className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
            />
            <div>
              <h4 className="font-bold text-white text-sm">Install Shiva Gym App</h4>
              <p className="text-[11px] text-slate-400">Add to home screen for instant mobile access</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Install
            </Button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
