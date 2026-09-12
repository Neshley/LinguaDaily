const SHELL_CACHE = 'linguadaily-shell-v4';
const RUNTIME_CACHE = 'linguadaily-runtime-v4';
const OFFLINE_PACK_CACHE = 'linguadaily-offline-language-packs-v3';
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

  // Never intercept API calls; AI requests must always reach the network.
  if (url.pathname.startsWith('/api/')) return;

  // Explicit offline language packs are managed by the app's OfflineLearningPanel.
  // If a requested pack is cached, serve it immediately; otherwise let the normal
  // network-first path report the actual failure rather than returning HTML as JSON.
  const isData = url.pathname.startsWith('/data/');
  const isNavigation = event.request.mode === 'navigate';
  const isStaticAsset = url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname === '/manifest.webmanifest';

  if (isData) {
    event.respondWith(
      caches.open(OFFLINE_PACK_CACHE).then(cache => cache.match(event.request)).then(cached => {
        if (cached) return cached;
        return fetch(event.request);
      })
    );
    return;
  }

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then(cache => cache.put('/', copy));
          }
          return response;
        })
        .catch(() => caches.match('/')
          .then(response => response || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })))
    );
    return;
  }

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }))
    );
  }
});
