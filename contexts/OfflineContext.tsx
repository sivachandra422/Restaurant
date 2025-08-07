'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  isOffline: boolean;
  isInstalled: boolean;
  showInstallPrompt: boolean;
  installApp: () => void;
  dismissInstallPrompt: () => void;
  // New PWA features
  isServiceWorkerReady: boolean;
  canInstall: boolean;
  pushNotificationSupported: boolean;
  backgroundSyncSupported: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  sendTestNotification: () => void;
  registerBackgroundSync: () => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheStatus: () => Promise<any>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [pushNotificationSupported, setPushNotificationSupported] = useState(false);
  const [backgroundSyncSupported, setBackgroundSyncSupported] = useState(false);

  // Check online status
  const handleOnline = useCallback(() => setIsOnline(true), []);
  const handleOffline = useCallback(() => setIsOnline(false), []);

  // Check if app is installed
  const checkIfInstalled = useCallback(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  // Handle PWA install prompt
  const handleBeforeInstallPrompt = useCallback((e: any) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowInstallPrompt(true);
    setCanInstall(true);
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);
        setIsServiceWorkerReady(true);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                console.log('New content is available');
              }
            });
          }
        });

        // Handle service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service worker updated');
          window.location.reload();
        });

      } catch (registrationError) {
        console.log('SW registration failed: ', registrationError);
      }
    }
  }, []);

  // Check for push notification support
  const checkPushNotificationSupport = useCallback(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushNotificationSupported(true);
    }
  }, []);

  // Check for background sync support
  const checkBackgroundSyncSupport = useCallback(() => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      setBackgroundSyncSupported(true);
    }
  }, []);

  useEffect(() => {
    // Check online status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if app is installed
    checkIfInstalled();

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker
    registerServiceWorker();

    // Check for advanced PWA features
    checkPushNotificationSupport();
    checkBackgroundSyncSupport();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [handleOnline, handleOffline, checkIfInstalled, handleBeforeInstallPrompt, registerServiceWorker, checkPushNotificationSupport, checkBackgroundSyncSupport]);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setCanInstall(false);
  };

  // Request notification permission
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!pushNotificationSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Send test notification
  const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Sri Kanya Restaurant', {
        body: 'Test notification - Your app is working perfectly!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification'
      });
    }
  };

  // Register background sync
  const registerBackgroundSync = async () => {
    if (!backgroundSyncSupported) {
      console.log('Background sync not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as any).sync.register('background-sync-orders');
        console.log('Background sync registered');
      } else {
        console.log('Background sync not supported in this browser');
      }
    } catch (error) {
      console.error('Error registering background sync:', error);
    }
  };

  // Clear cache
  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('Cache cleared successfully');
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }
  };

  // Get cache status
  const getCacheStatus = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const cacheStatus: { [key: string]: number } = {};
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          cacheStatus[name] = keys.length;
        }
        
        return cacheStatus;
      } catch (error) {
        console.error('Error getting cache status:', error);
        return {};
      }
    }
    return {};
  };

  const value: OfflineContextType = {
    isOnline,
    isOffline: !isOnline,
    isInstalled,
    showInstallPrompt,
    installApp,
    dismissInstallPrompt,
    isServiceWorkerReady,
    canInstall,
    pushNotificationSupported,
    backgroundSyncSupported,
    requestNotificationPermission,
    sendTestNotification,
    registerBackgroundSync,
    clearCache,
    getCacheStatus
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
} 