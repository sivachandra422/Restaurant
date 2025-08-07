const CACHE_NAME = 'restaurant-menu-v3';
const urlsToCache = [
  '/',
  '/menu',
  '/api/orders',
  '/_next/static/',
  '/manifest.json',
  '/favicon.ico'
];

// Image cache configuration
const IMAGE_CACHE_NAME = 'menu-images-v2';
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// API cache configuration
const API_CACHE_NAME = 'api-cache-v1';
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME),
      caches.open(IMAGE_CACHE_NAME),
      caches.open(API_CACHE_NAME)
    ]).then(([mainCache, imageCache, apiCache]) => {
      console.log('Opened caches');
      return Promise.all([
        mainCache.addAll(urlsToCache),
        // Pre-cache critical images
        imageCache.addAll([
          '/menu-images/chicken_biryani.jpg',
          '/menu-images/paneer_butter_masala.jpg',
          '/menu-images/chicken_curry.jpg',
          '/menu-images/chicken_dum_biryani_half.jpg',
          '/menu-images/chicken_65.jpg',
          '/menu-images/chicken_fry.jpg'
        ])
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle image requests with aggressive caching
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle API requests with smart caching
  if (url.pathname.includes('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests
  event.respondWith(handleOtherRequest(request));
});

// Handle image requests
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cached image is still valid
    const cachedTime = new Date(cachedResponse.headers.get('sw-cached-time'));
    if (Date.now() - cachedTime.getTime() < IMAGE_CACHE_DURATION) {
      return cachedResponse;
    }
  }

  try {
    // Fetch from network and cache
    const networkResponse = await fetch(request);
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
  } catch (error) {
    // Return cached version if available, otherwise placeholder
    if (cachedResponse) {
      return cachedResponse;
    }
    return cache.match('/menu-images/chicken_biryani.jpg');
  }
}

// Handle API requests
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // For GET requests, try cache first, then network
  if (request.method === 'GET') {
    if (cachedResponse) {
      const cachedTime = new Date(cachedResponse.headers.get('sw-cached-time'));
      if (Date.now() - cachedTime.getTime() < API_CACHE_DURATION) {
        // Return cached response and update in background
        fetch(request).then(response => {
          if (response.ok) {
            const responseToCache = response.clone();
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cached-time', new Date().toISOString());
            
            const cachedResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers
            });
            cache.put(request, cachedResponse);
          }
        }).catch(() => {});
        
        return cachedResponse;
      }
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-time', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      cache.put(request, cachedResponse);
    }
    return response;
  } catch (error) {
    // Return cached response if available
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    // Return offline page
    return cache.match('/');
  }
}

// Handle other requests
async function handleOtherRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    throw error;
  }
}

// Background sync for pending orders
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncPendingOrders());
  } else if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification from Sri Kanya Restaurant',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      tag: data.tag || 'default'
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Sri Kanya Restaurant', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action) {
    // Handle specific actions
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification actions
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view-order':
      if (data.orderId) {
        clients.openWindow(`/admin?order=${data.orderId}`);
      }
      break;
    case 'view-menu':
      clients.openWindow('/menu');
      break;
    default:
      clients.openWindow('/');
  }
}

// Sync pending orders
async function syncPendingOrders() {
  try {
    const pendingOrders = await getPendingOrders();
    console.log('Syncing pending orders:', pendingOrders.length);
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          // Remove from pending orders
          await removePendingOrder(order.id);
          console.log('Order synced successfully:', order.orderId);
        }
      } catch (error) {
        console.error('Failed to sync order:', order.orderId, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync analytics
async function syncAnalytics() {
  try {
    const analyticsData = await getAnalyticsData();
    if (analyticsData) {
      await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData)
      });
    }
  } catch (error) {
    console.error('Analytics sync failed:', error);
  }
}

// Get pending orders from IndexedDB
async function getPendingOrders() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

// Remove pending order from IndexedDB
async function removePendingOrder(orderId) {
  // This would typically use IndexedDB
  console.log('Removing pending order:', orderId);
}

// Get analytics data from IndexedDB
async function getAnalyticsData() {
  // This would typically use IndexedDB
  return null;
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
    }
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
} 