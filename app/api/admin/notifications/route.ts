import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const { db } = await connectToDatabase();
    
    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    let notifications: any[] = [];
    
    switch (type) {
      case 'orders':
        notifications = await getOrderNotifications(db, limit);
        break;
      case 'system':
        notifications = await getSystemNotifications(db, limit);
        break;
      case 'alerts':
        notifications = await getAlertNotifications(db, limit);
        break;
      default:
        notifications = await getAllNotifications(db, limit);
    }
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Notifications API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, priority = 'medium', data = {} } = body;
    
    const { db } = await connectToDatabase();
    
    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    const notification = {
      type,
      title,
      message,
      priority,
      data,
      timestamp: new Date(),
      read: false,
      id: generateNotificationId()
    };
    
    await db.collection('notifications').insertOne(notification);
    
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Create Notification Error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;
    
    const { db } = await connectToDatabase();
    
    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    await db.collection('notifications').updateOne(
      { id },
      { $set: { read } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Notification Error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

async function getOrderNotifications(db: any, limit: number) {
  const orders = await db.collection('orders')
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  
  return orders.map((order: any) => ({
    id: `order-${order._id}`,
    type: 'order',
    title: `New Order #${order.orderId?.slice(-6) || 'N/A'}`,
    message: `Order received from Table ${order.tableNumber} for ₹${order.totalAmount || 0}`,
    priority: 'high',
    timestamp: order.timestamp || order.createdAt,
    read: false,
    data: {
      orderId: order.orderId,
      tableNumber: order.tableNumber,
      totalAmount: order.totalAmount,
      itemCount: order.items?.length || 0
    }
  }));
}

async function getSystemNotifications(db: any, limit: number) {
  // Get system notifications from database
  const systemNotifications = await db.collection('notifications')
    .find({ type: 'system' })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  
  // Add some default system notifications
  const defaultNotifications = [
    {
      id: 'system-1',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance completed successfully',
      priority: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true
    },
    {
      id: 'system-2',
      type: 'system',
      title: 'Database Backup',
      message: 'Daily database backup completed',
      priority: 'low',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true
    }
  ];
  
  return [...systemNotifications, ...defaultNotifications];
}

async function getAlertNotifications(db: any, limit: number) {
  const orders = await db.collection('orders').find({}).toArray();
  
  const alerts: any[] = [];
  
  // Check for high-value orders
  const highValueOrders = orders.filter((order: any) => (order.totalAmount || 0) > 1000);
  highValueOrders.forEach((order: any) => {
    alerts.push({
      id: `alert-high-value-${order._id}`,
      type: 'alert',
      title: 'High Value Order',
      message: `Large order received: ₹${order.totalAmount} from Table ${order.tableNumber}`,
      priority: 'high',
      timestamp: order.timestamp || order.createdAt,
      read: false,
      data: { orderId: order.orderId, amount: order.totalAmount }
    });
  });
  
  // Check for repeat customers
  const customerOrders = new Map();
  orders.forEach((order: any) => {
    const table = order.tableNumber;
    customerOrders.set(table, (customerOrders.get(table) || 0) + 1);
  });
  
  const repeatCustomers = Array.from(customerOrders.entries())
    .filter(([_, count]) => count > 1)
    .slice(0, 5);
  
  repeatCustomers.forEach(([table, count]) => {
    alerts.push({
      id: `alert-repeat-${table}`,
      type: 'alert',
      title: 'Repeat Customer',
      message: `Table ${table} has placed ${count} orders`,
      priority: 'medium',
      timestamp: new Date(),
      read: false,
      data: { tableNumber: table, orderCount: count }
    });
  });
  
  // Check for peak hours
  const hourlyOrders = new Map();
  orders.forEach((order: any) => {
    const hour = new Date(order.timestamp || order.createdAt).getHours();
    hourlyOrders.set(hour, (hourlyOrders.get(hour) || 0) + 1);
  });
  
  const peakHours = Array.from(hourlyOrders.entries())
    .filter(([_, count]) => count > 5)
    .slice(0, 3);
  
  peakHours.forEach(([hour, count]) => {
    alerts.push({
      id: `alert-peak-${hour}`,
      type: 'alert',
      title: 'Peak Hour Alert',
      message: `${count} orders received during ${hour}:00 hour`,
      priority: 'medium',
      timestamp: new Date(),
      read: false,
      data: { hour, orderCount: count }
    });
  });
  
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
}

async function getAllNotifications(db: any, limit: number) {
  const orderNotifications = await getOrderNotifications(db, Math.floor(limit / 3));
  const systemNotifications = await getSystemNotifications(db, Math.floor(limit / 3));
  const alertNotifications = await getAlertNotifications(db, Math.floor(limit / 3));
  
  return [...orderNotifications, ...systemNotifications, ...alertNotifications]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

function generateNotificationId() {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
} 