const CACHE_NAME = 'sri-kanya-restaurant-v1';
const urlsToCache = [
  '/',
  '/menu',
  '/api/orders',
  '/_next/static/',
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip caching for image requests to avoid interference
  if (event.request.destination === 'image') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((response) => {
            // Don't cache API calls to avoid stale data
            if (event.request.url.includes('/api/')) {
              return response;
            }
            
            // Clone the response before caching
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
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
          if (cacheName !== CACHE_NAME) {
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