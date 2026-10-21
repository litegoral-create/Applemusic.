import React, { useState, useEffect } from 'react';
import { Download, Sparkles, Smartphone, CheckCircle, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || isDismissed) return null;

  return (
    <>
      <div className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 px-4 py-2.5 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-black/20 backdrop-blur-sm">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="text-xs">
            <span className="font-bold">Install as Native WebAPK:</span>{' '}
            <span className="text-zinc-100 hidden sm:inline">
              Edge-to-edge full screen with zero blue bar & lightning-fast offline caching.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1 rounded-full bg-white text-zinc-950 font-bold text-xs shadow hover:bg-zinc-100 transition active:scale-95 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install on Device</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-white/80 hover:text-white rounded-full transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 p-6 text-white shadow-2xl">
            <h4 className="font-bold text-base">Install on iPhone / iPad</h4>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. It launches in pure full screen with no browser borders!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
