import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { AIAnalyticsEngine } from '@/lib/ai/analytics';

export async function GET(request: NextRequest) {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Skipping AI analytics during build time');
      return NextResponse.json({
        success: true,
        data: {
          predictedRevenue: 0,
          predictedOrders: 0,
          recommendedItems: [],
          peakHourPredictions: [],
          customerSegments: [],
          seasonalTrends: [],
          inventoryRecommendations: []
        }
      });
    }

    const { db } = await connectToDatabase();
    
    if (!db) {
      console.log('Database not available for AI analytics');
      return NextResponse.json({
        success: true,
        data: {
          predictedRevenue: 0,
          predictedOrders: 0,
          recommendedItems: [],
          peakHourPredictions: [],
          customerSegments: [],
          seasonalTrends: [],
          inventoryRecommendations: []
        }
      });
    }
    
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