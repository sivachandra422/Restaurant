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
  recentOrders: OrderAnalytics[];
  // Real-time additions
  todayOrders?: number;
  todayRevenue?: number;
  orderStatusDistribution?: { status: string; count: number }[];
  lastUpdate?: number;
  newOrdersCount?: number;
}

interface AnalyticsContextType {
  analytics: AnalyticsData;
  addOrder: (order: OrderAnalytics) => void;
  addRating: (orderId: string, rating: number, feedback?: string) => Promise<void>;
  getPopularItems: () => { id: string; name: string; count: number; revenue: number }[];
  getTrendingItems: () => string[];
  getPeakHours: () => { hour: number; orders: number }[];
  resetAnalytics: () => void;
  // Real-time additions
  isRealTimeConnected: boolean;
  lastRealTimeUpdate: Date | null;
  connectRealTime: () => void;
  disconnectRealTime: () => void;
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
  recentOrders: [],
  todayOrders: 0,
  todayRevenue: 0,
  orderStatusDistribution: [],
  lastUpdate: Date.now(),
  newOrdersCount: 0
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const [orders, setOrders] = useState<OrderAnalytics[]>([]);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastRealTimeUpdate, setLastRealTimeUpdate] = useState<Date | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

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

  // Real-time SSE connection
  const connectRealTime = () => {
    if (eventSource) {
      eventSource.close();
    }

    const lastUpdate = analytics.lastUpdate || Date.now();
    const newEventSource = new EventSource(`/api/admin/analytics/stream?lastUpdate=${lastUpdate}`);
    
    newEventSource.onopen = () => {
      console.log('Analytics real-time connection established');
      setIsRealTimeConnected(true);
    };

    newEventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.heartbeat) {
          // Just a heartbeat, no action needed
          return;
        }
        
        // Update analytics with real-time data
        setAnalytics(prev => ({
          ...prev,
          totalRevenue: data.totalRevenue || prev.totalRevenue,
          totalOrders: data.totalOrders || prev.totalOrders,
          averageOrderValue: data.averageOrderValue || prev.averageOrderValue,
          popularItems: data.popularItems || prev.popularItems,
          orderStatusDistribution: data.orderStatusDistribution || prev.orderStatusDistribution,
          todayOrders: data.todayOrders || prev.todayOrders,
          todayRevenue: data.todayRevenue || prev.todayRevenue,
          lastUpdate: data.lastUpdate || prev.lastUpdate,
          newOrdersCount: data.newOrdersCount || 0
        }));
        
        setLastRealTimeUpdate(new Date());
        
        // Show notification for new orders
        if (data.newOrdersCount > 0) {
          // Dispatch custom event for notifications
          window.dispatchEvent(new CustomEvent('analyticsUpdate', {
            detail: {
              type: 'newOrders',
              count: data.newOrdersCount,
              timestamp: new Date()
            }
          }));
        }
      } catch (error) {
        console.error('Error parsing analytics stream data:', error);
      }
    };

    newEventSource.onerror = (error) => {
      console.error('Analytics real-time connection error:', error);
      setIsRealTimeConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (isRealTimeConnected) {
          connectRealTime();
        }
      }, 5000);
    };

    setEventSource(newEventSource);
  };

  const disconnectRealTime = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsRealTimeConnected(false);
  };

  // Auto-connect to real-time updates when component mounts
  useEffect(() => {
    connectRealTime();
    
    return () => {
      disconnectRealTime();
    };
  }, []);

  const calculateAnalytics = (orders: OrderAnalytics[]): AnalyticsData => {
    if (orders.length === 0) return initialAnalytics;

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate popular items
    const itemCounts: { [key: string]: { count: number; revenue: number; name: string } } = {};
    orders.forEach(order => {
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

    // Calculate peak hours
    const hourCounts = Array.from({ length: 24 }, () => 0);
    orders.forEach(order => {
      const hour = new Date(order.timestamp).getHours();
      hourCounts[hour]++;
    });

    const peakHours = hourCounts.map((orders, hour) => ({ hour, orders }));

    // Calculate customer satisfaction
    const ratedOrders = orders.filter(order => order.rating !== undefined);
    const customerSatisfaction = ratedOrders.length > 0 
      ? ratedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / ratedOrders.length 
      : 0;

    // Calculate average preparation time
    const averagePreparationTime = orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.preparationTime, 0) / orders.length 
      : 0;

    // Calculate trending items (items ordered in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = orders.filter(order => new Date(order.timestamp) > sevenDaysAgo);
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
      recentOrders: orders.slice(0, 10), // Keep last 10 orders
    };
  };

  const addOrder = (order: OrderAnalytics) => {
    console.log('Adding order to analytics:', order);
    const newOrders = [...orders, order];
    setOrders(newOrders);
    const newAnalytics = calculateAnalytics(newOrders);
    setAnalytics(newAnalytics);
    console.log('Updated analytics:', newAnalytics);
  };

  const addRating = async (orderId: string, rating: number, feedback?: string) => {
    try {
      // Call the API to save the rating
      const response = await fetch(`/api/orders/${orderId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, feedback }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      // Update local state
      const updatedOrders = orders.map(order => 
        order.orderId === orderId 
          ? { ...order, rating, feedback }
          : order
      );
      setOrders(updatedOrders);
      const newAnalytics = calculateAnalytics(updatedOrders);
      setAnalytics(newAnalytics);
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  };

  const getPopularItems = () => analytics.popularItems;
  const getTrendingItems = () => analytics.trendingItems;
  const getPeakHours = () => analytics.peakHours;

  const resetAnalytics = () => {
    setAnalytics(initialAnalytics);
    setOrders([]);
  };

  const value: AnalyticsContextType = {
    analytics,
    addOrder,
    addRating,
    getPopularItems,
    getTrendingItems,
    getPeakHours,
    resetAnalytics,
    isRealTimeConnected,
    lastRealTimeUpdate,
    connectRealTime,
    disconnectRealTime,
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