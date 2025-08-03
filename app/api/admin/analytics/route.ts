import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    // Get all orders
    const orders = await db.collection('orders').find({}).toArray();
    
    // Calculate analytics
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
      customerReviewsCount: orders.filter(order => typeof order.rating === 'number').length,
      repeatCustomers: calculateRepeatCustomers(orders),
      
      // Category Performance
      categoryPerformance: calculateCategoryPerformance(orders),
      
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
      }).reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      
      // Order Status Distribution
      orderStatusDistribution: calculateOrderStatusDistribution(orders),
      
      // Table Performance
      tablePerformance: calculateTablePerformance(orders),
      
      // Time-based Analytics
      hourlyTrends: calculateHourlyTrends(orders),
      weeklyTrends: calculateWeeklyTrends(orders),
      
      // Item Performance
      topRevenueItems: calculateTopRevenueItems(orders),
      lowPerformingItems: calculateLowPerformingItems(orders),
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function calculateRevenueByPeriod(orders: any[], period: 'day' | 'month') {
  const revenueMap = new Map();
  
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt);
    let key;
    
    if (period === 'day') {
      key = date.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    const currentRevenue = revenueMap.get(key) || 0;
    revenueMap.set(key, currentRevenue + (order.totalAmount || 0));
  });
  
  return Array.from(revenueMap.entries()).map(([date, revenue]) => ({
    date,
    revenue
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function calculatePopularItems(orders: any[]) {
  const itemCount = new Map();
  const itemRevenue = new Map();
  
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const itemName = item.name;
      const currentCount = itemCount.get(itemName) || 0;
      const currentRevenue = itemRevenue.get(itemName) || 0;
      
      itemCount.set(itemName, currentCount + item.quantity);
      itemRevenue.set(itemName, currentRevenue + (item.subtotal || 0));
    });
  });
  
  return Array.from(itemCount.entries()).map(([name, count]) => ({
    name,
    count,
    revenue: itemRevenue.get(name) || 0
  })).sort((a, b) => b.count - a.count);
}

function calculatePeakHours(orders: any[]) {
  const hourCount = new Map();
  
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt);
    const hour = date.getHours();
    const currentCount = hourCount.get(hour) || 0;
    hourCount.set(hour, currentCount + 1);
  });
  
  return Array.from({ length: 24 }, (_, hour) => ({
    hour: String(hour).padStart(2, '0'),
    orders: hourCount.get(hour) || 0
  }));
}

function calculateRepeatCustomers(orders: any[]) {
  const customerOrders = new Map();
  
  orders.forEach(order => {
    const tableNumber = order.tableNumber;
    const currentCount = customerOrders.get(tableNumber) || 0;
    customerOrders.set(tableNumber, currentCount + 1);
  });
  
  const repeatCustomers = Array.from(customerOrders.values()).filter(count => count > 1).length;
  const totalCustomers = customerOrders.size;
  
  return {
    repeatCustomers,
    totalCustomers,
    repeatRate: totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0
  };
}

function calculateCategoryPerformance(orders: any[]) {
  const categoryStats = new Map();
  
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const category = item.category || 'Unknown';
      const current = categoryStats.get(category) || { count: 0, revenue: 0 };
      
      categoryStats.set(category, {
        count: current.count + item.quantity,
        revenue: current.revenue + (item.subtotal || 0)
      });
    });
  });
  
  return Array.from(categoryStats.entries()).map(([category, stats]) => ({
    category,
    ...stats
  })).sort((a, b) => b.revenue - a.revenue);
}

function calculateOrderStatusDistribution(orders: any[]) {
  const statusCount = new Map();
  
  orders.forEach(order => {
    const status = order.status || 'completed';
    const currentCount = statusCount.get(status) || 0;
    statusCount.set(status, currentCount + 1);
  });
  
  return Array.from(statusCount.entries()).map(([status, count]) => ({
    status,
    count
  }));
}

function calculateTablePerformance(orders: any[]) {
  const tableStats = new Map();
  
  orders.forEach(order => {
    const tableNumber = order.tableNumber;
    const current = tableStats.get(tableNumber) || { orders: 0, revenue: 0 };
    
    tableStats.set(tableNumber, {
      orders: current.orders + 1,
      revenue: current.revenue + (order.totalAmount || 0)
    });
  });
  
  return Array.from(tableStats.entries()).map(([table, stats]) => ({
    table,
    ...stats
  })).sort((a, b) => b.revenue - a.revenue);
}

function calculateHourlyTrends(orders: any[]) {
  const hourlyRevenue = new Map();
  
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt);
    const hour = date.getHours();
    const currentRevenue = hourlyRevenue.get(hour) || 0;
    hourlyRevenue.set(hour, currentRevenue + (order.totalAmount || 0));
  });
  
  return Array.from({ length: 24 }, (_, hour) => ({
    hour: String(hour).padStart(2, '0'),
    revenue: hourlyRevenue.get(hour) || 0
  }));
}

function calculateWeeklyTrends(orders: any[]) {
  const weeklyRevenue = new Map();
  
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    const currentRevenue = weeklyRevenue.get(weekKey) || 0;
    weeklyRevenue.set(weekKey, currentRevenue + (order.totalAmount || 0));
  });
  
  return Array.from(weeklyRevenue.entries()).map(([week, revenue]) => ({
    week,
    revenue
  })).sort((a, b) => a.week.localeCompare(b.week));
}

function calculateTopRevenueItems(orders: any[]) {
  const itemRevenue = new Map();
  
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const itemName = item.name;
      const currentRevenue = itemRevenue.get(itemName) || 0;
      itemRevenue.set(itemName, currentRevenue + (item.subtotal || 0));
    });
  });
  
  return Array.from(itemRevenue.entries()).map(([name, revenue]) => ({
    name,
    revenue
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
}

function calculateLowPerformingItems(orders: any[]) {
  const itemStats = new Map();
  
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const itemName = item.name;
      const current = itemStats.get(itemName) || { count: 0, revenue: 0 };
      
      itemStats.set(itemName, {
        count: current.count + item.quantity,
        revenue: current.revenue + (item.subtotal || 0)
      });
    });
  });
  
  return Array.from(itemStats.entries())
    .filter(([_, stats]) => stats.count < 5) // Items ordered less than 5 times
    .map(([name, stats]) => ({
      name,
      ...stats
    }))
    .sort((a, b) => a.count - b.count);
} 

function calculateCustomerSatisfaction(orders: any[]) {
  const ratings = orders
    .map(order => typeof order.rating === 'number' ? order.rating : null)
    .filter(rating => rating !== null);
  if (ratings.length === 0) return 0;
  const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return Math.round(avg * 10) / 10; // One decimal place
} 