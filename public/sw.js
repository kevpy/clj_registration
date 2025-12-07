// Cache version - increment this on each deployment
const CACHE_VERSION = 'v2';
const CACHE_NAME = `registration-hub-${CACHE_VERSION}`;

// Assets to precache (these should be fingerprinted by Vite in production)
const PRECACHE_URLS = [
  '/',
  '/manifest.json'
];

// Install event - cache essential files and skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('registration-hub-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Convex API requests and external URLs
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('.convex.cloud')) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then((response) => {
        // Don't cache bad responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Listen for messages to skip waiting
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
