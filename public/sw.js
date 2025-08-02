const CACHE_NAME = 'restaurant-menu-v2';
const urlsToCache = [
  '/',
  '/menu',
  '/api/orders',
  '/_next/static/',
];

// Image cache configuration
const IMAGE_CACHE_NAME = 'menu-images-v1';
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME),
      caches.open(IMAGE_CACHE_NAME)
    ]).then(([mainCache, imageCache]) => {
      console.log('Opened caches');
      return Promise.all([
        mainCache.addAll(urlsToCache),
        // Pre-cache critical images
        imageCache.addAll([
          '/menu-images/chicken_biryani.jpg',
          '/menu-images/paneer_butter_masala.jpg',
          '/menu-images/chicken_curry.jpg',
          '/menu-images/chicken_dum_biryani_half.jpg'
        ])
      ]);
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle image requests with aggressive caching
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            // Check if cached image is still valid
            const cachedTime = new Date(response.headers.get('sw-cached-time'));
            if (Date.now() - cachedTime.getTime() < IMAGE_CACHE_DURATION) {
              return response;
            }
          }

          // Fetch from network and cache
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              const headers = new Headers(responseToCache.headers);
              headers.set('sw-cached-time', new Date().toISOString());
              
              const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
              });

              cache.put(request, cachedResponse);
            }
            return networkResponse;
          }).catch(() => {
            // Return a placeholder image if network fails
            return cache.match('/menu-images/chicken_biryani.jpg');
          });
        });
      })
    );
    return;
  }

  // Skip caching for API calls to avoid stale data
  if (url.pathname.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request)
          .then((response) => {
            // Clone the response before caching
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for pending orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  try {
    const pendingOrders = await getPendingOrders();
    for (const order of pendingOrders) {
      await sendOrderToServer(order);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getPendingOrders() {
  // This would be implemented to get orders from IndexedDB
  return [];
}

async function sendOrderToServer(order) {
  // This would be implemented to send order to server
  return fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });
} 