import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';

export const PWAStatus: React.FC = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onUpdate = () => setUpdateReady(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('linguadaily-sw-update', onUpdate);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onInstall);
      window.removeEventListener('linguadaily-sw-update', onUpdate);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const refresh = () => {
    navigator.serviceWorker?.controller?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  return (
    <>
      {!online && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-4 left-3 z-50 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-slate-900 text-white px-3.5 py-2.5 shadow-xl flex items-center gap-2 text-xs font-semibold">
          <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
          <span>Offline mode · downloaded languages are ready</span>
        </div>
      )}

      {online && installPrompt && (
        <div className="fixed bottom-4 left-3 right-3 md:left-auto md:right-4 md:max-w-sm z-50 rounded-2xl bg-white border border-slate-200 shadow-xl p-3.5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold text-slate-900">Install LinguaDaily</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Use it like an app and keep downloaded languages available offline.</p>
              <div className="flex gap-2 mt-2">
                <button onClick={install} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold">Install</button>
                <button onClick={() => setInstallPrompt(null)} className="px-3 py-1.5 rounded-lg text-slate-500 text-[11px] font-semibold">Not now</button>
              </div>
            </div>
            <button onClick={() => setInstallPrompt(null)} aria-label="Close" className="text-slate-400"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {updateReady && (
        <div className="fixed top-20 right-3 z-50 rounded-2xl bg-indigo-600 text-white shadow-xl p-3">
          <div className="flex items-center gap-2 text-xs font-bold">
            <RefreshCw className="w-4 h-4" /> Update ready
            <button onClick={refresh} className="ml-1 px-2 py-1 rounded-lg bg-white/15">Refresh</button>
          </div>
        </div>
      )}
    </>
  );
};
