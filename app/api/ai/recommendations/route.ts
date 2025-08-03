import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { AIRecommendationEngine } from '@/lib/ai/recommendations';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerPhone = searchParams.get('customerPhone');
    const itemId = searchParams.get('itemId');
    const type = searchParams.get('type') || 'personalized';
    await dbConnect();
    const orders = await Order.find({}).sort({ timestamp: -1 });
    const aiEngine = new AIRecommendationEngine(orders, sriKanyaMenu);
    let recommendations;
    if (type === 'complementary' && itemId) {
      recommendations = aiEngine.getComplementaryItems(itemId, 5);
    } else if (customerPhone) {
      recommendations = aiEngine.getPersonalizedRecommendations(customerPhone, 5);
    } else {
      recommendations = aiEngine.getPopularRecommendations(5);
    }
    return NextResponse.json({ success: true, data: recommendations });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate AI recommendations' }, { status: 500 });
  }
} 