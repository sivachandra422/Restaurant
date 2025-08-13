import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import sseEventEmitter from '@/lib/sse-events';
import { emailService } from '@/lib/email';

// AI System Notification Function (SimStudio Webhook)
async function notifyAISystem(orderData: any) {
  try {
    console.log('🔔 Starting AI webhook notification...');
    console.log('📋 Available environment variables:');
    console.log('- SIMSTUDIO_WEBHOOK_URL:', process.env.SIMSTUDIO_WEBHOOK_URL ? '✅ Set' : '❌ Not set');
    console.log('- N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL ? '✅ Set' : '❌ Not set');
    console.log('- WEBHOOK_URL:', process.env.WEBHOOK_URL ? '✅ Set' : '❌ Not set');
    
    const webhookUrl =
      process.env.SIMSTUDIO_WEBHOOK_URL ||
      process.env.N8N_WEBHOOK_URL ||
      process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('❌ No webhook URL configured, skipping AI notification');
      return;
    }

    console.log('🌐 Using webhook URL:', webhookUrl);
    
    const webhookPayload = formatWebhookPayload(orderData);
    console.log('📦 Webhook payload:', JSON.stringify(webhookPayload, null, 2));
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Restaurant-Source': 'Sri-Kanya-App'
    };
    
    // Optional API key support if provided
    if (process.env.ORDER_API_KEY) {
      headers['x-api-key'] = process.env.ORDER_API_KEY;
      console.log('🔑 API key included in headers');
    }

    console.log('📤 Sending webhook request...');
    console.log('📋 Headers:', headers);
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload),
    });
    
    console.log('📥 Webhook response status:', webhookResponse.status);
    console.log('📥 Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));
    
    if (webhookResponse.ok) {
      const responseText = await webhookResponse.text();
      console.log('✅ AI processing triggered successfully via SimStudio webhook');
      console.log('📄 Response body:', responseText);
    } else {
      const errorText = await webhookResponse.text();
      console.error('❌ AI webhook failed with status:', webhookResponse.status);
      console.error('📄 Error response body:', errorText);
    }
  } catch (error: any) {
    console.error('💥 AI webhook error:', error);
    console.error('🔍 Error details:', {
      name: error?.name || 'Unknown',
      message: error?.message || 'No message',
      stack: error?.stack || 'No stack trace'
    });
    // Don't fail the order if webhook fails
  }
}

// Simple in-memory rate limiting (consider Redis for production)
const orderAttempts = new Map<string, { count: number; firstAttemptAt: number }>();
const MAX_ORDERS_PER_MINUTE = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Rate limiting function
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const attempts = orderAttempts.get(clientId);
  
  if (!attempts) {
    orderAttempts.set(clientId, { count: 1, firstAttemptAt: now });
    return { allowed: true, remaining: MAX_ORDERS_PER_MINUTE - 1 };
  }
  
  // Reset if window has passed
  if (now - attempts.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    orderAttempts.set(clientId, { count: 1, firstAttemptAt: now });
    return { allowed: true, remaining: MAX_ORDERS_PER_MINUTE - 1 };
  }
  
  // Check if limit exceeded
  if (attempts.count >= MAX_ORDERS_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }
  
  // Increment count
  attempts.count++;
  return { allowed: true, remaining: MAX_ORDERS_PER_MINUTE - attempts.count };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  Array.from(orderAttempts.entries()).forEach(([clientId, attempts]) => {
    if (now - attempts.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
      orderAttempts.delete(clientId);
    }
  });
}, RATE_LIMIT_WINDOW_MS);

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientId = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(clientId);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many orders. Please wait before placing another order.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_WINDOW_MS).toISOString()
          }
        }
      );
    }

    const orderData = await request.json();
    
    // Input validation
    if (!orderData || typeof orderData !== 'object') {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }
    
    // Validate required fields
    if (!orderData.tableNumber || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: tableNumber and items are required' }, { status: 400 });
    }
    
    // Validate items structure
    for (const item of orderData.items) {
      if (!item.name || typeof item.price !== 'number' || item.price < 0 || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ error: 'Invalid item data: name, price, and quantity are required' }, { status: 400 });
      }
    }
    
    // Validate table number format
    if (typeof orderData.tableNumber !== 'string' || orderData.tableNumber.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid table number' }, { status: 400 });
    }
    
    // Sanitize and validate customer data
    if (orderData.customerName && typeof orderData.customerName !== 'string') {
      orderData.customerName = orderData.customerName.toString().trim();
    }
    if (orderData.customerPhone && typeof orderData.customerPhone !== 'string') {
      orderData.customerPhone = orderData.customerPhone.toString().trim();
    }
    
    // Validate special instructions length
    if (orderData.specialInstructions && typeof orderData.specialInstructions === 'string' && orderData.specialInstructions.length > 500) {
      return NextResponse.json({ error: 'Special instructions too long (max 500 characters)' }, { status: 400 });
    }

    console.log('Received order data:', orderData);
    
    let savedOrder = null;
    
    // If MongoDB is available, save to database
    if (process.env.MONGODB_URI) {
      try {
        const { db } = await connectToDatabase();
        if (db) {
          console.log('Database connected successfully');

          // Ensure each item has a correct subtotal
          if (Array.isArray(orderData.items)) {
            orderData.items = orderData.items.map((item: any) => ({
              ...item,
              subtotal: (item.price || 0) * (item.quantity || 0)
            }));
          }

          const order = new Order(orderData);
          console.log('Order model created:', order);
          
          savedOrder = await order.save();
          console.log('Order saved to MongoDB successfully:', savedOrder._id);
          
          // Emit SSE event for real-time updates
          sseEventEmitter.emit('order-event', {
            type: 'new-order',
            order: savedOrder.toObject()
          });
          
          // Send email notifications
          await sendOrderNotifications(orderData);
          
          return NextResponse.json({ 
            success: true, 
            orderId: orderData.orderId,
            order: savedOrder,
            message: 'Order placed successfully and saved to database' 
          });
        } else {
          console.log('Database connection not available, continuing without save');
        }
      } catch (dbError: any) {
        console.error('Failed to save order to MongoDB:', dbError);
        console.error('Order data that failed to save:', orderData);
        
        // Continue without database - don't fail the order
        console.log('Continuing without database save due to error');
      }
    } else {
      console.log('No MongoDB URI provided, skipping database save');
    }
    
    // Send webhook notification (SimStudio preferred, with fallbacks)
    await notifyAISystem(orderData);
    
    return NextResponse.json({ 
      success: true, 
      orderId: orderData.orderId,
      order: savedOrder,
      message: 'Order placed successfully' 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// GET - Fetch all orders (for admin)
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Check if database is available
    if (!db) {
      console.log('Database not available, returning mock orders');
      return NextResponse.json({
        success: true,
        orders: generateMockOrders()
      });
    }
    
    // Get all orders
    const orders = await db.collection('orders').find({}).toArray();
    
    // If no orders in database, return mock data for testing
    if (orders.length === 0) {
      console.log('No orders found in database, returning mock orders for testing');
      return NextResponse.json({
        success: true,
        orders: generateMockOrders()
      });
    }
    
    return NextResponse.json({
      success: true,
      orders: orders
    });
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    // Return mock data on error
    return NextResponse.json({
      success: true,
      orders: generateMockOrders()
    });
  }
}

// Generate mock orders for testing
function generateMockOrders() {
  return [
    {
      _id: 'mock_order_1',
      orderId: 'ORD001',
      tableNumber: 'Table 1',
      items: [
        {
          itemId: 'item_1',
          name: 'Chicken Biryani',
          price: 250,
          quantity: 2,
          isVeg: false,
          category: 'Biryani',
          subtotal: 500,
          specialInstructions: 'Extra spicy'
        },
        {
          itemId: 'item_2',
          name: 'Paneer Butter Masala',
          price: 180,
          quantity: 1,
          isVeg: true,
          category: 'Main Course',
          subtotal: 180,
          specialInstructions: 'Less spicy'
        }
      ],
      totalAmount: 680,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      customerName: 'Rahul Kumar',
      customerPhone: '+91-9876543210',
      specialInstructions: 'Please deliver to table quickly',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      estimatedTime: 25,
      notes: 'Customer requested quick service'
    },
    {
      _id: 'mock_order_2',
      orderId: 'ORD002',
      tableNumber: 'Table 3',
      items: [
        {
          itemId: 'item_3',
          name: 'Veg Fried Rice',
          price: 120,
          quantity: 1,
          isVeg: true,
          category: 'Rice & Noodles',
          subtotal: 120,
          specialInstructions: 'No onions'
        },
        {
          itemId: 'item_4',
          name: 'Chicken Curry',
          price: 200,
          quantity: 1,
          isVeg: false,
          category: 'Main Course',
          subtotal: 200,
          specialInstructions: 'Medium spicy'
        }
      ],
      totalAmount: 320,
      status: 'preparing',
      paymentStatus: 'paid',
      paymentMethod: 'phonepe',
      customerName: 'Priya Sharma',
      customerPhone: '+91-8765432109',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      estimatedTime: 20,
      notes: 'Customer is waiting patiently'
    },
    {
      _id: 'mock_order_3',
      orderId: 'ORD003',
      tableNumber: 'Table 5',
      items: [
        {
          itemId: 'item_5',
          name: 'Mutton Biryani',
          price: 280,
          quantity: 1,
          isVeg: false,
          category: 'Biryani',
          subtotal: 280,
          specialInstructions: 'Extra meat'
        }
      ],
      totalAmount: 280,
      status: 'ready',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      customerName: 'Amit Patel',
      customerPhone: '+91-7654321098',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      estimatedTime: 30,
      notes: 'Ready for pickup'
    },
    {
      _id: 'mock_order_4',
      orderId: 'ORD004',
      tableNumber: 'Table 2',
      items: [
        {
          itemId: 'item_6',
          name: 'Dal Makhani',
          price: 150,
          quantity: 1,
          isVeg: true,
          category: 'Main Course',
          subtotal: 150,
          specialInstructions: 'Extra butter'
        },
        {
          itemId: 'item_7',
          name: 'Roti',
          price: 20,
          quantity: 4,
          isVeg: true,
          category: 'Breads',
          subtotal: 80,
          specialInstructions: 'Hot and fresh'
        }
      ],
      totalAmount: 230,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      customerName: 'Neha Singh',
      customerPhone: '+91-6543210987',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      rating: 5,
      feedback: 'Excellent food and service! Will definitely come back.'
    }
  ];
}

// Helper function to send email notifications
async function sendOrderNotifications(orderData: any) {
  try {
    // Get notification settings from environment or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@srikanya.com';
    const kitchenEmail = process.env.KITCHEN_EMAIL || 'kitchen@srikanya.com';
    
    // Prepare email data
    const emailData = {
      orderId: orderData.orderId,
      customerName: orderData.customerName || 'Guest',
      customerPhone: orderData.customerPhone || '',
      tableNumber: orderData.tableNumber || '',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      specialInstructions: orderData.specialInstructions || '',
      estimatedTime: orderData.estimatedTime || '20-25 minutes',
      timestamp: new Date(orderData.timestamp || Date.now())
    };

    // Send order confirmation to customer (if email provided)
    if (orderData.customerEmail) {
      await emailService.sendOrderConfirmation(emailData, orderData.customerEmail);
    }

    // Send kitchen notification
    await emailService.sendKitchenNotification(emailData, kitchenEmail);

    // Send admin notification
    await emailService.sendSystemNotification({
      type: 'new-order',
      title: 'New Order Received',
      message: `New order #${orderData.orderId} received from ${emailData.customerName} at table ${emailData.tableNumber}`,
      data: emailData
    }, adminEmail);

    console.log('Email notifications sent successfully');
  } catch (error) {
    console.error('Failed to send email notifications:', error);
    // Don't fail the order if email notifications fail
  }
}

// Helper function to format webhook payload for AI processing
function formatWebhookPayload(orderData: any) {
  return {
    success: true,
    orderId: orderData.orderId,
    order: {
      orderId: orderData.orderId,
      sessionId: orderData.sessionId,
      timestamp: orderData.timestamp,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      items: orderData.items?.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.subtotal || (item.price * item.quantity),
        category: item.category,
        isVeg: item.isVeg,
        isSignature: item.isSignature || false
      })),
      totalAmount: orderData.totalAmount,
      estimatedTime: orderData.estimatedTime || '20-25 minutes',
      priority: orderData.priority || 'NORMAL',
      specialInstructions: orderData.specialInstructions
    },
    message: "Order placed successfully and saved to database"
  };
}