const SHELL_CACHE = 'linguadaily-shell-v3';
const RUNTIME_CACHE = 'linguadaily-runtime-v3';
const OFFLINE_PACK_CACHE = 'linguadaily-offline-language-packs-v2';
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/linguadaily-pwa-192.png', '/icons/linguadaily-pwa-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const keep = new Set([SHELL_CACHE, RUNTIME_CACHE, OFFLINE_PACK_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => !keep.has(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept AI/API calls.
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname === '/manifest.webmanifest')) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match('/'));
    })
  );
});
