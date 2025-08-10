import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import sseEventEmitter from '@/lib/sse-events';
import { emailService } from '@/lib/email';

// AI System Notification Function (SimStudio Webhook)
async function notifyAISystem(orderData: any) {
  try {
    const webhookUrl =
      process.env.SIMSTUDIO_WEBHOOK_URL ||
      process.env.N8N_WEBHOOK_URL ||
      process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('No webhook URL configured, skipping AI notification');
      return;
    }

    const webhookPayload = formatWebhookPayload(orderData);
    console.log('Sending AI webhook payload:', webhookPayload);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Restaurant-Source': 'Sri-Kanya-App'
    };
    
    // Optional API key support if provided
    if (process.env.ORDER_API_KEY) {
      headers['x-api-key'] = process.env.ORDER_API_KEY;
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload),
    });
    
    if (webhookResponse.ok) {
      console.log('AI processing triggered successfully via SimStudio webhook');
    } else {
      console.error('AI webhook failed with status:', webhookResponse.status);
    }
  } catch (error) {
    console.error('AI webhook error:', error);
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
    // If no MongoDB URI is provided, return empty array
    if (!process.env.MONGODB_URI) {
      return NextResponse.json([]);
    }
    
    try {
      const { db } = await connectToDatabase();
      
      if (!db) {
        console.log('Database connection not available, returning empty orders');
        return NextResponse.json([]);
      }
      
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '50');
      const status = searchParams.get('status');
      
      let query = {};
      if (status) {
        query = { status };
      }
      
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return NextResponse.json(orders);
    } catch (dbError) {
      console.error('Database error, returning empty orders:', dbError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
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