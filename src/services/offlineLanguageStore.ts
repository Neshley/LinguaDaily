import { SUPPORTED_LANGUAGES } from '../data/languages';

export const OFFLINE_CACHE_NAME = 'linguadaily-offline-content-v1';
const META_KEY = 'linguadaily_offline_languages_v1';

export interface OfflineLanguagePack {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  fileId: string;
  sizeBytes: number;
  itemCount: number;
  version: string;
  downloadedAt: string;
}

export interface OfflinePackStatus extends OfflineLanguagePack {
  available: boolean;
  currentVersion: string;
  updateAvailable: boolean;
}

const PACKS = SUPPORTED_LANGUAGES
  .filter((l) => ['zh', 'ja', 'es', 'fr', 'de', 'ko'].includes(l.id))
  .map((l) => ({
    id: l.id,
    name: l.id === 'zh' ? 'Chinese' : l.name,
    nativeName: l.nativeName,
    flag: l.flag,
    fileId: l.id,
  }));

function readMeta(): Record<string, OfflineLanguagePack> {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeMeta(meta: Record<string, OfflineLanguagePack>) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

async function openOfflineCache() {
  if (!('caches' in window)) throw new Error('Offline storage is not supported by this browser.');
  return caches.open(OFFLINE_CACHE_NAME);
}

async function getManifest() {
  const response = await fetch('/data/manifest.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not read the content manifest.');
  return response.json();
}

export function getOfflinePacks() {
  return PACKS;
}

export async function getOfflineStatuses(): Promise<OfflinePackStatus[]> {
  const meta = readMeta();
  const cache = await openOfflineCache();
  const manifest = await getManifest().catch(() => ({ languages: [], generatedAt: '' }));
  const currentVersion = String(manifest.generatedAt || 'current');
  const results: OfflinePackStatus[] = [];

  for (const pack of PACKS) {
    const url = `/data/languages/${pack.fileId}.json`;
    const cached = await cache.match(url);
    const saved = meta[pack.id];
    results.push({
      ...pack,
      available: Boolean(cached && saved),
      sizeBytes: saved?.sizeBytes || 0,
      itemCount: saved?.itemCount || 0,
      version: saved?.version || '',
      downloadedAt: saved?.downloadedAt || '',
      currentVersion,
      updateAvailable: Boolean(saved && saved.version !== currentVersion),
    });
  }
  return results;
}

export async function downloadLanguagePack(
  languageId: string,
  onProgress?: (percent: number) => void
): Promise<OfflineLanguagePack> {
  const pack = PACKS.find((p) => p.id === languageId);
  if (!pack) throw new Error('Unknown language pack.');

  const manifest = await getManifest();
  const version = String(manifest.generatedAt || 'current');
  const url = `/data/languages/${pack.fileId}.json`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not download ${pack.name}.`);

  const contentLength = Number(response.headers.get('content-length') || 0);
  let responseToCache: Response;

  if (response.body && contentLength) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.byteLength;
        onProgress?.(Math.min(99, Math.round((received / contentLength) * 100)));
      }
    }
    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    responseToCache = new Response(merged, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Content-Length': String(received) },
    });
  } else {
    const blob = await response.blob();
    responseToCache = new Response(blob, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const raw = await responseToCache.clone().text();
  const data = JSON.parse(raw);
  const sizeBytes = new Blob([raw]).size;
  const itemCount = Array.isArray(data.items) ? data.items.length : 0;
  const downloadedAt = new Date().toISOString();

  const cache = await openOfflineCache();
  await cache.put(url, responseToCache.clone());

  const saved: OfflineLanguagePack = {
    ...pack,
    sizeBytes,
    itemCount,
    version,
    downloadedAt,
  };
  const meta = readMeta();
  meta[languageId] = saved;
  writeMeta(meta);
  onProgress?.(100);
  return saved;
}

export async function removeLanguagePack(languageId: string) {
  const pack = PACKS.find((p) => p.id === languageId);
  if (!pack) return;
  const cache = await openOfflineCache();
  await cache.delete(`/data/languages/${pack.fileId}.json`);
  const meta = readMeta();
  delete meta[languageId];
  writeMeta(meta);
}

export async function clearAllLanguagePacks() {
  if ('caches' in window) await caches.delete(OFFLINE_CACHE_NAME);
  localStorage.removeItem(META_KEY);
}

export function formatBytes(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
