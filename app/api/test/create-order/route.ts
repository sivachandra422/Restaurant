import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Create a realistic test order
    const testOrder = {
      orderId: `ORD${Date.now()}`,
      tableNumber: `Table ${Math.floor(Math.random() * 10) + 1}`,
      items: [
        {
          itemId: 'item_1',
          name: 'Chicken Biryani',
          price: 250,
          quantity: Math.floor(Math.random() * 3) + 1,
          isVeg: false,
          category: 'Biryani',
          subtotal: 250 * (Math.floor(Math.random() * 3) + 1)
        },
        {
          itemId: 'item_2',
          name: 'Paneer Butter Masala',
          price: 180,
          quantity: 1,
          isVeg: true,
          category: 'Main Course',
          subtotal: 180
        }
      ],
      totalAmount: 0, // Will be calculated
      status: ['pending', 'preparing', 'ready', 'delivered'][Math.floor(Math.random() * 4)],
      paymentStatus: ['pending', 'paid'][Math.floor(Math.random() * 2)],
      paymentMethod: ['cash', 'card', 'phonepe', 'googlepay'][Math.floor(Math.random() * 4)],
      customerName: ['Rahul Kumar', 'Priya Sharma', 'Amit Patel', 'Sita Devi', 'Ravi Singh'][Math.floor(Math.random() * 5)],
      customerPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      specialInstructions: ['Extra spicy', 'Less oil', 'No onions', 'Medium spicy', ''][Math.floor(Math.random() * 5)],
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedTime: Math.floor(Math.random() * 30) + 15,
      rating: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : null,
      feedback: Math.random() > 0.5 ? ['Great food!', 'Excellent service', 'Could be better', 'Amazing taste', 'Quick delivery'][Math.floor(Math.random() * 5)] : null
    };

    // Calculate total amount
    testOrder.totalAmount = testOrder.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Insert into database
    const result = await db.collection('orders').insertOne(testOrder);

    return NextResponse.json({
      success: true,
      message: 'Test order created successfully',
      orderId: testOrder.orderId,
      insertedId: result.insertedId
    });

  } catch (error) {
    console.error('Error creating test order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test order'
    }, { status: 500 });
  }
}