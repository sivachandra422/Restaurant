import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Simulate real-time analytics update
    const mockAnalytics = {
      totalRevenue: 2600 + Math.floor(Math.random() * 100),
      totalOrders: 4 + Math.floor(Math.random() * 3),
      averageOrderValue: 650 + Math.floor(Math.random() * 50),
      popularItems: [
        { name: 'Chicken Dum Biryani (Full)', count: 2 + Math.floor(Math.random() * 2), revenue: 800 + Math.floor(Math.random() * 100) },
        { name: 'Chicken 65', count: 2 + Math.floor(Math.random() * 2), revenue: 600 + Math.floor(Math.random() * 100) },
        { name: 'Chicken Fry', count: 2 + Math.floor(Math.random() * 2), revenue: 500 + Math.floor(Math.random() * 100) },
        { name: 'Chicken 555', count: 1 + Math.floor(Math.random() * 2), revenue: 400 + Math.floor(Math.random() * 100) },
        { name: 'Chicken Curry (Boneless)', count: 1 + Math.floor(Math.random() * 2), revenue: 300 + Math.floor(Math.random() * 100) }
      ],
      orderStatusDistribution: [
        { status: 'completed', count: 2 + Math.floor(Math.random() * 2) },
        { status: 'pending', count: 1 + Math.floor(Math.random() * 2) },
        { status: 'preparing', count: 1 + Math.floor(Math.random() * 2) }
      ],
      todayOrders: 2 + Math.floor(Math.random() * 3),
      todayRevenue: 1200 + Math.floor(Math.random() * 200),
      lastUpdate: Date.now(),
      newOrdersCount: action === 'newOrder' ? 1 : 0
    };

    return NextResponse.json({
      success: true,
      message: 'Analytics updated successfully',
      analytics: mockAnalytics
    });
  } catch (error) {
    console.error('Test analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    );
  }
} 