const CACHE = 'linguadaily-shell-v3';
const RUNTIME = 'linguadaily-runtime-v3';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/linguadaily-pwa-192.png',
  '/icons/linguadaily-pwa-512.png',
  '/icons/linguadaily-pwa-1024.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => ![CACHE, RUNTIME].includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network first, cached app shell when offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/')))
    );
    return;
  }

  // Static assets and generated language data: cache first after first successful request.
  const cacheable = url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/data/') ||
    url.pathname === '/manifest.webmanifest';

  if (cacheable) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME).then(cache => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
  }
});
