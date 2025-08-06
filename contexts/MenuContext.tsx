'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';
import { MenuItem } from '@/data/sriKanyaMenu';
import { getFoodImage } from '@/lib/imageMappings';

interface MenuContextType {
  menuItems: MenuItem[];
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  createMenuItem: (item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
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
      
      // Use the main menu API which returns ALL items (including disabled ones)
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
      
      // Use database images if available, otherwise use Cloudinary with fallback
      const itemsWithImages = data.map((item: MenuItem) => {
        // If database has a valid local image, use it
        if (item.image && item.image.startsWith('/menu-images/')) {
          return item;
        }
        
        // Otherwise, use Cloudinary with local fallback
        return {
          ...item,
          image: getFoodImage(item.id)
        };
      });
      
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

  // Fetch visible menu items from API (for customer menu)
  const fetchVisibleItems = async () => {
    try {
      const response = await fetch('/api/menu/visible', {
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
      
      // Always use correct images from getFoodImage, ignore database images
      const itemsWithImages = data.map((item: MenuItem) => ({
        ...item,
        image: getFoodImage(item.id) // Always use the correct image
      }));
      
      return itemsWithImages;
    } catch (error) {
      console.error('Error fetching visible menu items from API:', error);
      // Fallback to filtering local items
      return menuItems.filter(item => !item.isDisabled);
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
    let interval: NodeJS.Timeout | null = null;
    
    const setupSSE = () => {
      // Skip during build time
      if (typeof window === 'undefined' || process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
        console.log('Skipping SSE connection during build time');
        return;
      }

      try {
        eventSource = new EventSource('/api/menu/stream');
        
        eventSource.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Only respond to admin dashboard changes (menuUpdate events)
            if (data.type === 'menuUpdate') {
              console.log('Admin dashboard change detected:', data.data);
              
              // Show notification to user about admin changes
              if (data.data) {
                const updateData = data.data;
                if (updateData.action === 'created') {
                  showNotification('New menu item has been added', 'info');
                } else if (updateData.action === 'updated') {
                  showNotification('Menu item has been updated', 'info');
                } else if (updateData.action === 'deleted') {
                  showNotification('Menu item has been removed', 'warning');
                }
              }
              
              await fetchMenuItems();
              setLastServerUpdate(data.timestamp);
              
              // Dispatch custom event for immediate UI updates
              window.dispatchEvent(new CustomEvent('menuUpdated', { 
                detail: { timestamp: data.timestamp, type: data.type, source: 'admin' } 
              }));
            }
            // Ignore other types of updates (like heartbeat, general updates, etc.)
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
        };

      } catch (error) {
        console.error('SSE not supported, falling back to polling:', error);
      }
    };

    // Setup SSE connection
    setupSSE();

    // Fallback polling if SSE fails - reduced frequency to prevent frequent refreshes
    interval = setInterval(() => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        checkForUpdates();
      }
    }, 120000); // Check every 2 minutes instead of 30 seconds

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [lastServerUpdate]);

  // Update menu item via API
  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      // Get authentication headers if available (for admin operations)
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Try to get admin token from cookies
      const adminToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin-token='))
        ?.split('=')[1];

      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in as admin');
        }
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
      throw error; // Re-throw to handle in calling component
    }
  };

  const toggleItemVisibility = async (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (item) {
      await updateMenuItem(id, { isDisabled: !item.isDisabled });
    }
  };

  // Create new menu item
  const createMenuItem = async (item: Partial<MenuItem>) => {
    try {
      // Get authentication headers if available (for admin operations)
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Try to get admin token from cookies
      const adminToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin-token='))
        ?.split('=')[1];

      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch('/api/menu', {
        method: 'POST',
        headers,
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in as admin');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newItem = await response.json();
      
      // Update local state immediately
      setMenuItems(prev => [...prev, newItem]);

      // Update server timestamp
      setLastServerUpdate(Date.now());

      showNotification('Menu item created successfully', 'success');

      // Trigger immediate refresh for all clients
      await fetchMenuItems();
      
    } catch (error) {
      console.error('Error creating menu item:', error);
      showNotification('Failed to create menu item', 'warning');
      throw error;
    }
  };

  // Delete menu item
  const deleteMenuItem = async (id: string) => {
    try {
      // Get authentication headers if available (for admin operations)
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Try to get admin token from cookies
      const adminToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin-token='))
        ?.split('=')[1];

      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in as admin');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state immediately
      setMenuItems(prev => prev.filter(item => item.id !== id));

      // Update server timestamp
      setLastServerUpdate(Date.now());

      showNotification('Menu item deleted successfully', 'success');

      // Trigger immediate refresh for all clients
      await fetchMenuItems();
      
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showNotification('Failed to delete menu item', 'warning');
      throw error;
    }
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

  const getVisibleItems = () => {
    return menuItems.filter(item => !item.isDisabled);
  };

  return (
    <MenuContext.Provider value={{
      menuItems,
      updateMenuItem,
      createMenuItem,
      deleteMenuItem,
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