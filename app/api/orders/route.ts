import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const orderData = await request.json();
    
    // If MongoDB is available, save to database
    if (process.env.MONGODB_URI) {
      const order = new Order(orderData);
      await order.save();
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
    await dbConnect();
    
    // If no MongoDB URI is provided, return empty array
    if (!process.env.MONGODB_URI) {
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
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    items: orderData.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.price * item.quantity,
      category: item.category,
      isVeg: item.isVeg,
      specialNotes: item.specialNotes || ""
    })),
    specialInstructions: orderData.specialInstructions,
    totalAmount: orderData.totalAmount,
    estimatedTime: orderData.estimatedTime,
    priority: orderData.priority,
    quantityValidation: orderData.quantityValidation,
    kitchen: {
      orderId: orderData.orderId,
      timestamp: orderData.timestamp,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName,
      items: orderData.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
        category: item.category,
        isVeg: item.isVeg,
        specialNotes: item.specialNotes || ""
      })),
      specialInstructions: orderData.specialInstructions,
      totalAmount: orderData.totalAmount,
      estimatedTime: orderData.estimatedTime,
      priority: orderData.priority
    }
  };
}