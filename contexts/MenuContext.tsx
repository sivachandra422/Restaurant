'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';
import { MenuItem } from '@/data/sriKanyaMenu';
import { getFoodImage } from '@/lib/imageMappings';

interface MenuContextType {
  menuItems: MenuItem[];
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  toggleItemVisibility: (id: string) => Promise<void>;
  getVisibleItems: () => MenuItem[];
  getAllItems: () => MenuItem[]; // New function for admin
  getItemsByCategory: (category: string) => MenuItem[];
  refreshMenu: () => Promise<void>;
  loading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);
  const [lastServerUpdate, setLastServerUpdate] = useState(0);

  // Show notification function
  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
      type === 'success' ? 'bg-green-500' : 
      type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  // Check for updates without fetching full data
  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/menu/last-updated', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });

      if (response.ok) {
        const data = await response.json();
        const serverLastUpdate = data.lastUpdated || 0;
        
        // Only fetch full data if there's an actual update
        if (serverLastUpdate > lastServerUpdate) {
          console.log('Menu updates detected, fetching new data...');
          await fetchMenuItems();
          setLastServerUpdate(serverLastUpdate);
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/menu', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure all items have images
      const itemsWithImages = data.map((item: MenuItem) => ({
        ...item,
        image: item.image || getFoodImage(item.id)
      }));
      
      setMenuItems(itemsWithImages);
      setLastFetch(Date.now());
    } catch (error) {
      console.error('Error fetching menu items from API:', error);
      // Fallback to static data
      const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
        ...item,
        image: getFoodImage(item.id)
      }));
      setMenuItems(staticItems);
    } finally {
      setLoading(false);
    }
  };

  // Load menu items on mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Smart polling - only check for updates, don't fetch full data unless needed
  useEffect(() => {
    // Try to use SSE first, fallback to polling
    let eventSource: EventSource | null = null;
    
    try {
      eventSource = new EventSource('/api/menu/stream');
      
      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'update') {
            console.log('Real-time update detected:', data.message);
            await fetchMenuItems();
            setLastServerUpdate(data.timestamp);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource?.close();
      };

    } catch (error) {
      console.error('SSE not supported, falling back to polling:', error);
    }

    // Fallback polling if SSE fails
    const interval = setInterval(() => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        checkForUpdates();
      }
    }, 10000); // Check every 10 seconds, but only fetch if there are changes

    return () => {
      clearInterval(interval);
      eventSource?.close();
    };
  }, [lastServerUpdate]);

  // Update menu item via API
  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedItem = await response.json();
      
      // Update local state immediately
      setMenuItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updatedItem }
            : item
        )
      );

      // Update server timestamp
      setLastServerUpdate(Date.now());

      // Show notification
      if (updates.isDisabled !== undefined) {
        const item = menuItems.find(item => item.id === id);
        if (item) {
          showNotification(
            `${item.name} has been ${updates.isDisabled ? 'disabled' : 'enabled'}`,
            'success'
          );
        }
      }

      // Trigger immediate refresh for all clients
      await fetchMenuItems();
      
    } catch (error) {
      console.error('Error updating menu item:', error);
      showNotification('Failed to update menu item', 'warning');
      // Fallback: update local state only
      setMenuItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updates }
            : item
        )
      );
    }
  };

  const toggleItemVisibility = async (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (item) {
      await updateMenuItem(id, { isDisabled: !item.isDisabled });
    }
  };

  const getVisibleItems = () => {
    return menuItems.filter(item => !item.isDisabled);
  };

  const getAllItems = () => {
    return menuItems; // Return all items including disabled ones for admin
  };

  const getItemsByCategory = (category: string) => {
    return menuItems.filter(item => 
      item.category === category && !item.isDisabled
    );
  };

  const refreshMenu = async () => {
    await fetchMenuItems();
  };

  return (
    <MenuContext.Provider value={{
      menuItems,
      updateMenuItem,
      toggleItemVisibility,
      getVisibleItems,
      getAllItems,
      getItemsByCategory,
      refreshMenu,
      loading
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
} 