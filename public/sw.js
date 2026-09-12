const SHELL_CACHE = 'linguadaily-shell-v2';
const RUNTIME_CACHE = 'linguadaily-runtime-v2';
const OFFLINE_CONTENT_CACHE = 'linguadaily-offline-content-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/linguadaily-pwa-192.png',
  '/icons/linguadaily-pwa-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, RUNTIME_CACHE, OFFLINE_CONTENT_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function cacheRuntime(request, response) {
  if (!response || !response.ok) return response;
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Explicitly downloaded language packs are authoritative offline copies.
  if (url.pathname.startsWith('/data/languages/')) {
    event.respondWith(
      caches.open(OFFLINE_CONTENT_CACHE).then((offlineCache) =>
        offlineCache.match(event.request).then((offlineHit) => {
          if (offlineHit) return offlineHit;
          return fetch(event.request).then((response) => cacheRuntime(event.request, response));
        })
      ).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Static app assets: cache first, then refresh the runtime cache.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname === '/manifest.webmanifest') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const network = fetch(event.request).then((response) => cacheRuntime(event.request, response)).catch(() => null);
        return cached || network.then((fresh) => fresh || caches.match('/'));
      })
    );
    return;
  }

  // Navigation: network first when possible, cached shell when offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => cacheRuntime(event.request, response))
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).catch(() => caches.match('/'))
    )
  );
});
