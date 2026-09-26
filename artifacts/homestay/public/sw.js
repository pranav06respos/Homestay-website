// High-performance image caching service worker for Neel Kamal Homestay
const CACHE_NAME = 'nkh-media-cache-v1';
const MAX_ENTRIES = 120;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isImage =
    request.destination === 'image' ||
    url.hostname === 'wsrv.nl' ||
    url.pathname.includes('/api/uploads/') ||
    /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url.pathname);

  if (isImage) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Serve from cache immediately (< 5ms response!)
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            // Clone and store in cache
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return cachedResponse || Promise.reject(err);
        }
      })
    );
  }
});
