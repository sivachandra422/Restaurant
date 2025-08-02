import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // If MongoDB is available, save to database
    if (process.env.MONGODB_URI) {
      try {
        await dbConnect();
        const order = new Order(orderData);
        await order.save();
        console.log('Order saved to MongoDB:', orderData.orderId);
      } catch (dbError) {
        console.error('Failed to save order to MongoDB:', dbError);
        // Continue without database, order will still be processed
      }
    }
    
    // Send webhook notification (existing functionality)
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookPayload = formatWebhookPayload(orderData);
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the order if webhook fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      orderId: orderData.orderId,
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
      await dbConnect();
      
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

function formatWebhookPayload(orderData: any) {
  return {
    restaurantName: "Sri Kanya Restaurant",
    orderId: orderData.orderId,
    timestamp: orderData.timestamp,
    tableNumber: orderData.tableNumber,
    customerName: orderData.customer?.name || "",
    customerPhone: orderData.customer?.phone || "",
    items: orderData.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.unitPrice || item.price, // Use unitPrice if available, fallback to price
      subtotal: item.subtotal, // Use the calculated subtotal from cart
      category: item.category,
      isVeg: item.isVeg,
      specialNotes: item.specialNotes || ""
    })),
    specialInstructions: orderData.specialInstructions,
    totalAmount: orderData.orderSummary?.grandTotal || orderData.totalAmount,
    estimatedTime: orderData.estimatedTime,
    priority: orderData.priority,
    quantityValidation: orderData.quantityValidation,
    kitchen: {
      orderId: orderData.orderId,
      timestamp: orderData.timestamp,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customer?.name || "",
      items: orderData.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.unitPrice || item.price, // Use unitPrice if available, fallback to price
        subtotal: item.subtotal, // Use the calculated subtotal from cart
        category: item.category,
        isVeg: item.isVeg,
        specialNotes: item.specialNotes || ""
      })),
      specialInstructions: orderData.specialInstructions,
      totalAmount: orderData.orderSummary?.grandTotal || orderData.totalAmount,
      estimatedTime: orderData.estimatedTime,
      priority: orderData.priority
    }
  };
}