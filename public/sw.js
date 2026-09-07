const CACHE_NAME = 'shiva-gym-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/shiva-gym-logo.png',
  '/images/shiva-gym-logo.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.ico'
];

// Install Event - Cache Static Shell Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First Strategy for dynamic data, Cache First for static images/icons
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER cache Supabase API calls, authentication requests, dynamic data POST/PUT/DELETE
  if (
    url.hostname.includes('supabase') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/rest/v1') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network first strategy for page routes & app data
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful static responses
        if (response.status === 200 && (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.json'))) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Fallback to cache if offline
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.match('/');
      })
  );
});
