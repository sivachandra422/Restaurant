import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';

interface Feedback {
  id: string;
  orderId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  category: 'food_quality' | 'service' | 'ambiance' | 'delivery' | 'portion_size' | 'pricing' | 'general';
  status: 'pending' | 'reviewed' | 'resolved' | 'flagged';
  priority: 'low' | 'medium' | 'high';
  sentiment: 'positive' | 'neutral' | 'negative';
  orderItems: string[];
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication middleware
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const rating = searchParams.get('rating');
    
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed' 
      }, { status: 500 });
    }

    // Get feedback from orders with ratings
    const query: any = {
      $and: [
        { rating: { $exists: true, $ne: null, $gt: 0 } },
        { $or: [
          { feedback: { $exists: true, $nin: [null, ''] } },
          { rating: { $exists: true, $ne: null } }
        ]}
      ]
    };

    // Apply filters
    if (status && status !== 'all') {
      if (status === 'pending') {
        query.$and.push({ feedbackResponse: { $exists: false } });
      } else if (status === 'resolved') {
        query.$and.push({ 
          feedbackResponse: { 
            $exists: true, 
            $ne: null, 
            $not: { $eq: '' } 
          } 
        });
      }
    }

    if (rating && rating !== 'all') {
      query.$and.push({ rating: parseInt(rating) });
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const feedback: Feedback[] = orders.map((order: any) => ({
      id: order._id.toString(),
      orderId: order.orderId,
      customerName: order.customerName || 'Anonymous Customer',
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      rating: order.rating,
      comment: order.feedback || 'No specific feedback provided',
      category: categorizeFeedback(order.feedback || ''),
      status: order.feedbackResponse ? 'resolved' : 'pending',
      priority: calculatePriority(order.rating, order.feedback || ''),
      sentiment: getSentiment(order.rating, order.feedback || ''),
      orderItems: order.items?.map((item: any) => item.name) || [],
      response: order.feedbackResponse,
      respondedBy: order.feedbackRespondedBy,
      respondedAt: order.feedbackResponseDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    // Apply category filter after processing
    const filteredFeedback = category && category !== 'all' 
      ? feedback.filter(fb => fb.category === category)
      : feedback;

    return NextResponse.json({
      success: true,
      feedback: filteredFeedback
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch feedback' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json();
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 500 });
    }

    const feedbackCollection = db.collection('customer_feedback');
    
    const feedback = {
      ...feedbackData,
      id: Date.now().toString(),
      status: 'new',
      priority: calculatePriority(feedbackData.rating, feedbackData.comment),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await feedbackCollection.insertOne(feedback);

    if (result.acknowledged) {
      return NextResponse.json({ 
        success: true, 
        feedback: {
          ...feedback,
          id: result.insertedId.toString()
        }
      });
    } else {
      throw new Error('Failed to create feedback');
    }

  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create feedback' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { feedbackId, updates } = await request.json();
    
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed' 
      }, { status: 500 });
    }

    // Update the order with feedback response
    const updateData: any = {
      updatedAt: new Date()
    };

    if (updates.response) {
      updateData.feedbackResponse = updates.response;
      updateData.feedbackResponseDate = new Date();
      updateData.feedbackRespondedBy = user.username || user.userId;
    }

    if (updates.status) {
      updateData.feedbackStatus = updates.status;
    }

    const result = await Order.findByIdAndUpdate(
      feedbackId,
      { $set: updateData },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ 
        success: false, 
        error: 'Feedback not found' 
      }, { status: 404 });
    }

    // Emit SSE event for real-time updates
    try {
      const sseResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/feedback/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback-update',
          feedbackId,
          updates
        })
      });
    } catch (sseError) {
      console.error('Failed to broadcast SSE update:', sseError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback response submitted successfully' 
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update feedback' 
    }, { status: 500 });
  }
}

function calculatePriority(rating: number, comment: string): 'low' | 'medium' | 'high' {
  // Low rating = high priority
  if (rating <= 2) return 'high';
  if (rating === 3) return 'medium';
  
  // Check for negative keywords in comment
  const negativeKeywords = ['bad', 'terrible', 'awful', 'worst', 'horrible', 'disgusting', 'complaint', 'slow', 'cold', 'disappointed'];
  const hasNegativeKeywords = negativeKeywords.some(keyword => 
    comment.toLowerCase().includes(keyword)
  );
  
  if (hasNegativeKeywords) return 'high';
  if (rating === 4) return 'medium';
  
  return 'low';
}

function getSentiment(rating: number, comment: string): 'positive' | 'neutral' | 'negative' {
  if (rating >= 4) return 'positive';
  if (rating <= 2) return 'negative';
  
  // Analyze comment for sentiment
  const positiveKeywords = ['good', 'great', 'excellent', 'amazing', 'delicious', 'perfect', 'love', 'wonderful'];
  const negativeKeywords = ['bad', 'terrible', 'awful', 'worst', 'horrible', 'disgusting', 'disappointed'];
  
  const hasPositive = positiveKeywords.some(keyword => comment.toLowerCase().includes(keyword));
  const hasNegative = negativeKeywords.some(keyword => comment.toLowerCase().includes(keyword));
  
  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  
  return 'neutral';
}

function categorizeFeedback(comment: string): 'food_quality' | 'service' | 'ambiance' | 'delivery' | 'portion_size' | 'pricing' | 'general' {
  const text = comment.toLowerCase();
  
  if (text.includes('food') || text.includes('taste') || text.includes('quality') || text.includes('delicious') || text.includes('flavor')) {
    return 'food_quality';
  }
  if (text.includes('delivery') || text.includes('time') || text.includes('speed') || text.includes('late') || text.includes('cold')) {
    return 'delivery';
  }
  if (text.includes('service') || text.includes('staff') || text.includes('friendly') || text.includes('courteous')) {
    return 'service';
  }
  if (text.includes('portion') || text.includes('size') || text.includes('quantity') || text.includes('amount')) {
    return 'portion_size';
  }
  if (text.includes('price') || text.includes('cost') || text.includes('value') || text.includes('expensive') || text.includes('cheap')) {
    return 'pricing';
  }
  if (text.includes('clean') || text.includes('hygiene') || text.includes('restaurant') || text.includes('ambiance') || text.includes('atmosphere')) {
    return 'ambiance';
  }
  
  return 'general';
}