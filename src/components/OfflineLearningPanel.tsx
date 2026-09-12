import React, { useEffect, useState } from 'react';
import { Check, Download, HardDrive, RefreshCw, Trash2, WifiOff } from 'lucide-react';
import { clearOfflinePacks, downloadOfflinePack, getOfflinePackStatus, getOfflineStorageBytes, removeOfflinePack, OfflinePackStatus } from '../utils/offlinePacks';

const formatBytes = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const OfflineLearningPanel: React.FC = () => {
  const [packs, setPacks] = useState<OfflinePackStatus[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [storage, setStorage] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);

  const refresh = async () => {
    setPacks(await getOfflinePackStatus());
    setStorage(await getOfflineStorageBytes());
  };
  useEffect(() => {
    refresh();
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const handleDownload = async (id: string) => {
    if (!online) return;
    setBusy(id);
    try { await downloadOfflinePack(id); await refresh(); } finally { setBusy(null); }
  };

  const handleRemove = async (id: string) => { setBusy(id); try { await removeOfflinePack(id); await refresh(); } finally { setBusy(null); } };
  const handleAll = async () => { setBusy('all'); try { for (const pack of packs) if (!pack.ready) await downloadOfflinePack(pack.id); await refresh(); } finally { setBusy(null); } };
  const handleClear = async () => { setBusy('clear'); try { await clearOfflinePacks(); await refresh(); } finally { setBusy(null); } };

  return <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-indigo-600" /><h4 className="text-sm font-bold text-slate-900">Offline Learning</h4></div>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">Download language packs to keep vocabulary available without internet.</p>
      </div>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
        {online ? <Check className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}{online ? 'Online' : 'Offline'}
      </span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {packs.map((pack) => <div key={pack.id} className="flex items-center gap-3 rounded-xl border border-white bg-white p-3 shadow-sm">
        <span className="text-xl">{pack.flag}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-800">{pack.label}</p><p className="text-[10px] text-slate-500">{pack.ready ? `${formatBytes(pack.bytes)} · ready offline` : 'Not downloaded'}</p></div>
        {pack.ready ? <button onClick={() => handleRemove(pack.id)} disabled={busy === pack.id} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Remove offline pack"><Trash2 className="w-4 h-4" /></button> : <button onClick={() => handleDownload(pack.id)} disabled={Boolean(busy) || !online} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-2 text-[10px] font-bold text-white disabled:opacity-40">{busy === pack.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} Download</button>}
      </div>)}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
      <span className="text-[10px] font-medium text-slate-500">Offline storage: <b className="text-slate-700">{formatBytes(storage)}</b></span>
      <div className="flex gap-2"><button onClick={handleAll} disabled={Boolean(busy) || !online} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 disabled:opacity-40">Download all</button><button onClick={handleClear} disabled={Boolean(busy) || storage === 0} className="rounded-lg px-3 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-40">Clear</button></div>
    </div>
  </section>;
};
