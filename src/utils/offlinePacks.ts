export interface OfflinePackStatus {
  id: string;
  label: string;
  flag: string;
  url: string;
  ready: boolean;
  bytes: number;
}

export const OFFLINE_PACKS = [
  { id: 'zh-cmn', label: 'Mandarin', flag: '🇨🇳', url: '/data/languages/zh.json' },
  { id: 'zh-yue', label: 'Cantonese', flag: '🇭🇰', url: '/data/languages/zh.json' },
  { id: 'ja', label: 'Japanese', flag: '🇯🇵', url: '/data/languages/ja.json' },
  { id: 'es', label: 'Spanish', flag: '🇪🇸', url: '/data/languages/es.json' },
  { id: 'fr', label: 'French', flag: '🇫🇷', url: '/data/languages/fr.json' },
  { id: 'de', label: 'German', flag: '🇩🇪', url: '/data/languages/de.json' },
  { id: 'ko', label: 'Korean', flag: '🇰🇷', url: '/data/languages/ko.json' },
] as const;

const CACHE_NAME = 'linguadaily-offline-language-packs-v2';
const metaKey = 'linguadaily_offline_packs_v2';

function readMeta(): Record<string, { bytes: number; savedAt: string }> {
  try { return JSON.parse(localStorage.getItem(metaKey) || '{}'); } catch { return {}; }
}

export async function getOfflinePackStatus(): Promise<OfflinePackStatus[]> {
  const cache = await caches.open(CACHE_NAME);
  const meta = readMeta();
  return Promise.all(OFFLINE_PACKS.map(async (pack) => {
    const match = await cache.match(pack.url);
    return { ...pack, ready: Boolean(match), bytes: meta[pack.id]?.bytes || 0 };
  }));
}

export async function downloadOfflinePack(id: string, onProgress?: (progress: number) => void) {
  const pack = OFFLINE_PACKS.find((item) => item.id === id);
  if (!pack) throw new Error('Offline language pack not found.');
  const response = await fetch(pack.url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not download ${pack.label}.`);
  const blob = await response.blob();
  onProgress?.(100);
  const cache = await caches.open(CACHE_NAME);
  await cache.put(pack.url, new Response(blob, { headers: { 'Content-Type': 'application/json' } }));
  const meta = readMeta();
  meta[pack.id] = { bytes: blob.size, savedAt: new Date().toISOString() };
  localStorage.setItem(metaKey, JSON.stringify(meta));
  return blob.size;
}

export async function removeOfflinePack(id: string) {
  const pack = OFFLINE_PACKS.find((item) => item.id === id);
  if (!pack) return;
  const cache = await caches.open(CACHE_NAME);
  const siblingReady = OFFLINE_PACKS.some((item) => item.id !== id && item.url === pack.url && readMeta()[item.id]);
  if (!siblingReady) await cache.delete(pack.url);
  const meta = readMeta();
  delete meta[id];
  localStorage.setItem(metaKey, JSON.stringify(meta));
}

export async function clearOfflinePacks() {
  await caches.delete(CACHE_NAME);
  localStorage.removeItem(metaKey);
}

export async function getOfflineStorageBytes() {
  const meta = readMeta();
  const countedUrls = new Set<string>();
  return OFFLINE_PACKS.reduce((total, pack) => {
    if (countedUrls.has(pack.url) || !meta[pack.id]) return total;
    countedUrls.add(pack.url);
    return total + meta[pack.id].bytes;
  }, 0);
}
