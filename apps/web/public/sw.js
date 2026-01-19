// FileSwift Service Worker
// Caches pages and assets for offline use of client-side tools

const CACHE_NAME = 'fileswift-v1';
const STATIC_ASSETS = [
    '/',
    '/tools',
    '/tools/merge-pdf',
    '/tools/rotate-pdf',
    '/tools/split-pdf',
    '/tools/image-to-pdf',
    '/tools/image-compressor',
    '/tools/image-resizer',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Cache static assets but don't block on failure
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.log('[SW] Failed to cache some assets:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch: Network first, cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external URLs (ads, analytics, etc.)
    if (url.origin !== self.location.origin) return;

    // Skip API calls - always go to network
    if (url.pathname.startsWith('/api')) return;

    // For tool pages - network first, cache fallback
    if (url.pathname.startsWith('/tools')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache the response
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request).then((cached) => {
                        return cached || new Response('Offline - Please reconnect', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
                })
        );
        return;
    }

    // For other assets - cache first, network fallback
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request).then((response) => {
                // Don't cache non-success responses
                if (!response || response.status !== 200) {
                    return response;
                }

                // Clone and cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseClone);
                });
                return response;
            });
        })
    );
});
