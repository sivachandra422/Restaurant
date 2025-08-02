'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';
import { MenuItem } from '@/data/sriKanyaMenu';
import { getFoodImage } from '@/lib/imageMappings';

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

  // Load menu items from static data
  const loadMenuItems = async () => {
    try {
      setLoading(true);
      
      // Use static data directly and add image URLs
      const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
        ...item,
        image: getFoodImage(item.id)
      }));
      
      setMenuItems(staticItems);
    } catch (error) {
      console.error('Error loading menu items:', error);
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

  // Load from localStorage on mount (for offline capability)
  useEffect(() => {
    const savedMenu = localStorage.getItem('sriKanyaMenu');
    if (savedMenu) {
      try {
        const parsedMenu = JSON.parse(savedMenu);
        setMenuItems(parsedMenu);
        setLoading(false);
      } catch (error) {
        console.error('Error loading menu from localStorage:', error);
        loadMenuItems();
      }
    } else {
      loadMenuItems();
    }
  }, []);

  // Save to localStorage whenever menu changes
  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem('sriKanyaMenu', JSON.stringify(menuItems));
    }
  }, [menuItems]);

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    // Update local state only for now
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates }
          : item
      )
    );
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