import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { ObjectId } from 'mongodb';
import sseEventEmitter from '@/lib/sse-events';

export const dynamic = 'force-dynamic';

// GET - Fetch all orders
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ 
      success: true, 
      orders,
      count: orders.length 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const newOrder = new Order(body);
    const result = await db.collection('orders').insertOne(newOrder);
    
    const createdOrder = { ...newOrder.toObject(), _id: result.insertedId };
    
    // Emit SSE event for new order
    sseEventEmitter.emit('order-event', { type: 'new-order', order: createdOrder });

    return NextResponse.json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PUT - Update order status or payment status
export async function PUT(request: NextRequest) {
  try {
    const { orderId, status, paymentStatus } = await request.json();
    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const updateData: any = { lastUpdated: new Date() };
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Emit SSE event for order update
    sseEventEmitter.emit('order-event', { type: 'order-updated', order: result.value });

    return NextResponse.json({ success: true, order: result.value });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 