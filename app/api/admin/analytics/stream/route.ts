import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lastUpdate = searchParams.get('lastUpdate');

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  };

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: any, type: string = 'analyticsUpdate') => {
        const event = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(event));
      };

      const checkForUpdates = async () => {
        try {
          const { db } = await connectToDatabase();
          
          if (!db) {
            sendEvent({ error: 'Database not available' }, 'error');
            return;
          }

          // Get latest orders since last update
          const query = lastUpdate ? { 
            timestamp: { $gt: new Date(parseInt(lastUpdate)) } 
          } : {};
          
          const newOrders = await db.collection('orders').find(query).toArray();
          
          if (newOrders.length > 0) {
            // Calculate real-time analytics
            const allOrders = await db.collection('orders').find({}).toArray();
            
            const analytics = {
              totalRevenue: allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
              totalOrders: allOrders.length,
              averageOrderValue: allOrders.length > 0 ? allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / allOrders.length : 0,
              popularItems: calculatePopularItems(allOrders),
              orderStatusDistribution: calculateOrderStatusDistribution(allOrders),
              todayOrders: allOrders.filter(order => {
                const orderDate = new Date(order.timestamp || order.createdAt);
                const today = new Date();
                return orderDate.toDateString() === today.toDateString();
              }).length,
              todayRevenue: allOrders.filter(order => {
                const orderDate = new Date(order.timestamp || order.createdAt);
                const today = new Date();
                return orderDate.toDateString() === today.toDateString();
              }).reduce((sum, order) => sum + (order.totalAmount || 0), 0),
              lastUpdate: Date.now(),
              newOrdersCount: newOrders.length
            };

            sendEvent(analytics);
          } else {
            // Send heartbeat to keep connection alive
            sendEvent({ heartbeat: true, timestamp: Date.now() }, 'heartbeat');
          }
        } catch (error) {
          console.error('Analytics stream error:', error);
          sendEvent({ error: 'Failed to fetch analytics' }, 'error');
        }
      };

      // Initial check
      checkForUpdates();

      // Check for updates every 10 seconds
      const interval = setInterval(checkForUpdates, 10000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
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
  })).sort((a, b) => b.count - a.count).slice(0, 10);
}

function calculateOrderStatusDistribution(orders: any[]) {
  const statusCount = new Map();
  
  orders.forEach(order => {
    const status = order.status || 'pending';
    const currentCount = statusCount.get(status) || 0;
    statusCount.set(status, currentCount + 1);
  });
  
  return Array.from(statusCount.entries()).map(([status, count]) => ({
    status,
    count
  }));
} 