// Define a versioned cache name
const CACHE_NAME = 'box-breathing-cache-v1';

// List of files to cache during installation
const urlsToCache = [
  './',                // Root of the app
  './index.html',      // Main HTML file
  './styles.css',      // CSS file for styling
  './app.js',          // Main JavaScript file
  './manifest.json',   // Web app manifest
  './icon-192.png',    // App icon (adjust path/name as needed)
  './icon-512.png'     // Larger app icon (adjust path/name as needed)
];

// Install event: Cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event: Serve from cache, fetch and cache, or fall back offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if available
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Fetch from network if not cached
        return fetch(event.request)
          .then(response => {
            // Validate and cache the response
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  console.log('Service Worker: Caching:', event.request.url);
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              console.log('Service Worker: Offline, serving index.html');
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Handle messages to skip waiting
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});