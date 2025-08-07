import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import sseEventEmitter from '@/lib/sse-events';
import mongoose from 'mongoose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// Helper function to verify admin authentication
async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('verifyAdminAuth - token found:', !!token);
    console.log('verifyAdminAuth - token length:', token?.length || 0);

    if (!token) {
      console.log('verifyAdminAuth - No token provided');
      return { isAuthenticated: false, error: 'No token provided' };
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      console.log('verifyAdminAuth - JWT verified successfully');
      return { isAuthenticated: true, user: payload };
    } catch (jwtError) {
      console.error('verifyAdminAuth - JWT verification failed:', jwtError);
      // For development, allow requests without valid JWT
      if (process.env.NODE_ENV === 'development') {
        console.log('verifyAdminAuth - Development mode: allowing request without valid JWT');
        return { isAuthenticated: true, user: { username: 'dev-user' } };
      }
      return { isAuthenticated: false, error: 'Invalid token' };
    }
  } catch (error) {
    console.error('verifyAdminAuth - General error:', error);
    return { isAuthenticated: false, error: 'Authentication error' };
  }
}

// Helper function to find order by ID (handles both ObjectId and string orderId)
async function findOrderById(id: string) {
  try {
    console.log('findOrderById called with ID:', id);
    
    // First try to find by ObjectId (MongoDB _id)
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('ID is valid ObjectId, searching by _id');
      const order = await Order.findById(id);
      if (order) {
        console.log('Order found by ObjectId:', order.orderId);
        return order;
      }
    }
    
    // If not found by ObjectId, try to find by orderId (string)
    console.log('Searching by orderId (string)');
    const order = await Order.findOne({ orderId: id });
    if (order) {
      console.log('Order found by orderId:', order.orderId);
      return order;
    }
    
    console.log('Order not found by either method');
    return null;
  } catch (error) {
    console.error('Error finding order:', error);
    return null;
  }
}

// GET - Get specific order details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const order = await findOrderById(params.id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('PUT /api/orders/[id] - params:', params);
    console.log('PUT /api/orders/[id] - request headers:', Object.fromEntries(request.headers.entries()));
    
    const authResult = await verifyAdminAuth(request);
    console.log('Auth result:', authResult);
    
    if (!authResult.isAuthenticated) {
      console.log('Authentication failed:', authResult.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.MONGODB_URI) {
      console.log('MongoDB URI not configured');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { status, paymentStatus, estimatedTime, specialInstructions } = body;

    const { db } = await connectToDatabase();
    if (!db) {
      console.log('Database connection failed');
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    console.log('Looking for order with ID:', params.id);
    const order = await findOrderById(params.id);
    
    if (!order) {
      console.log('Order not found for ID:', params.id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('Found order:', order.orderId, 'Current status:', order.status);

    // Update order fields
    if (status) {
      console.log('Updating status from', order.status, 'to', status);
      order.status = status;
    }
    if (paymentStatus) {
      console.log('Updating payment status from', order.paymentStatus, 'to', paymentStatus);
      order.paymentStatus = paymentStatus;
    }
    if (estimatedTime) order.estimatedTime = estimatedTime;
    if (specialInstructions !== undefined) order.specialInstructions = specialInstructions;
    
    // Ensure all required fields are present for items
    if (order.items && Array.isArray(order.items)) {
      order.items = order.items.map((item: any) => ({
        itemId: item.itemId || item.name?.toLowerCase().replace(/\s/g, '_') || 'unknown',
        name: item.name || 'Unknown Item',
        price: item.price || 0,
        quantity: item.quantity || 1,
        isVeg: item.isVeg !== undefined ? item.isVeg : false,
        category: item.category || 'unknown',
        subtotal: item.subtotal || (item.price * item.quantity) || 0,
        specialInstructions: item.specialInstructions || ''
      }));
    }
    
    // Ensure payment method is valid
    if (order.paymentMethod && !['cash', 'card', 'phonepe', 'gpay', 'upi'].includes(order.paymentMethod)) {
      console.log('Invalid payment method:', order.paymentMethod, '- setting to cash');
      order.paymentMethod = 'cash';
    }
    
    // Ensure payment status is valid
    if (order.paymentStatus && !['pending', 'paid', 'failed', 'refunded'].includes(order.paymentStatus)) {
      console.log('Invalid payment status:', order.paymentStatus, '- setting to pending');
      order.paymentStatus = 'pending';
    }
    
    // Ensure status is valid
    if (order.status && !['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].includes(order.status)) {
      console.log('Invalid status:', order.status, '- setting to pending');
      order.status = 'pending';
    }
    
    // Don't manually set updatedAt - let Mongoose handle it with timestamps: true
    console.log('Saving order...');
    console.log('Order before save:', JSON.stringify(order.toObject(), null, 2));
    
    try {
      await order.save();
      console.log('Order saved successfully');
    } catch (saveError) {
      console.error('Error saving order:', saveError);
      console.error('Save error details:', {
        message: saveError instanceof Error ? saveError.message : 'Unknown error',
        name: saveError instanceof Error ? saveError.name : 'Unknown',
        code: (saveError as any)?.code || 'Unknown',
        errors: (saveError as any)?.errors || 'Unknown'
      });
      throw saveError;
    }

    // Emit SSE event for real-time updates
    sseEventEmitter.emit('order-event', {
      type: 'order-updated',
      order: order.toObject()
    });

    console.log('SSE event emitted');
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE - Delete order (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const order = await findOrderById(params.id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await Order.findByIdAndDelete(order._id);
    
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
} 