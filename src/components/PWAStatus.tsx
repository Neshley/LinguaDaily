import { useEffect, useState } from 'react';
import { RefreshCw, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const online = () => setIsOffline(false);
    const offline = () => setIsOffline(true);
    const beforeInstall = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallPrompt(event);
      if (localStorage.getItem('linguadaily_install_dismissed') !== 'true') {
        setShowInstall(true);
      }
    };
    const appInstalled = () => {
      setInstallPrompt(null);
      setShowInstall(false);
    };
    const update = () => setUpdateReady(true);

    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', appInstalled);
    window.addEventListener('linguadaily-update-ready', update);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', appInstalled);
      window.removeEventListener('linguadaily-update-ready', update);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setShowInstall(false);
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    setShowInstall(false);
    localStorage.setItem('linguadaily_install_dismissed', 'true');
  };

  const applyUpdate = () => {
    navigator.serviceWorker?.controller?.postMessage({ type: 'SKIP_WAITING' });
  };

  return (
    <>
      {isOffline && (
        <div className="fixed left-1/2 top-3 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200">
          <WifiOff className="h-4 w-4" />
          Offline mode — saved learning data is available
        </div>
      )}

      {showInstall && installPrompt && !isOffline && (
        <div className="fixed bottom-24 left-3 right-3 z-[100] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:bottom-6">
          <img src="/icons/linguadaily-pwa-96.png" alt="LinguaDaily" className="h-12 w-12 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Install LinguaDaily</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Open it like an app and keep learning offline.</p>
          </div>
          <button onClick={install} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">Install</button>
          <button onClick={dismissInstall} aria-label="Dismiss install prompt" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {updateReady && (
        <div className="fixed bottom-24 left-3 right-3 z-[100] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-blue-200 bg-white p-3 shadow-2xl dark:border-blue-900 dark:bg-slate-900 sm:bottom-6">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">New LinguaDaily version</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update to get the latest improvements.</p>
          </div>
          <button onClick={applyUpdate} className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">
            <RefreshCw className="h-4 w-4" /> Update
          </button>
        </div>
      )}
    </>
  );
}
