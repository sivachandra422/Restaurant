import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Skipping admin analytics during build time');
      return NextResponse.json({
        success: true,
        data: {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          revenueByDay: [],
          revenueByMonth: [],
          popularItems: [],
          peakHours: [],
          customerSatisfaction: 0,
          customerReviewsCount: 0,
          repeatCustomers: 0,
          categoryPerformance: [],
          todayOrders: 0,
          todayRevenue: 0,
          orderStatusDistribution: [],
          topCustomers: [],
          revenueTrends: [],
          itemPerformance: []
        }
      });
    }

    const { db } = await connectToDatabase();
    
    // Check if database is available
    if (!db) {
      console.log('Database not available for admin analytics');
      return NextResponse.json({
        success: true,
        data: {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          revenueByDay: [],
          revenueByMonth: [],
          popularItems: [],
          peakHours: [],
          customerSatisfaction: 0,
          customerReviewsCount: 0,
          repeatCustomers: 0,
          categoryPerformance: [],
          todayOrders: 0,
          todayRevenue: 0,
          orderStatusDistribution: [],
          topCustomers: [],
          revenueTrends: [],
          itemPerformance: []
        }
      });
    }
    
    // Get all orders with proper aggregation
    const orders = await db.collection('orders').find({}).toArray();
    
    // Calculate comprehensive analytics
    const analytics = {
      // Sales Analytics
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length : 0,
      
      // Revenue by period
      revenueByDay: calculateRevenueByPeriod(orders, 'day'),
      revenueByMonth: calculateRevenueByPeriod(orders, 'month'),
      
      // Popular Items Analysis
      popularItems: calculatePopularItems(orders),
      
      // Peak Hours Analysis
      peakHours: calculatePeakHours(orders),
      
      // Customer Analytics
      customerSatisfaction: calculateCustomerSatisfaction(orders),
      customerReviewsCount: orders.filter(order => typeof order.rating === 'number' && order.rating > 0).length,
      repeatCustomers: calculateRepeatCustomers(orders),
      topCustomers: calculateTopCustomers(orders),
      
      // Category Performance
      categoryPerformance: calculateCategoryPerformance(orders),
      
      // Order Status Distribution
      orderStatusDistribution: calculateOrderStatusDistribution(orders),
      
      // Item Performance
      itemPerformance: calculateItemPerformance(orders),
      
      // Revenue Trends
      revenueTrends: calculateRevenueTrends(orders),
      
      // Real-time Stats
      todayOrders: orders.filter(order => {
        const orderDate = new Date(order.timestamp || order.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }).length,
      todayRevenue: orders.filter(order => {
        const orderDate = new Date(order.timestamp || order.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }).reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    };
    
    return NextResponse.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Error generating admin analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

// Helper functions for comprehensive analytics
function calculateRevenueByPeriod(orders: any[], period: 'day' | 'month') {
  const revenueMap = new Map();
  
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt);
    let key: string;
    
    if (period === 'day') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    }
    
    const currentRevenue = revenueMap.get(key) || 0;
    revenueMap.set(key, currentRevenue + (order.totalAmount || 0));
  });
  
  return Array.from(revenueMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 periods
}

function calculatePopularItems(orders: any[]) {
  const itemCounts: { [key: string]: { count: number; revenue: number; avgRating: number; ratings: number[] } } = {};
  
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const itemName = item.name;
      if (!itemCounts[itemName]) {
        itemCounts[itemName] = { count: 0, revenue: 0, avgRating: 0, ratings: [] };
      }
      itemCounts[itemName].count += item.quantity;
      itemCounts[itemName].revenue += (item.price || 0) * item.quantity;
      
      // Add rating if available
      if (order.rating && order.rating > 0) {
        itemCounts[itemName].ratings.push(order.rating);
      }
    });
  });
  
  // Calculate average ratings and return final data
  return Object.entries(itemCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
      avgRating: data.ratings.length > 0 
        ? Math.round((data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length) * 10) / 10
        : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculatePeakHours(orders: any[]) {
  const hourCounts = new Array(24).fill(0);
  const hourRevenue = new Array(24).fill(0);
  
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt);
    const hour = date.getHours();
    hourCounts[hour]++;
    hourRevenue[hour] += order.totalAmount || 0;
  });
  
  return hourCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    orders: count,
    revenue: hourRevenue[hour]
  }));
}

function calculateCustomerSatisfaction(orders: any[]) {
  const ordersWithRatings = orders.filter(order => order.rating && order.rating > 0);
  if (ordersWithRatings.length === 0) return 0;
  
  const totalRating = ordersWithRatings.reduce((sum, order) => sum + order.rating, 0);
  return Math.round((totalRating / ordersWithRatings.length) * 10) / 10;
}

function calculateRepeatCustomers(orders: any[]) {
  const customerOrders: { [key: string]: number } = {};
  
  orders.forEach(order => {
    const customerId = order.customerPhone || order.customerName || 'anonymous';
    customerOrders[customerId] = (customerOrders[customerId] || 0) + 1;
  });
  
  return Object.values(customerOrders).filter(count => count > 1).length;
}

function calculateTopCustomers(orders: any[]) {
  const customerData: { [key: string]: { orders: number; totalSpent: number; avgOrderValue: number } } = {};
  
  orders.forEach(order => {
    const customerId = order.customerPhone || order.customerName || 'anonymous';
    if (!customerData[customerId]) {
      customerData[customerId] = { orders: 0, totalSpent: 0, avgOrderValue: 0 };
    }
    customerData[customerId].orders++;
    customerData[customerId].totalSpent += order.totalAmount || 0;
  });
  
  // Calculate average order value
  Object.keys(customerData).forEach(customerId => {
    customerData[customerId].avgOrderValue = customerData[customerId].totalSpent / customerData[customerId].orders;
  });
  
  return Object.entries(customerData)
    .map(([customerId, data]) => ({
      customerId,
      orders: data.orders,
      totalSpent: data.totalSpent,
      avgOrderValue: Math.round(data.avgOrderValue)
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);
}

function calculateCategoryPerformance(orders: any[]) {
  const categoryData: { [key: string]: { orders: number; revenue: number; items: number } } = {};
  
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const category = item.category || 'uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = { orders: 0, revenue: 0, items: 0 };
      }
      categoryData[category].items += item.quantity;
      categoryData[category].revenue += (item.price || 0) * item.quantity;
    });
    
    // Count unique orders per category
    const orderCategories = Array.from(new Set(order.items?.map((item: any) => item.category || 'uncategorized'))) as string[];
    orderCategories.forEach(category => {
      if (categoryData[category]) {
        categoryData[category].orders++;
      }
    });
  });
  
  return Object.entries(categoryData)
    .map(([category, data]) => ({
      category,
      orders: data.orders,
      revenue: data.revenue,
      items: data.items
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function calculateOrderStatusDistribution(orders: any[]) {
  const statusCounts: { [key: string]: number } = {};
  
  orders.forEach(order => {
    const status = order.status || 'pending';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  return Object.entries(statusCounts)
    .map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / orders.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateItemPerformance(orders: any[]) {
  const itemStats: { [key: string]: { orders: number; revenue: number; avgRating: number; ratings: number[] } } = {};
  
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const itemName = item.name;
      if (!itemStats[itemName]) {
        itemStats[itemName] = { orders: 0, revenue: 0, avgRating: 0, ratings: [] };
      }
      itemStats[itemName].orders++;
      itemStats[itemName].revenue += (item.price || 0) * item.quantity;
      
      if (order.rating && order.rating > 0) {
        itemStats[itemName].ratings.push(order.rating);
      }
    });
  });
  
  // Calculate average ratings and return final data
  return Object.entries(itemStats)
    .map(([name, data]) => ({
      name,
      orders: data.orders,
      revenue: data.revenue,
      avgRating: data.ratings.length > 0 
        ? Math.round((data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length) * 10) / 10
        : 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20);
}

function calculateRevenueTrends(orders: any[]) {
  const dailyRevenue = new Map();
  
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt);
    const dateKey = date.toISOString().split('T')[0];
    const currentRevenue = dailyRevenue.get(dateKey) || 0;
    dailyRevenue.set(dateKey, currentRevenue + (order.totalAmount || 0));
  });
  
  return Array.from(dailyRevenue.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 days
} 