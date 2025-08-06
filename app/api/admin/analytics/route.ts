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
          todayRevenue: 0
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
          todayRevenue: 0
        }
      });
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

// Helper functions (these should be defined or imported)
function calculateRevenueByPeriod(orders: any[], period: string) {
  // Implementation here
  return [];
}

function calculatePopularItems(orders: any[]) {
  // Implementation here
  return [];
}

function calculatePeakHours(orders: any[]) {
  // Implementation here
  return [];
}

function calculateCustomerSatisfaction(orders: any[]) {
  // Implementation here
  return 0;
}

function calculateRepeatCustomers(orders: any[]) {
  // Implementation here
  return 0;
}

function calculateCategoryPerformance(orders: any[]) {
  // Implementation here
  return [];
} 