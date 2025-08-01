'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';
import { MenuItem } from '@/data/sriKanyaMenu';

interface MenuContextType {
  menuItems: MenuItem[];
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  toggleItemVisibility: (id: string) => void;
  getVisibleItems: () => MenuItem[];
  getItemsByCategory: (category: string) => MenuItem[];
  refreshMenu: () => Promise<void>;
  loading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load menu items from database
  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      } else {
        // Fallback to static data if API fails
        console.warn('Failed to load menu from API, using static data');
        const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
          ...item,
          image: `/api/food-image?item=${item.id}`
        }));
        setMenuItems(staticItems);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      // Fallback to static data
      const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
        ...item,
        image: `/api/food-image?item=${item.id}`
      }));
      setMenuItems(staticItems);
    } finally {
      setLoading(false);
    }
  };

  // Load from localStorage on mount (for offline capability)
  useEffect(() => {
    const savedMenu = localStorage.getItem('sriKanyaMenu');
    if (savedMenu) {
      try {
        const parsedMenu = JSON.parse(savedMenu);
        setMenuItems(parsedMenu);
      } catch (error) {
        console.error('Error loading menu from localStorage:', error);
      }
    }
    
    // Then load from database
    loadMenuItems();
  }, []);

  // Save to localStorage whenever menu changes
  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem('sriKanyaMenu', JSON.stringify(menuItems));
    }
  }, [menuItems]);

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      // Update in database
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setMenuItems(prev => 
          prev.map(item => 
            item.id === id 
              ? { ...item, ...updatedItem }
              : item
          )
        );
      } else {
        // Fallback: update local state only
        setMenuItems(prev => 
          prev.map(item => 
            item.id === id 
              ? { ...item, ...updates }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
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
    await loadMenuItems();
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