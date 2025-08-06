import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET - Generate comprehensive reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const reportType = searchParams.get('type') || 'sales';

    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Build query filters
    const query: any = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Fetch orders based on filters
    const orders = await db.collection('orders').find(query).sort({ createdAt: -1 }).toArray();

    // Generate reports based on type
    let reportData: any = {};

    switch (reportType) {
      case 'sales':
        reportData = generateSalesReport(orders, category);
        break;
      case 'inventory':
        reportData = generateInventoryReport(orders, category);
        break;
      case 'customer':
        reportData = generateCustomerReport(orders);
        break;
      case 'performance':
        reportData = generatePerformanceReport(orders);
        break;
      case 'financial':
        reportData = generateFinancialReport(orders);
        break;
      case 'operational':
        reportData = generateOperationalReport(orders);
        break;
      default:
        reportData = generateSalesReport(orders, category);
    }

    return NextResponse.json({
      success: true,
      report: reportData,
      filters: { startDate, endDate, category, status, reportType },
      totalOrders: orders.length
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Generate Sales Report
function generateSalesReport(orders: any[], category?: string | null) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate daily revenue
  const dailyRevenue: { [key: string]: number } = {};
  orders.forEach(order => {
    const date = new Date(order.createdAt).toLocaleDateString();
    dailyRevenue[date] = (dailyRevenue[date] || 0) + order.totalAmount;
  });

  // Calculate top selling items
  const itemSales: { [key: string]: { count: number; revenue: number } } = {};
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      if (!category || item.category === category) {
        const itemName = item.name;
        if (!itemSales[itemName]) {
          itemSales[itemName] = { count: 0, revenue: 0 };
        }
        itemSales[itemName].count += item.quantity;
        itemSales[itemName].revenue += item.price * item.quantity;
      }
    });
  });

  const topSellingItems = Object.entries(itemSales)
    .map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
      averagePrice: data.revenue / data.count
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Calculate hourly distribution
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    orders: orders.filter(order => new Date(order.createdAt).getHours() === hour).length,
    revenue: orders
      .filter(order => new Date(order.createdAt).getHours() === hour)
      .reduce((sum, order) => sum + order.totalAmount, 0)
  }));

  return {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      uniqueCustomers: new Set(orders.map(order => order.customerPhone)).size
    },
    dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue })),
    topSellingItems,
    hourlyDistribution,
    categoryBreakdown: category ? null : getCategoryBreakdown(orders)
  };
}

// Generate Inventory Report
function generateInventoryReport(orders: any[], category?: string | null) {
  const itemUsage: { [key: string]: { count: number; revenue: number; orders: number } } = {};
  
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      if (!category || item.category === category) {
        const itemName = item.name;
        if (!itemUsage[itemName]) {
          itemUsage[itemName] = { count: 0, revenue: 0, orders: 0 };
        }
        itemUsage[itemName].count += item.quantity;
        itemUsage[itemName].revenue += item.price * item.quantity;
        itemUsage[itemName].orders += 1;
      }
    });
  });

  const itemPerformance = Object.entries(itemUsage)
    .map(([name, data]) => ({
      name,
      totalQuantity: data.count,
      totalRevenue: data.revenue,
      orderCount: data.orders,
      averageQuantity: data.count / data.orders,
      revenuePerOrder: data.revenue / data.orders
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    itemPerformance,
    categoryPerformance: category ? null : getCategoryPerformance(orders),
    lowPerformingItems: itemPerformance.filter(item => item.orderCount < 3),
    highPerformingItems: itemPerformance.slice(0, 10)
  };
}

// Generate Customer Report
function generateCustomerReport(orders: any[]) {
  const customerData: { [key: string]: { orders: number; totalSpent: number; lastOrder: Date } } = {};
  
  orders.forEach(order => {
    const customerId = order.customerPhone || `table-${order.tableNumber}`;
    if (!customerData[customerId]) {
      customerData[customerId] = { orders: 0, totalSpent: 0, lastOrder: new Date(0) };
    }
    customerData[customerId].orders += 1;
    customerData[customerId].totalSpent += order.totalAmount;
    const orderDate = new Date(order.createdAt);
    if (orderDate > customerData[customerId].lastOrder) {
      customerData[customerId].lastOrder = orderDate;
    }
  });

  const customerAnalysis = Object.entries(customerData)
    .map(([customerId, data]) => ({
      customerId,
      orderCount: data.orders,
      totalSpent: data.totalSpent,
      averageOrderValue: data.totalSpent / data.orders,
      lastOrder: data.lastOrder,
      customerType: data.totalSpent > 1000 ? 'VIP' : data.totalSpent > 500 ? 'Regular' : 'New'
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    totalCustomers: customerAnalysis.length,
    customerAnalysis,
    customerSegments: {
      vip: customerAnalysis.filter(c => c.customerType === 'VIP').length,
      regular: customerAnalysis.filter(c => c.customerType === 'Regular').length,
      new: customerAnalysis.filter(c => c.customerType === 'New').length
    },
    topCustomers: customerAnalysis.slice(0, 10)
  };
}

// Generate Performance Report
function generatePerformanceReport(orders: any[]) {
  const statusCounts: { [key: string]: number } = {};
  const preparationTimes: number[] = [];
  
  orders.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    if (order.estimatedTime) {
      preparationTimes.push(order.estimatedTime);
    }
  });

  const averagePreparationTime = preparationTimes.length > 0 
    ? preparationTimes.reduce((sum, time) => sum + time, 0) / preparationTimes.length 
    : 0;

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: (count / orders.length) * 100
  }));

  return {
    statusDistribution,
    averagePreparationTime,
    orderCompletionRate: statusCounts['delivered'] ? (statusCounts['delivered'] / orders.length) * 100 : 0,
    cancellationRate: statusCounts['cancelled'] ? (statusCounts['cancelled'] / orders.length) * 100 : 0,
    peakHours: getPeakHours(orders)
  };
}

// Generate Financial Report
function generateFinancialReport(orders: any[]) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  // Calculate monthly revenue
  const monthlyRevenue: { [key: string]: number } = {};
  orders.forEach(order => {
    const month = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount;
  });

  // Calculate payment method distribution
  const paymentMethods: { [key: string]: number } = {};
  orders.forEach(order => {
    const method = order.paymentMethod || 'cash';
    paymentMethods[method] = (paymentMethods[method] || 0) + order.totalAmount;
  });

  return {
    totalRevenue,
    monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
    paymentMethodDistribution: Object.entries(paymentMethods).map(([method, amount]) => ({
      method,
      amount,
      percentage: (amount / totalRevenue) * 100
    })),
    averageOrderValue: totalRevenue / orders.length,
    revenueGrowth: calculateRevenueGrowth(orders)
  };
}

// Generate Operational Report
function generateOperationalReport(orders: any[]) {
  const tableUsage: { [key: string]: number } = {};
  const dailyOrders: { [key: string]: number } = {};
  
  orders.forEach(order => {
    tableUsage[order.tableNumber] = (tableUsage[order.tableNumber] || 0) + 1;
    const date = new Date(order.createdAt).toLocaleDateString();
    dailyOrders[date] = (dailyOrders[date] || 0) + 1;
  });

  const busiestTables = Object.entries(tableUsage)
    .map(([table, orders]) => ({ table, orders }))
    .sort((a, b) => b.orders - a.orders);

  const dailyOrderTrend = Object.entries(dailyOrders)
    .map(([date, orders]) => ({ date, orders }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    busiestTables,
    dailyOrderTrend,
    averageOrdersPerDay: Object.values(dailyOrders).reduce((sum, count) => sum + count, 0) / Object.keys(dailyOrders).length,
    tableUtilization: Object.keys(tableUsage).length,
    operationalEfficiency: calculateOperationalEfficiency(orders)
  };
}

// Helper functions
function getCategoryBreakdown(orders: any[]) {
  const categoryRevenue: { [key: string]: number } = {};
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const category = item.category;
      categoryRevenue[category] = (categoryRevenue[category] || 0) + (item.price * item.quantity);
    });
  });
  
  return Object.entries(categoryRevenue).map(([category, revenue]) => ({
    category,
    revenue,
    percentage: (revenue / Object.values(categoryRevenue).reduce((sum, rev) => sum + rev, 0)) * 100
  }));
}

function getCategoryPerformance(orders: any[]) {
  const categoryStats: { [key: string]: { orders: number; revenue: number; items: number } } = {};
  
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const category = item.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { orders: 0, revenue: 0, items: 0 };
      }
      categoryStats[category].orders += 1;
      categoryStats[category].revenue += item.price * item.quantity;
      categoryStats[category].items += item.quantity;
    });
  });

  return Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    ...stats,
    averageOrderValue: stats.revenue / stats.orders
  }));
}

function getPeakHours(orders: any[]) {
  const hourlyCounts = Array.from({ length: 24 }, () => 0);
  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    hourlyCounts[hour]++;
  });
  
  return hourlyCounts.map((count, hour) => ({ hour, count }));
}

function calculateRevenueGrowth(orders: any[]) {
  if (orders.length < 2) return 0;
  
  const sortedOrders = orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const midPoint = Math.floor(sortedOrders.length / 2);
  
  const firstHalfRevenue = sortedOrders.slice(0, midPoint).reduce((sum, order) => sum + order.totalAmount, 0);
  const secondHalfRevenue = sortedOrders.slice(midPoint).reduce((sum, order) => sum + order.totalAmount, 0);
  
  return firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;
}

function calculateOperationalEfficiency(orders: any[]) {
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  const totalOrders = orders.length;
  
  return totalOrders > 0 ? ((completedOrders - cancelledOrders) / totalOrders) * 100 : 0;
} 