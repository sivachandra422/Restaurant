'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MenuItem } from '@/data/sriKanyaMenu';

interface CustomerExperienceContextType {
  favorites: string[];
  addToFavorites: (itemId: string) => void;
  removeFromFavorites: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  orderHistory: OrderHistoryItem[];
  addToOrderHistory: (order: OrderHistoryItem) => void;
  getWaitTime: (item: MenuItem) => number;
  getPopularItems: () => MenuItem[];
  getTrendingItems: () => MenuItem[];
  submitFeedback: (orderId: string, rating: number, feedback?: string) => void;
}

interface OrderHistoryItem {
  orderId: string;
  timestamp: string;
  items: { id: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
  rating?: number;
  feedback?: string;
}

const CustomerExperienceContext = createContext<CustomerExperienceContextType | undefined>(undefined);

export function CustomerExperienceProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);

  // Load favorites and order history from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('sriKanyaFavorites');
      const savedOrderHistory = localStorage.getItem('sriKanyaOrderHistory');
      
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      if (savedOrderHistory) {
        setOrderHistory(JSON.parse(savedOrderHistory));
      }
    } catch (error) {
      console.error('Error loading customer experience data:', error);
    }
  }, []);

  // Save favorites and order history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sriKanyaFavorites', JSON.stringify(favorites));
      localStorage.setItem('sriKanyaOrderHistory', JSON.stringify(orderHistory));
    } catch (error) {
      console.error('Error saving customer experience data:', error);
    }
  }, [favorites, orderHistory]);

  const addToFavorites = (itemId: string) => {
    if (!favorites.includes(itemId)) {
      setFavorites([...favorites, itemId]);
    }
  };

  const removeFromFavorites = (itemId: string) => {
    setFavorites(favorites.filter(id => id !== itemId));
  };

  const isFavorite = (itemId: string) => {
    return favorites.includes(itemId);
  };

  const addToOrderHistory = (order: OrderHistoryItem) => {
    setOrderHistory(prev => [order, ...prev.slice(0, 9)]); // Keep last 10 orders
  };

  const getWaitTime = (item: MenuItem): number => {
    // Base preparation time from item data
    const baseTime = item.preparationTime || 20;
    
    // Add some randomness to simulate real kitchen conditions
    const variation = Math.random() * 5 - 2.5; // ±2.5 minutes
    
    // Consider kitchen load (simplified)
    const currentHour = new Date().getHours();
    const isPeakHour = (currentHour >= 12 && currentHour <= 14) || (currentHour >= 19 && currentHour <= 21);
    const peakMultiplier = isPeakHour ? 1.2 : 1.0;
    
    return Math.max(10, Math.round((baseTime + variation) * peakMultiplier));
  };

  const getPopularItems = (): MenuItem[] => {
    // This would be populated from analytics data
    // For now, return items with high popularity scores
    return [];
  };

  const getTrendingItems = (): MenuItem[] => {
    // This would be populated from analytics data
    // For now, return items marked as trending
    return [];
  };

  const submitFeedback = (orderId: string, rating: number, feedback?: string) => {
    setOrderHistory(prev => 
      prev.map(order => 
        order.orderId === orderId 
          ? { ...order, rating, feedback }
          : order
      )
    );
  };

  const value: CustomerExperienceContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    orderHistory,
    addToOrderHistory,
    getWaitTime,
    getPopularItems,
    getTrendingItems,
    submitFeedback,
  };

  return (
    <CustomerExperienceContext.Provider value={value}>
      {children}
    </CustomerExperienceContext.Provider>
  );
}

export function useCustomerExperience() {
  const context = useContext(CustomerExperienceContext);
  if (context === undefined) {
    throw new Error('useCustomerExperience must be used within a CustomerExperienceProvider');
  }
  return context;
} 