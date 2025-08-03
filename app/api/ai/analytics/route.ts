import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { AIAnalyticsEngine } from '@/lib/ai/analytics';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Fetch all orders
    const orders = await Order.find({}).sort({ timestamp: -1 });
    
    // Initialize AI analytics engine
    const aiEngine = new AIAnalyticsEngine(orders);
    const aiAnalytics = aiEngine.getAIAnalytics();
    
    return NextResponse.json({
      success: true,
      data: aiAnalytics
    });

  } catch (error) {
    console.error('Error generating AI analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI analytics' },
      { status: 500 }
    );
  }
} 