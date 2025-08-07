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
    avgRating?: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage?: number;
  }>;
  todayOrders: number;
  todayRevenue: number;
  lastUpdate: Date | null;
  newOrdersCount: number;
  customerSatisfaction: number;
  totalRatings: number;
  // New analytics fields
  revenueByDay: Array<{ date: string; revenue: number }>;
  revenueByMonth: Array<{ date: string; revenue: number }>;
  peakHours: Array<{ hour: string; orders: number; revenue: number }>;
  customerReviewsCount: number;
  repeatCustomers: number;
  topCustomers: Array<{
    customerId: string;
    orders: number;
    totalSpent: number;
    avgOrderValue: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    orders: number;
    revenue: number;
    items: number;
  }>;
  itemPerformance: Array<{
    name: string;
    orders: number;
    revenue: number;
    avgRating: number;
  }>;
  revenueTrends: Array<{ date: string; revenue: number }>;
}

interface AnalyticsContextType {
  analytics: AnalyticsData;
  isRealTimeConnected: boolean;
  lastRealTimeUpdate: Date | null;
  connectRealTime: () => void;
  disconnectRealTime: () => void;
  refreshAnalytics: () => Promise<void>;
  isLoading: boolean;
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
    totalRatings: 0,
    revenueByDay: [],
    revenueByMonth: [],
    peakHours: [],
    customerReviewsCount: 0,
    repeatCustomers: 0,
    topCustomers: [],
    categoryPerformance: [],
    itemPerformance: [],
    revenueTrends: []
  });
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastRealTimeUpdate, setLastRealTimeUpdate] = useState<Date | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate analytics from real order data with debouncing
  const calculateAnalytics = useCallback(async () => {
    if (isCalculating) return;
    
    setIsCalculating(true);
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};

        // Transform the data to match our interface
        const newAnalytics: AnalyticsData = {
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          averageOrderValue: data.averageOrderValue || 0,
          popularItems: data.popularItems || [],
          orderStatusDistribution: data.orderStatusDistribution || [],
          todayOrders: data.todayOrders || 0,
          todayRevenue: data.todayRevenue || 0,
          lastUpdate: new Date(),
          newOrdersCount: 0,
          customerSatisfaction: data.customerSatisfaction || 0,
          totalRatings: data.customerReviewsCount || 0,
          revenueByDay: data.revenueByDay || [],
          revenueByMonth: data.revenueByMonth || [],
          peakHours: data.peakHours || [],
          customerReviewsCount: data.customerReviewsCount || 0,
          repeatCustomers: data.repeatCustomers || 0,
          topCustomers: data.topCustomers || [],
          categoryPerformance: data.categoryPerformance || [],
          itemPerformance: data.itemPerformance || [],
          revenueTrends: data.revenueTrends || []
        };

        setAnalytics(prev => {
          // Only update if there are actual changes to prevent unnecessary re-renders
          const hasChanged = 
            prev.totalRevenue !== newAnalytics.totalRevenue ||
            prev.totalOrders !== newAnalytics.totalOrders ||
            prev.averageOrderValue !== newAnalytics.averageOrderValue ||
            prev.todayOrders !== newAnalytics.todayOrders ||
            prev.todayRevenue !== newAnalytics.todayRevenue ||
            prev.customerSatisfaction !== newAnalytics.customerSatisfaction ||
            prev.totalRatings !== newAnalytics.totalRatings ||
            prev.customerReviewsCount !== newAnalytics.customerReviewsCount ||
            prev.repeatCustomers !== newAnalytics.repeatCustomers;

          return hasChanged ? newAnalytics : prev;
        });
      } else {
        console.error('Failed to fetch analytics:', response.status);
      }
    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setIsCalculating(false);
      setIsLoading(false);
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
    refreshAnalytics,
    isLoading
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