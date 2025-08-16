import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

interface Notification {
  id: string;
  type: 'order' | 'feedback' | 'system' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionRequired: boolean;
  relatedId?: string; // Order ID, feedback ID, etc.
  createdAt: Date;
  readAt?: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    if (!db) {
      console.log('Database not available, generating notifications from orders');
      // Fallback: Generate notifications from recent orders
      try {
        const ordersResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders`);
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          const orders = ordersData.orders || ordersData || [];

          const notifications = generateNotificationsFromOrders(orders);

          return NextResponse.json({
            success: true,
            notifications
          });
        }
      } catch (fallbackError) {
        console.error('Fallback notifications generation failed:', fallbackError);
      }

      return NextResponse.json({
        success: true,
        notifications: generateMockNotifications()
      });
    }

    // Get real notifications from database
    const notificationsCollection = db.collection('notifications');
    let notifications = await notificationsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // If no notifications exist, generate from orders and feedback
    if (notifications.length === 0) {
      console.log('No notifications in database, generating from orders...');

      const ordersCollection = db.collection('orders');
      const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).limit(20).toArray();

      const generatedNotifications = generateNotificationsFromOrders(orders);

      // Save generated notifications to database
      if (generatedNotifications.length > 0) {
        const insertResult = await notificationsCollection.insertMany(generatedNotifications);
        // Fetch the inserted notifications to get proper _id fields
        notifications = await notificationsCollection
          .find({ _id: { $in: Object.values(insertResult.insertedIds) } })
          .toArray();
      }
    }

    return NextResponse.json({
      success: true,
      notifications: notifications.map(notif => ({
        ...notif,
        id: notif._id?.toString() || notif.id
      }))
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      success: true,
      notifications: generateMockNotifications()
    });
  }
}

function generateNotificationsFromOrders(orders: any[]) {
  const notifications = [];
  const now = new Date();

  // Generate notifications from recent orders
  orders.slice(0, 10).forEach((order, index) => {
    const orderDate = new Date(order.createdAt || order.timestamp);
    const timeDiff = now.getTime() - orderDate.getTime();
    const minutesAgo = Math.floor(timeDiff / (1000 * 60));

    // New order notification
    if (minutesAgo < 60) {
      notifications.push({
        id: `order-${order._id || order.orderId}-${index}`,
        type: 'order',
        title: 'New Order Received',
        message: `Order #${order.orderId?.slice(-6) || 'N/A'} from Table ${order.tableNumber} - ₹${order.totalAmount}`,
        priority: 'high',
        read: Math.random() > 0.7, // 30% chance of being read
        actionRequired: order.status === 'pending',
        relatedId: order.orderId || order._id,
        createdAt: orderDate
      });
    }

    // Order ready notification
    if (order.status === 'ready') {
      notifications.push({
        id: `ready-${order._id || order.orderId}-${index}`,
        type: 'order',
        title: 'Order Ready for Pickup',
        message: `Order #${order.orderId?.slice(-6) || 'N/A'} is ready for Table ${order.tableNumber}`,
        priority: 'high',
        read: Math.random() > 0.5,
        actionRequired: true,
        relatedId: order.orderId || order._id,
        createdAt: new Date(orderDate.getTime() + 15 * 60 * 1000) // 15 minutes after order
      });
    }

    // Feedback notification
    if (order.rating && order.rating > 0) {
      const feedbackType = order.rating >= 4 ? 'positive' : order.rating <= 2 ? 'complaint' : 'neutral';
      notifications.push({
        id: `feedback-${order._id || order.orderId}-${index}`,
        type: 'feedback',
        title: feedbackType === 'complaint' ? 'Customer Complaint' : 'New Customer Review',
        message: `${order.customerName || 'Customer'} left a ${order.rating}-star review${order.feedback ? ': "' + order.feedback.substring(0, 50) + '..."' : ''}`,
        priority: feedbackType === 'complaint' ? 'high' : 'medium',
        read: Math.random() > 0.6,
        actionRequired: feedbackType === 'complaint' || !order.feedbackResponse,
        relatedId: order.orderId || order._id,
        createdAt: new Date(orderDate.getTime() + 30 * 60 * 1000) // 30 minutes after order
      });
    }
  });

  // Add system notifications
  const systemNotifications = [
    {
      id: `system-peak-${Date.now()}`,
      type: 'alert',
      title: 'Peak Hour Alert',
      message: `${orders.length} orders in queue - consider additional staff`,
      priority: orders.length > 10 ? 'urgent' : 'medium',
      read: false,
      actionRequired: false,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000)
    },
    {
      id: `system-report-${Date.now()}`,
      type: 'system',
      title: 'Daily Report Generated',
      message: 'Today\'s sales report is ready for review',
      priority: 'low',
      read: Math.random() > 0.3,
      actionRequired: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    }
  ];

  notifications.push(...systemNotifications);

  // Sort by creation date (newest first) and limit
  return notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);
}

export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json();
    const { db } = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const notificationsCollection = db.collection('notifications');

    const notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false
    };

    const result = await notificationsCollection.insertOne(notification);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        notification: {
          ...notification,
          id: result.insertedId.toString()
        }
      });
    } else {
      throw new Error('Failed to create notification');
    }

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create notification'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { notificationId, updates } = await request.json();
    const { db } = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const notificationsCollection = db.collection('notifications');

    const result = await notificationsCollection.updateOne(
      { _id: notificationId },
      {
        $set: {
          ...updates,
          ...(updates.read && { readAt: new Date() })
        }
      }
    );

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: 'Notification updated successfully'
      });
    } else {
      throw new Error('Failed to update notification');
    }

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update notification'
    }, { status: 500 });
  }
}

function generateMockNotifications(): Notification[] {
  const now = new Date();

  return [
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #ORD001 from Table 5 - ₹450',
      priority: 'high',
      read: false,
      actionRequired: true,
      relatedId: 'ORD001',
      createdAt: new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
    },
    {
      id: '2',
      type: 'feedback',
      title: 'New Customer Review',
      message: 'Rajesh Kumar left a 5-star review for Chicken Biryani',
      priority: 'medium',
      read: false,
      actionRequired: false,
      relatedId: 'REV001',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000) // 15 minutes ago
    },
    {
      id: '3',
      type: 'system',
      title: 'Menu Item Low Stock',
      message: 'Chicken Dum Biryani is running low on ingredients',
      priority: 'medium',
      read: true,
      actionRequired: true,
      relatedId: 'chicken_dum_biryani_half',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      readAt: new Date(now.getTime() - 25 * 60 * 1000)
    },
    {
      id: '4',
      type: 'order',
      title: 'Order Ready for Pickup',
      message: 'Order #ORD002 is ready for Table 3',
      priority: 'high',
      read: true,
      actionRequired: true,
      relatedId: 'ORD002',
      createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
      readAt: new Date(now.getTime() - 40 * 60 * 1000)
    },
    {
      id: '5',
      type: 'alert',
      title: 'Peak Hour Alert',
      message: 'Dinner rush starting - 15 orders in queue',
      priority: 'urgent',
      read: false,
      actionRequired: false,
      createdAt: new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago
    },
    {
      id: '6',
      type: 'system',
      title: 'Daily Report Generated',
      message: 'Today\'s sales report is ready for review',
      priority: 'low',
      read: true,
      actionRequired: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      readAt: new Date(now.getTime() - 90 * 60 * 1000)
    },
    {
      id: '7',
      type: 'feedback',
      title: 'Customer Complaint',
      message: 'Priya Sharma reported delayed delivery for Order #ORD003',
      priority: 'high',
      read: false,
      actionRequired: true,
      relatedId: 'ORD003',
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) // 3 hours ago
    }
  ];
}