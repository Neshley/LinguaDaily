import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2, CloudDownload, HardDriveDownload, Loader2, RefreshCw,
  Trash2, WifiOff, Download, Database, ShieldCheck
} from 'lucide-react';
import {
  clearAllLanguagePacks,
  downloadLanguagePack,
  formatBytes,
  getOfflineStatuses,
  removeLanguagePack,
  OfflinePackStatus,
} from '../services/offlineLanguageStore';

interface OfflineLearningPanelProps {
  embedded?: boolean;
}

export const OfflineLearningPanel: React.FC<OfflineLearningPanelProps> = ({ embedded = false }) => {
  const [packs, setPacks] = useState<OfflinePackStatus[]>([]);
  const [busy, setBusy] = useState<Record<string, number | 'remove' | 'update'>>({});
  const [online, setOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState('');

  const refresh = async () => {
    try { setPacks(await getOfflineStatuses()); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Unable to read offline storage.'); }
  };

  useEffect(() => {
    refresh();
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const totalBytes = useMemo(() => packs.filter(p => p.available).reduce((n, p) => n + p.sizeBytes, 0), [packs]);
  const downloadedCount = packs.filter(p => p.available).length;

  const download = async (id: string) => {
    if (!navigator.onLine) { setMessage('Connect to the internet to download or update a language pack.'); return; }
    try {
      setMessage('');
      setBusy(b => ({ ...b, [id]: 0 }));
      await downloadLanguagePack(id, p => setBusy(b => ({ ...b, [id]: p })));
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Download failed.');
    } finally {
      setBusy(b => { const n = { ...b }; delete n[id]; return n; });
    }
  };

  const remove = async (id: string) => {
    try {
      setBusy(b => ({ ...b, [id]: 'remove' }));
      await removeLanguagePack(id);
      await refresh();
    } finally {
      setBusy(b => { const n = { ...b }; delete n[id]; return n; });
    }
  };

  const downloadAll = async () => {
    if (!navigator.onLine) { setMessage('Connect to the internet to download language packs.'); return; }
    for (const pack of packs) {
      if (!pack.available) await download(pack.id);
    }
    await refresh();
  };

  const clearAll = async () => {
    if (!confirm('Remove all downloaded language packs from this device?')) return;
    await clearAllLanguagePacks();
    await refresh();
  };

  return (
    <section className={embedded ? '' : 'rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden'}>
      <div className={embedded ? '' : 'p-5 sm:p-6'}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <HardDriveDownload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Offline Learning</h2>
                <p className="text-xs text-slate-500">Download language libraries to this device.</p>
              </div>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold w-fit ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {online ? <CheckCircle2 className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {online ? 'Online' : 'Offline'}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Downloaded</div>
            <div className="text-sm font-extrabold text-slate-900 mt-1">{downloadedCount} / {packs.length}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Storage used</div>
            <div className="text-sm font-extrabold text-slate-900 mt-1">{formatBytes(totalBytes)}</div>
          </div>
        </div>

        {!online && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
            <strong>You're offline.</strong> Downloaded language libraries remain available. New downloads and updates require internet.
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">{message}</div>
        )}

        <div className="mt-5 space-y-2.5">
          {packs.map(pack => {
            const isBusy = busy[pack.id] !== undefined;
            const progress = typeof busy[pack.id] === 'number' ? busy[pack.id] : 0;
            return (
              <div key={pack.id} className="rounded-2xl border border-slate-200 p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pack.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{pack.name}</span>
                      {pack.available && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Ready offline
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {pack.available ? `${pack.itemCount} learning items · ${formatBytes(pack.sizeBytes)}` : 'Not downloaded yet'}
                    </div>
                  </div>
                  {!isBusy && !pack.available && (
                    <button onClick={() => download(pack.id)} disabled={!online} className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-3 py-2 text-[11px] font-bold disabled:opacity-40">
                      <CloudDownload className="w-3.5 h-3.5" /> Download
                    </button>
                  )}
                  {!isBusy && pack.available && (
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => download(pack.id)} disabled={!online} title="Update pack" className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(pack.id)} title="Remove pack" className="p-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {isBusy && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                      <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> {busy[pack.id] === 'remove' ? 'Removing…' : 'Downloading…'}</span>
                      {typeof busy[pack.id] === 'number' && <span>{progress}%</span>}
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-200" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <button onClick={downloadAll} disabled={!online || packs.every(p => p.available)} className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> Download all languages
          </button>
          <button onClick={refresh} className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Database className="w-3.5 h-3.5" /> Refresh status
          </button>
          <button onClick={clearAll} disabled={!downloadedCount} className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-40">
            <Trash2 className="w-3.5 h-3.5" /> Remove all downloads
          </button>
        </div>

        <p className="mt-4 text-[10px] leading-5 text-slate-400">
          Language files shipped with LinguaDaily remain part of the project. These downloads are local copies used when the device is offline. Your learning progress is stored separately on this device.
        </p>
      </div>
    </section>
  );
};
