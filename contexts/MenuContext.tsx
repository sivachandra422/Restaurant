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
  getItemsByCategory: (category: string) => MenuItem[];
  refreshMenu: () => Promise<void>;
  loading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);

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

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/menu', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache busting to ensure fresh data
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

  // Poll for updates every 5 seconds (real-time sync)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMenuItems();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

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