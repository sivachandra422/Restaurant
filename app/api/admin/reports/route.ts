import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Force dynamic rendering for reports API
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'sales';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json';
    
    const { db } = await connectToDatabase();
    
    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const orders = await db.collection('orders').find(dateFilter).toArray();
    const menuItems = await db.collection('menu').find({}).toArray();
    
    let report;
    
    switch (reportType) {
      case 'sales':
        report = generateSalesReport(orders, startDate, endDate);
        break;
      case 'inventory':
        report = generateInventoryReport(orders, menuItems);
        break;
      case 'customer':
        report = generateCustomerReport(orders);
        break;
      case 'performance':
        report = generatePerformanceReport(orders, menuItems);
        break;
      case 'financial':
        report = generateFinancialReport(orders);
        break;
      default:
        report = generateSalesReport(orders, startDate, endDate);
    }
    
    if (format === 'csv') {
      return generateCSVResponse(report, reportType);
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateSalesReport(orders: any[], startDate?: string | null, endDate?: string | null) {
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Sales by category
  const categorySales = new Map();
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const category = item.category || 'Unknown';
      const current = categorySales.get(category) || { quantity: 0, revenue: 0 };
      categorySales.set(category, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + (item.subtotal || 0)
      });
    });
  });
  
  // Sales by day
  const dailySales = new Map();
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt).toISOString().split('T')[0];
    const current = dailySales.get(date) || { orders: 0, revenue: 0 };
    dailySales.set(date, {
      orders: current.orders + 1,
      revenue: current.revenue + (order.totalAmount || 0)
    });
  });
  
  return {
    reportType: 'sales',
    period: { startDate, endDate },
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      uniqueCustomers: new Set(orders.map(o => o.tableNumber)).size
    },
    categoryBreakdown: Array.from(categorySales.entries()).map(([category, stats]) => ({
      category,
      ...stats
    })),
    dailyBreakdown: Array.from(dailySales.entries()).map(([date, stats]) => ({
      date,
      ...stats
    })).sort((a, b) => a.date.localeCompare(b.date)),
    topItems: calculateTopItems(orders, 10),
    generatedAt: new Date().toISOString()
  };
}

function generateInventoryReport(orders: any[], menuItems: any[]) {
  // Calculate item usage
  const itemUsage = new Map();
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const itemName = item.name;
      const current = itemUsage.get(itemName) || { quantity: 0, revenue: 0, orders: 0 };
      itemUsage.set(itemName, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + (item.subtotal || 0),
        orders: current.orders + 1
      });
    });
  });
  
  // Match with menu items to get additional info
  const inventoryItems = menuItems.map(item => {
    const usage = itemUsage.get(item.name) || { quantity: 0, revenue: 0, orders: 0 };
    return {
      name: item.name,
      category: item.category,
      price: item.price,
      isVeg: item.isVeg,
      isDisabled: item.isDisabled,
      usage: usage.quantity,
      revenue: usage.revenue,
      orderCount: usage.orders,
      performance: usage.quantity > 0 ? 'active' : 'inactive'
    };
  });
  
  return {
    reportType: 'inventory',
    summary: {
      totalItems: menuItems.length,
      activeItems: inventoryItems.filter(item => item.usage > 0).length,
      inactiveItems: inventoryItems.filter(item => item.usage === 0).length,
      totalRevenue: inventoryItems.reduce((sum, item) => sum + item.revenue, 0)
    },
    items: inventoryItems.sort((a, b) => b.usage - a.usage),
    categoryBreakdown: generateCategoryBreakdown(inventoryItems),
    performanceAnalysis: {
      topPerformers: inventoryItems.filter(item => item.usage > 0).slice(0, 10),
      lowPerformers: inventoryItems.filter(item => item.usage < 5 && item.usage > 0).slice(0, 10),
      inactiveItems: inventoryItems.filter(item => item.usage === 0)
    },
    generatedAt: new Date().toISOString()
  };
}

function generateCustomerReport(orders: any[]) {
  // Customer analysis
  const customerStats = new Map();
  orders.forEach(order => {
    const tableNumber = order.tableNumber;
    const current = customerStats.get(tableNumber) || { orders: 0, revenue: 0, items: [] };
    customerStats.set(tableNumber, {
      orders: current.orders + 1,
      revenue: current.revenue + (order.totalAmount || 0),
      items: [...current.items, ...(order.items || [])]
    });
  });
  
  const customers = Array.from(customerStats.entries()).map(([table, stats]) => ({
    table,
    orders: stats.orders,
    revenue: stats.revenue,
    averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0,
    totalItems: stats.items.length,
    favoriteItems: getFavoriteItems(stats.items)
  }));
  
  return {
    reportType: 'customer',
    summary: {
      totalCustomers: customers.length,
      repeatCustomers: customers.filter(c => c.orders > 1).length,
      averageOrdersPerCustomer: customers.length > 0 ? orders.length / customers.length : 0,
      averageRevenuePerCustomer: customers.length > 0 ? customers.reduce((sum, c) => sum + c.revenue, 0) / customers.length : 0
    },
    customers: customers.sort((a, b) => b.revenue - a.revenue),
    customerSegments: {
      highValue: customers.filter(c => c.revenue > 1000),
      mediumValue: customers.filter(c => c.revenue > 500 && c.revenue <= 1000),
      lowValue: customers.filter(c => c.revenue <= 500)
    },
    generatedAt: new Date().toISOString()
  };
}

function generatePerformanceReport(orders: any[], menuItems: any[]) {
  // Performance metrics
  const performance = {
    salesGrowth: calculateSalesGrowth(orders),
    itemPerformance: calculateItemPerformance(orders),
    categoryPerformance: calculateCategoryPerformance(orders),
    timeAnalysis: calculateTimeAnalysis(orders),
    efficiencyMetrics: calculateEfficiencyMetrics(orders)
  };
  
  return {
    reportType: 'performance',
    summary: {
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length : 0,
      peakHours: findPeakHours(orders),
      bestPerformingCategory: findBestPerformingCategory(orders)
    },
    ...performance,
    generatedAt: new Date().toISOString()
  };
}

function generateFinancialReport(orders: any[]) {
  const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const orderCount = orders.length;
  
  // Financial breakdown
  const financialData = {
    totalRevenue: revenue,
    totalOrders: orderCount,
    averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
    revenueByDay: calculateRevenueByDay(orders),
    revenueByMonth: calculateRevenueByMonth(orders),
    topRevenueItems: calculateTopRevenueItems(orders),
    revenueTrends: calculateRevenueTrends(orders)
  };
  
  return {
    reportType: 'financial',
    summary: financialData,
    detailedBreakdown: {
      dailyRevenue: financialData.revenueByDay,
      monthlyRevenue: financialData.revenueByMonth,
      itemRevenue: financialData.topRevenueItems,
      trends: financialData.revenueTrends
    },
    generatedAt: new Date().toISOString()
  };
}

// Helper functions
function calculateTopItems(orders: any[], limit: number) {
  const itemCount = new Map();
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const itemName = item.name;
      const current = itemCount.get(itemName) || { quantity: 0, revenue: 0 };
      itemCount.set(itemName, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + (item.subtotal || 0)
      });
    });
  });
  
  return Array.from(itemCount.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

function generateCategoryBreakdown(items: any[]) {
  const categoryStats = new Map();
  items.forEach(item => {
    const category = item.category;
    const current = categoryStats.get(category) || { count: 0, revenue: 0, usage: 0 };
    categoryStats.set(category, {
      count: current.count + 1,
      revenue: current.revenue + item.revenue,
      usage: current.usage + item.usage
    });
  });
  
  return Array.from(categoryStats.entries()).map(([category, stats]) => ({
    category,
    ...stats
  }));
}

function getFavoriteItems(items: any[]) {
  const itemCount = new Map();
  items.forEach(item => {
    const itemName = item.name;
    itemCount.set(itemName, (itemCount.get(itemName) || 0) + item.quantity);
  });
  
  return Array.from(itemCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function calculateSalesGrowth(orders: any[]) {
  // Simplified growth calculation
  const sortedOrders = orders.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const midPoint = Math.floor(sortedOrders.length / 2);
  
  const firstHalf = sortedOrders.slice(0, midPoint);
  const secondHalf = sortedOrders.slice(midPoint);
  
  const firstHalfRevenue = firstHalf.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const secondHalfRevenue = secondHalf.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  return {
    firstHalfRevenue,
    secondHalfRevenue,
    growthRate: firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0
  };
}

function calculateItemPerformance(orders: any[]) {
  return calculateTopItems(orders, 20);
}

function calculateCategoryPerformance(orders: any[]) {
  const categoryStats = new Map();
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const category = item.category || 'Unknown';
      const current = categoryStats.get(category) || { quantity: 0, revenue: 0 };
      categoryStats.set(category, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + (item.subtotal || 0)
      });
    });
  });
  
  return Array.from(categoryStats.entries()).map(([category, stats]) => ({
    category,
    ...stats
  })).sort((a, b) => b.revenue - a.revenue);
}

function calculateTimeAnalysis(orders: any[]) {
  const hourlyStats = new Map();
  orders.forEach(order => {
    const hour = new Date(order.timestamp || order.createdAt).getHours();
    const current = hourlyStats.get(hour) || { orders: 0, revenue: 0 };
    hourlyStats.set(hour, {
      orders: current.orders + 1,
      revenue: current.revenue + (order.totalAmount || 0)
    });
  });
  
  return Array.from({ length: 24 }, (_, hour) => ({
    hour: String(hour).padStart(2, '0'),
    ...hourlyStats.get(hour) || { orders: 0, revenue: 0 }
  }));
}

function calculateEfficiencyMetrics(orders: any[]) {
  return {
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length : 0,
    totalOrders: orders.length,
    uniqueCustomers: new Set(orders.map(o => o.tableNumber)).size
  };
}

function findPeakHours(orders: any[]) {
  const hourlyCount = new Map();
  orders.forEach(order => {
    const hour = new Date(order.timestamp || order.createdAt).getHours();
    hourlyCount.set(hour, (hourlyCount.get(hour) || 0) + 1);
  });
  
  const peakHour = Array.from(hourlyCount.entries()).reduce((max, [hour, count]) => 
    count > max.count ? { hour, count } : max, { hour: 0, count: 0 }
  );
  
  return `${peakHour.hour}:00`;
}

function findBestPerformingCategory(orders: any[]) {
  const categoryStats = new Map();
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const category = item.category || 'Unknown';
      categoryStats.set(category, (categoryStats.get(category) || 0) + (item.subtotal || 0));
    });
  });
  
  const bestCategory = Array.from(categoryStats.entries()).reduce((max, [category, revenue]) => 
    revenue > max.revenue ? { category, revenue } : max, { category: 'Unknown', revenue: 0 }
  );
  
  return bestCategory.category;
}

function calculateRevenueByDay(orders: any[]) {
  const dailyRevenue = new Map();
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt).toISOString().split('T')[0];
    dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + (order.totalAmount || 0));
  });
  
  return Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({ date, revenue }));
}

function calculateRevenueByMonth(orders: any[]) {
  const monthlyRevenue = new Map();
  orders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + (order.totalAmount || 0));
  });
  
  return Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({ month, revenue }));
}

function calculateTopRevenueItems(orders: any[]) {
  const itemRevenue = new Map();
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const itemName = item.name;
      itemRevenue.set(itemName, (itemRevenue.get(itemName) || 0) + (item.subtotal || 0));
    });
  });
  
  return Array.from(itemRevenue.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

function calculateRevenueTrends(orders: any[]) {
  // Simplified trend calculation
  const sortedOrders = orders.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const weeklyRevenue = new Map();
  
  sortedOrders.forEach(order => {
    const date = new Date(order.timestamp || order.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    weeklyRevenue.set(weekKey, (weeklyRevenue.get(weekKey) || 0) + (order.totalAmount || 0));
  });
  
  return Array.from(weeklyRevenue.entries()).map(([week, revenue]) => ({ week, revenue }));
}

function generateCSVResponse(report: any, reportType: string) {
  let csvContent = '';
  
  switch (reportType) {
    case 'sales':
      csvContent = generateSalesCSV(report);
      break;
    case 'inventory':
      csvContent = generateInventoryCSV(report);
      break;
    case 'customer':
      csvContent = generateCustomerCSV(report);
      break;
    default:
      csvContent = generateSalesCSV(report);
  }
  
  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

function generateSalesCSV(report: any) {
  let csv = 'Date,Orders,Revenue\n';
  report.dailyBreakdown.forEach((day: any) => {
    csv += `${day.date},${day.orders},${day.revenue}\n`;
  });
  return csv;
}

function generateInventoryCSV(report: any) {
  let csv = 'Item Name,Category,Price,Usage,Revenue,Performance\n';
  report.items.forEach((item: any) => {
    csv += `${item.name},${item.category},${item.price},${item.usage},${item.revenue},${item.performance}\n`;
  });
  return csv;
}

function generateCustomerCSV(report: any) {
  let csv = 'Table,Orders,Revenue,Average Order Value\n';
  report.customers.forEach((customer: any) => {
    csv += `${customer.table},${customer.orders},${customer.revenue},${customer.averageOrderValue}\n`;
  });
  return csv;
} 