import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    let orders: any[] = [];
    
    if (!db) {
      // Fallback: Get orders from API
      try {
        const ordersResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders`);
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          orders = ordersData.orders || ordersData || [];
        }
      } catch (fallbackError) {
        console.error('Fallback orders fetch failed:', fallbackError);
      }
    } else {
      // Get orders from database
      const ordersCollection = db.collection('orders');
      orders = await ordersCollection.find({}).toArray();
    }
    
    const aiAnalytics = generateAIAnalytics(orders);
    
    return NextResponse.json({
      success: true,
      data: aiAnalytics
    });

  } catch (error) {
    console.error('Error generating AI analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI analytics'
    }, { status: 500 });
  }
}

function generateAIAnalytics(orders: any[]) {
  const now = new Date();
  const last7Days = orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.timestamp);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return orderDate >= sevenDaysAgo;
  });
  
  const last30Days = orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.timestamp);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orderDate >= thirtyDaysAgo;
  });
  
  // AI Revenue Prediction (based on trend analysis)
  const dailyRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.timestamp);
      return orderDate >= dayStart && orderDate < dayEnd;
    });
    
    const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    dailyRevenue.push(dayRevenue);
  }
  
  // Simple linear regression for prediction
  const avgRevenue = dailyRevenue.reduce((sum, rev) => sum + rev, 0) / dailyRevenue.length;
  const trend = dailyRevenue.length > 1 
    ? (dailyRevenue[dailyRevenue.length - 1] - dailyRevenue[0]) / dailyRevenue.length
    : 0;
  
  const predictedRevenue = Math.max(0, Math.round(avgRevenue * 7 + trend * 7));
  
  // AI Order Prediction
  const dailyOrders = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    const dayOrderCount = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.timestamp);
      return orderDate >= dayStart && orderDate < dayEnd;
    }).length;
    
    dailyOrders.push(dayOrderCount);
  }
  
  const avgOrders = dailyOrders.reduce((sum, count) => sum + count, 0) / dailyOrders.length;
  const orderTrend = dailyOrders.length > 1 
    ? (dailyOrders[dailyOrders.length - 1] - dailyOrders[0]) / dailyOrders.length
    : 0;
  
  const predictedOrders = Math.max(0, Math.round(avgOrders * 7 + orderTrend * 7));
  
  // AI Peak Hour Predictions
  const hourStats: { [key: number]: number } = {};
  last30Days.forEach(order => {
    const hour = new Date(order.createdAt || order.timestamp).getHours();
    hourStats[hour] = (hourStats[hour] || 0) + 1;
  });
  
  const totalOrders = Object.values(hourStats).reduce((sum, count) => sum + count, 0);
  const peakHourPredictions = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const orderCount = hourStats[hour] || 0;
    const probability = totalOrders > 0 ? orderCount / totalOrders : 0;
    peakHourPredictions.push({ hour, probability });
  }
  
  peakHourPredictions.sort((a, b) => b.probability - a.probability);
  
  // AI Customer Segmentation
  const customerStats: { [key: string]: { orders: number; revenue: number } } = {};
  orders.forEach(order => {
    const customerKey = order.customerName || order.customerPhone || 'Anonymous';
    if (!customerStats[customerKey]) {
      customerStats[customerKey] = { orders: 0, revenue: 0 };
    }
    customerStats[customerKey].orders += 1;
    customerStats[customerKey].revenue += order.totalAmount || 0;
  });
  
  const customers = Object.entries(customerStats).map(([name, stats]) => ({
    name,
    orders: stats.orders,
    avgSpend: stats.revenue / stats.orders
  }));
  
  // Segment customers based on spending
  const highValueCustomers = customers.filter(c => c.avgSpend > 500);
  const mediumValueCustomers = customers.filter(c => c.avgSpend >= 200 && c.avgSpend <= 500);
  const lowValueCustomers = customers.filter(c => c.avgSpend < 200);
  
  const customerSegments = [
    { segment: 'High Value', count: highValueCustomers.length, avgSpend: Math.round(highValueCustomers.reduce((sum, c) => sum + c.avgSpend, 0) / Math.max(highValueCustomers.length, 1)) },
    { segment: 'Medium Value', count: mediumValueCustomers.length, avgSpend: Math.round(mediumValueCustomers.reduce((sum, c) => sum + c.avgSpend, 0) / Math.max(mediumValueCustomers.length, 1)) },
    { segment: 'Low Value', count: lowValueCustomers.length, avgSpend: Math.round(lowValueCustomers.reduce((sum, c) => sum + c.avgSpend, 0) / Math.max(lowValueCustomers.length, 1)) }
  ];
  
  // AI Menu Recommendations (based on performance)
  const itemStats: { [key: string]: { count: number; revenue: number } } = {};
  last30Days.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const itemName = item.name || item.itemName || 'Unknown Item';
        if (!itemStats[itemName]) {
          itemStats[itemName] = { count: 0, revenue: 0 };
        }
        itemStats[itemName].count += item.quantity || 1;
        itemStats[itemName].revenue += (item.price || 0) * (item.quantity || 1);
      });
    }
  });
  
  const recommendedItems = Object.entries(itemStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name]) => name);
  
  // AI Inventory Recommendations
  const inventoryRecommendations = Object.entries(itemStats)
    .map(([name, stats]) => {
      // Simple prediction: average daily consumption * 7 days + buffer
      const avgDailyConsumption = stats.count / 30;
      const suggestedQuantity = Math.ceil(avgDailyConsumption * 7 * 1.2); // 20% buffer
      return { item: name, suggestedQuantity };
    })
    .sort((a, b) => b.suggestedQuantity - a.suggestedQuantity)
    .slice(0, 10);
  
  return {
    predictedRevenue,
    predictedOrders,
    recommendedItems,
    peakHourPredictions: peakHourPredictions.slice(0, 8), // Top 8 hours
    customerSegments,
    inventoryRecommendations
  };
}