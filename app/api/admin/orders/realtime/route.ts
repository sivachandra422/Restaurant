import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { webSocketManager, OrderUpdate, NotificationData } from '@/lib/websocket';

export const dynamic = 'force-dynamic';

// GET - Get real-time order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    if (orderId) {
      const order = await db.collection('orders').findOne({ orderId });
      return NextResponse.json({ order });
    }

    // Get all active orders
    const activeOrders = await db.collection('orders')
      .find({ 
        status: { $in: ['pending', 'preparing', 'ready'] } 
      })
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json({ orders: activeOrders });
  } catch (error) {
    console.error('Real-time orders API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Update order status in real-time
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, estimatedTime, notes } = body;
    
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    // Update order in database
    const result = await db.collection('orders').findOneAndUpdate(
      { orderId },
      { 
        $set: { 
          status, 
          estimatedTime,
          notes,
          lastUpdated: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = result;

    // Create order update for WebSocket broadcast
    const orderUpdate: OrderUpdate = {
      orderId: order.orderId,
      status: order.status,
      tableNumber: order.tableNumber,
      timestamp: new Date(),
      estimatedTime: order.estimatedTime
    };

    // Broadcast order update via WebSocket
    webSocketManager.broadcastOrderUpdate(orderUpdate);

    // Send notification based on status
    const notification: NotificationData = {
      type: 'status_change',
      title: `Order #${orderId.slice(-6)} Status Updated`,
      message: `Order status changed to ${status}`,
      priority: status === 'ready' ? 'high' : 'medium',
      data: { orderId, status, tableNumber: order.tableNumber },
      timestamp: new Date()
    };

    webSocketManager.broadcastNotification(notification);

    return NextResponse.json({ 
      success: true, 
      order,
      message: `Order status updated to ${status}` 
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

// PUT - Bulk update multiple orders
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of { orderId, status, estimatedTime }
    
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const results = [];
    const orderUpdates: OrderUpdate[] = [];

    for (const update of updates) {
      const result = await db.collection('orders').findOneAndUpdate(
        { orderId: update.orderId },
        { 
          $set: { 
            status: update.status, 
            estimatedTime: update.estimatedTime,
            lastUpdated: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (result) {
        results.push(result);
        
        const orderUpdate: OrderUpdate = {
          orderId: result.orderId,
          status: result.status,
          tableNumber: result.tableNumber,
          timestamp: new Date(),
          estimatedTime: result.estimatedTime
        };
        
        orderUpdates.push(orderUpdate);
      }
    }

    // Broadcast all updates
    orderUpdates.forEach(update => {
      webSocketManager.broadcastOrderUpdate(update);
    });

    return NextResponse.json({ 
      success: true, 
      updatedOrders: results.length,
      message: `Updated ${results.length} orders` 
    });
  } catch (error) {
    console.error('Bulk update orders error:', error);
    return NextResponse.json(
      { error: 'Failed to update orders' },
      { status: 500 }
    );
  }
} 