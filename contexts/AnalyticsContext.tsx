'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MenuItem } from '@/data/sriKanyaMenu';

interface OrderAnalytics {
  orderId: string;
  timestamp: string;
  items: { id: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
  tableNumber: number;
  customerName: string;
  preparationTime: number;
  status: 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  rating?: number;
  feedback?: string;
}

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularItems: { id: string; name: string; count: number; revenue: number }[];
  peakHours: { hour: number; orders: number }[];
  customerSatisfaction: number;
  averagePreparationTime: number;
  trendingItems: string[];
}

interface AnalyticsContextType {
  analytics: AnalyticsData;
  addOrder: (order: OrderAnalytics) => void;
  updateOrderStatus: (orderId: string, status: OrderAnalytics['status'], paymentStatus?: OrderAnalytics['paymentStatus'], paymentMethod?: OrderAnalytics['paymentMethod']) => void;
  addRating: (orderId: string, rating: number, feedback?: string) => void;
  getPopularItems: () => { id: string; name: string; count: number; revenue: number }[];
  getTrendingItems: () => string[];
  getPeakHours: () => { hour: number; orders: number }[];
  getPendingOrders: () => OrderAnalytics[];
  resetAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const initialAnalytics: AnalyticsData = {
  totalOrders: 0,
  totalRevenue: 0,
  averageOrderValue: 0,
  popularItems: [],
  peakHours: Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: 0 })),
  customerSatisfaction: 0,
  averagePreparationTime: 0,
  trendingItems: [],
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const [orders, setOrders] = useState<OrderAnalytics[]>([]);

  // Load analytics from localStorage
  useEffect(() => {
    try {
      const savedAnalytics = localStorage.getItem('sriKanyaAnalytics');
      const savedOrders = localStorage.getItem('sriKanyaOrders');
      
      if (savedAnalytics) {
        setAnalytics(JSON.parse(savedAnalytics));
      }
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, []);

  // Save analytics to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sriKanyaAnalytics', JSON.stringify(analytics));
      localStorage.setItem('sriKanyaOrders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }, [analytics, orders]);

  const calculateAnalytics = (orders: OrderAnalytics[]): AnalyticsData => {
    if (orders.length === 0) return initialAnalytics;

    // Only count confirmed/paid/completed orders for analytics
    const confirmedOrders = orders.filter(order => 
      order.status === 'confirmed' || order.status === 'paid' || order.status === 'completed'
    );

    const totalOrders = confirmedOrders.length;
    const totalRevenue = confirmedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate popular items (only from confirmed orders)
    const itemCounts: { [key: string]: { count: number; revenue: number; name: string } } = {};
    confirmedOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCounts[item.id]) {
          itemCounts[item.id] = { count: 0, revenue: 0, name: item.name };
        }
        itemCounts[item.id].count += item.quantity;
        itemCounts[item.id].revenue += item.price * item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate peak hours (only from confirmed orders)
    const hourCounts = Array.from({ length: 24 }, () => 0);
    confirmedOrders.forEach(order => {
      const hour = new Date(order.timestamp).getHours();
      hourCounts[hour]++;
    });

    const peakHours = hourCounts.map((orders, hour) => ({ hour, orders }));

    // Calculate customer satisfaction (only from confirmed orders)
    const ratedOrders = confirmedOrders.filter(order => order.rating !== undefined);
    const customerSatisfaction = ratedOrders.length > 0 
      ? ratedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / ratedOrders.length 
      : 0;

    // Calculate average preparation time (only from confirmed orders)
    const averagePreparationTime = confirmedOrders.length > 0 
      ? confirmedOrders.reduce((sum, order) => sum + order.preparationTime, 0) / confirmedOrders.length 
      : 0;

    // Calculate trending items (items ordered in last 7 days, only confirmed orders)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = confirmedOrders.filter(order => new Date(order.timestamp) > sevenDaysAgo);
    const recentItemCounts: { [key: string]: number } = {};
    
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        recentItemCounts[item.id] = (recentItemCounts[item.id] || 0) + item.quantity;
      });
    });

    const trendingItems = Object.entries(recentItemCounts)
      .filter(([_, count]) => count >= 3) // At least 3 orders in last 7 days
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      popularItems,
      peakHours,
      customerSatisfaction,
      averagePreparationTime,
      trendingItems,
    };
  };

  const addOrder = (order: OrderAnalytics) => {
    const newOrders = [...orders, order];
    setOrders(newOrders);
    const newAnalytics = calculateAnalytics(newOrders);
    setAnalytics(newAnalytics);
  };

  const updateOrderStatus = (orderId: string, status: OrderAnalytics['status'], paymentStatus?: OrderAnalytics['paymentStatus'], paymentMethod?: OrderAnalytics['paymentMethod']) => {
    const updatedOrders = orders.map(order => 
      order.orderId === orderId 
        ? { 
            ...order, 
            status, 
            ...(paymentStatus && { paymentStatus }),
            ...(paymentMethod && { paymentMethod })
          }
        : order
    );
    setOrders(updatedOrders);
    const newAnalytics = calculateAnalytics(updatedOrders);
    setAnalytics(newAnalytics);
  };

  const addRating = (orderId: string, rating: number, feedback?: string) => {
    const updatedOrders = orders.map(order => 
      order.orderId === orderId 
        ? { ...order, rating, feedback }
        : order
    );
    setOrders(updatedOrders);
    const newAnalytics = calculateAnalytics(updatedOrders);
    setAnalytics(newAnalytics);
  };

  const getPopularItems = () => analytics.popularItems;
  const getTrendingItems = () => analytics.trendingItems;
  const getPeakHours = () => analytics.peakHours;
  const getPendingOrders = () => orders.filter(order => order.status === 'pending');

  const resetAnalytics = () => {
    setAnalytics(initialAnalytics);
    setOrders([]);
  };

  const value: AnalyticsContextType = {
    analytics,
    addOrder,
    updateOrderStatus,
    addRating,
    getPopularItems,
    getTrendingItems,
    getPeakHours,
    getPendingOrders,
    resetAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
} 