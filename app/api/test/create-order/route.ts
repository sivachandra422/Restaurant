import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import sseEventEmitter from '@/lib/sse-events';
import { Order } from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

// POST - Create test order
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }
    // Generate random order data
    const tableNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const menuItems = [
      { name: 'Chicken Biryani', price: 250, isVeg: false, category: 'biryani' },
      { name: 'Paneer Butter Masala', price: 180, isVeg: true, category: 'curries' },
      { name: 'Chicken Fried Rice', price: 160, isVeg: false, category: 'fried_rice' },
      { name: 'Veg Noodles', price: 120, isVeg: true, category: 'noodles' },
      { name: 'Chicken 65', price: 200, isVeg: false, category: 'starters' },
      { name: 'Pulka', price: 20, isVeg: true, category: 'breads' },
    ];

    const randomTable = tableNumbers[Math.floor(Math.random() * tableNumbers.length)];
    const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
    const items = Array.from({ length: numItems }).map(() => {
      const item = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2 quantity
      return {
        itemId: item.name.toLowerCase().replace(/\s/g, '_'),
        name: item.name,
        price: item.price,
        quantity: quantity,
        isVeg: item.isVeg,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const statuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'refunded'];

    const newOrderData = {
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tableNumber: randomTable,
      items: items,
      totalAmount: totalAmount,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      paymentMethod: 'Cash', // Default
      customerName: `Guest ${randomTable}`,
      customerPhone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      specialInstructions: Math.random() > 0.7 ? 'Make it spicy' : '',
      estimatedTime: Math.floor(Math.random() * 30) + 10, // 10-40 minutes
      notes: '',
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    const newOrder = new Order(newOrderData);
    const result = await db.collection('orders').insertOne(newOrder);

    const createdOrder = { ...newOrder.toObject(), _id: result.insertedId };

    // Emit SSE event for new order
    sseEventEmitter.emit('order-event', { type: 'new-order', order: createdOrder });

    return NextResponse.json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('Error creating test order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test order' },
      { status: 500 }
    );
  }
} 