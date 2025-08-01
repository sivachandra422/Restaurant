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
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    // Initialize from static data
    return Object.values(sriKanyaMenu).flat().map(item => ({
      ...item,
      image: `/api/food-image?item=${item.id}` // Default image URL
    }));
  });

  // Load from localStorage on mount
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
  }, []);

  // Save to localStorage whenever menu changes
  useEffect(() => {
    localStorage.setItem('sriKanyaMenu', JSON.stringify(menuItems));
  }, [menuItems]);

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const toggleItemVisibility = (id: string) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, isDisabled: !item.isDisabled }
          : item
      )
    );
  };

  const getVisibleItems = () => {
    return menuItems.filter(item => !item.isDisabled);
  };

  const getItemsByCategory = (category: string) => {
    return menuItems.filter(item => 
      item.category === category && !item.isDisabled
    );
  };

  return (
    <MenuContext.Provider value={{
      menuItems,
      updateMenuItem,
      toggleItemVisibility,
      getVisibleItems,
      getItemsByCategory
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