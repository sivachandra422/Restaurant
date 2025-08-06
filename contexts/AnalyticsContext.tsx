'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  popularItems: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  todayOrders: number;
  todayRevenue: number;
  lastUpdate: Date | null;
  newOrdersCount: number;
  customerSatisfaction: number;
  totalRatings: number;
}

interface AnalyticsContextType {
  analytics: AnalyticsData;
  isRealTimeConnected: boolean;
  lastRealTimeUpdate: Date | null;
  connectRealTime: () => void;
  disconnectRealTime: () => void;
  refreshAnalytics: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    popularItems: [],
    orderStatusDistribution: [],
    todayOrders: 0,
    todayRevenue: 0,
    lastUpdate: null,
    newOrdersCount: 0,
    customerSatisfaction: 0,
    totalRatings: 0
  });
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastRealTimeUpdate, setLastRealTimeUpdate] = useState<Date | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate analytics from real order data with debouncing
  const calculateAnalytics = useCallback(async () => {
    if (isCalculating) return;
    
    setIsCalculating(true);
    try {
      const response = await fetch('/api/admin/orders/realtime');
      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || [];

        // Calculate total revenue and orders
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate today's orders and revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today;
        });
        const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

        // Calculate popular items
        const itemCounts: { [key: string]: { count: number; revenue: number } } = {};
        orders.forEach((order: any) => {
          order.items?.forEach((item: any) => {
            const itemName = item.name;
            if (!itemCounts[itemName]) {
              itemCounts[itemName] = { count: 0, revenue: 0 };
            }
            itemCounts[itemName].count += item.quantity;
            itemCounts[itemName].revenue += item.price * item.quantity;
          });
        });

        const popularItems = Object.entries(itemCounts)
          .map(([name, data]) => ({
            name,
            count: data.count,
            revenue: data.revenue
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculate order status distribution
        const statusCounts: { [key: string]: number } = {};
        orders.forEach((order: any) => {
          const status = order.status;
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const orderStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count
        }));

        // Calculate customer satisfaction from ratings
        const ordersWithRatings = orders.filter((order: any) => order.rating && order.rating > 0);
        const totalRatings = ordersWithRatings.length;
        const customerSatisfaction = totalRatings > 0 
          ? ordersWithRatings.reduce((sum: number, order: any) => sum + order.rating, 0) / totalRatings
          : 0;

        setAnalytics(prev => {
          // Only update if there are actual changes to prevent unnecessary re-renders
          const newAnalytics = {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            popularItems,
            orderStatusDistribution,
            todayOrders: todayOrders.length,
            todayRevenue,
            lastUpdate: new Date(),
            newOrdersCount: 0,
            customerSatisfaction,
            totalRatings
          };

          // Check if data has actually changed
          const hasChanged = 
            prev.totalRevenue !== totalRevenue ||
            prev.totalOrders !== totalOrders ||
            prev.averageOrderValue !== averageOrderValue ||
            prev.todayOrders !== todayOrders.length ||
            prev.todayRevenue !== todayRevenue ||
            prev.customerSatisfaction !== customerSatisfaction ||
            prev.totalRatings !== totalRatings;

          return hasChanged ? newAnalytics : prev;
        });
      }
    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [isCalculating]);

  const connectRealTime = useCallback(() => {
    setIsRealTimeConnected(true);
    setLastRealTimeUpdate(new Date());
    // Initial calculation
    calculateAnalytics();
  }, [calculateAnalytics]);

  const disconnectRealTime = useCallback(() => {
    setIsRealTimeConnected(false);
  }, []);

  const refreshAnalytics = useCallback(async () => {
    await calculateAnalytics();
  }, [calculateAnalytics]);

  // Debounced analytics update
  const debouncedCalculateAnalytics = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      calculateAnalytics();
    }, 1000); // 1 second debounce
  }, [calculateAnalytics]);

  // Listen for real-time order updates with debouncing
  useEffect(() => {
    if (!isRealTimeConnected) return;

    const handleOrderUpdate = () => {
      debouncedCalculateAnalytics();
      setLastRealTimeUpdate(new Date());
    };

    const handleFeedbackSubmitted = () => {
      debouncedCalculateAnalytics();
      setLastRealTimeUpdate(new Date());
    };

    // Listen for custom events from order updates
    window.addEventListener('order-updated', handleOrderUpdate);
    window.addEventListener('new-order', handleOrderUpdate);
    window.addEventListener('feedback-submitted', handleFeedbackSubmitted);

    return () => {
      window.removeEventListener('order-updated', handleOrderUpdate);
      window.removeEventListener('new-order', handleOrderUpdate);
      window.removeEventListener('feedback-submitted', handleFeedbackSubmitted);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isRealTimeConnected, debouncedCalculateAnalytics]);

  const value: AnalyticsContextType = {
    analytics,
    isRealTimeConnected,
    lastRealTimeUpdate,
    connectRealTime,
    disconnectRealTime,
    refreshAnalytics
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}; 