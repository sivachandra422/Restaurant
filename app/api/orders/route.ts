import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import sseEventEmitter from '@/lib/sse-events';
import { emailService } from '@/lib/email';

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
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
    const webhookUrl =
      process.env.SIMSTUDIO_WEBHOOK_URL ||
      process.env.N8N_WEBHOOK_URL ||
      process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookPayload = formatWebhookPayload(orderData);
        console.log('Sending webhook payload:', webhookPayload);
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
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
          console.log('Webhook sent successfully');
        } else {
          console.error('Webhook failed with status:', webhookResponse.status);
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the order if webhook fails
      }
    }
    
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

// Helper function to format webhook payload (existing)
function formatWebhookPayload(orderData: any) {
  return {
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
  };
}