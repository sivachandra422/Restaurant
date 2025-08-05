import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { webSocketManager, NotificationData } from '@/lib/websocket';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableNumber = 1, items = [] } = body;
    
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    // Create a test order
    const testOrder = {
      orderId: `TEST-${Date.now()}`,
      tableNumber,
      items: items.length > 0 ? items : [
        {
          id: 'chicken_biryani',
          name: 'Chicken Dum Biryani (Full)',
          quantity: 1,
          price: 400,
          subtotal: 400
        },
        {
          id: 'chicken_65',
          name: 'Chicken 65',
          quantity: 1,
          price: 300,
          subtotal: 300
        }
      ],
      totalAmount: items.length > 0 
        ? items.reduce((sum: number, item: any) => sum + item.subtotal, 0)
        : 700,
      status: 'pending',
      timestamp: new Date(),
      estimatedTime: 25,
      notes: 'Test order for real-time testing'
    };

    // Insert order into database
    const result = await db.collection('orders').insertOne(testOrder);

    // Send notification via WebSocket
    const notification: NotificationData = {
      type: 'new_order',
      title: `New Order #${testOrder.orderId.slice(-6)}`,
      message: `New order received from Table ${tableNumber} for ₹${testOrder.totalAmount}`,
      priority: 'high',
      data: {
        orderId: testOrder.orderId,
        tableNumber: testOrder.tableNumber,
        totalAmount: testOrder.totalAmount,
        itemCount: testOrder.items.length
      },
      timestamp: new Date()
    };

    webSocketManager.broadcastNotification(notification);

    return NextResponse.json({ 
      success: true, 
      order: testOrder,
      message: 'Test order created successfully' 
    });
  } catch (error) {
    console.error('Create test order error:', error);
    return NextResponse.json(
      { error: 'Failed to create test order' },
      { status: 500 }
    );
  }
} 