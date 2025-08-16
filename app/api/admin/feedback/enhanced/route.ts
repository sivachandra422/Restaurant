import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { broadcastFeedbackUpdate } from '../stream/route';

interface Feedback {
  id: string;
  orderId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  category: 'food' | 'service' | 'ambiance' | 'delivery' | 'general';
  status: 'new' | 'reviewed' | 'resolved' | 'archived';
  priority: 'low' | 'medium' | 'high';
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const rating = searchParams.get('rating');
    
    const { db } = await connectToDatabase();
    
    if (!db) {
      console.log('Database not available, fetching from orders with ratings');
      // Fallback: Get feedback from orders with ratings
      try {
        const ordersResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders`);
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          const orders = ordersData.orders || ordersData || [];
          
          const feedbackFromOrders = orders
            .filter((order: any) => order.rating && order.rating > 0)
            .map((order: any) => ({
              id: order._id || order.orderId || `feedback-${Date.now()}-${Math.random()}`,
              customerName: order.customerName || 'Anonymous Customer',
              customerEmail: order.customerEmail,
              rating: order.rating,
              comment: order.feedback || 'No specific feedback provided',
              category: 'general',
              status: order.feedbackResponse ? 'resolved' : 'new',
              priority: order.rating <= 2 ? 'high' : order.rating === 3 ? 'medium' : 'low',
              orderId: order.orderId || order._id,
              response: order.feedbackResponse,
              respondedBy: order.feedbackRespondedBy,
              respondedAt: order.feedbackResponseDate,
              createdAt: order.createdAt || order.timestamp || new Date(),
              updatedAt: order.updatedAt || order.createdAt || order.timestamp || new Date()
            }));
          
          return NextResponse.json({
            success: true,
            feedback: feedbackFromOrders
          });
        }
      } catch (fallbackError) {
        console.error('Fallback to orders also failed:', fallbackError);
      }
      
      return NextResponse.json({
        success: true,
        feedback: []
      });
    }

    // Build query based on filters
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (rating && rating !== 'all') query.rating = parseInt(rating);

    // Get real feedback from database
    const feedbackCollection = db.collection('customer_feedback');
    let feedback = await feedbackCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    // If no feedback in dedicated collection, try to get from orders
    if (feedback.length === 0) {
      console.log('No feedback in dedicated collection, checking orders...');
      const ordersCollection = db.collection('orders');
      const ordersWithFeedback = await ordersCollection
        .find({ 
          $and: [
            { rating: { $exists: true, $gt: 0 } },
            query.rating ? { rating: query.rating } : {}
          ]
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      feedback = ordersWithFeedback.map((order: any) => ({
        _id: order._id,
        id: order._id.toString(),
        customerName: order.customerName || 'Anonymous Customer',
        customerEmail: order.customerEmail,
        rating: order.rating,
        comment: order.feedback || 'No specific feedback provided',
        category: 'general',
        status: order.feedbackResponse ? 'resolved' : 'new',
        priority: order.rating <= 2 ? 'high' : order.rating === 3 ? 'medium' : 'low',
        orderId: order.orderId,
        response: order.feedbackResponse,
        respondedBy: order.feedbackRespondedBy,
        respondedAt: order.feedbackResponseDate,
        createdAt: order.createdAt || order.timestamp,
        updatedAt: order.updatedAt || order.createdAt || order.timestamp
      }));
    }

    return NextResponse.json({
      success: true,
      feedback: feedback.map(fb => ({
        ...fb,
        id: fb._id?.toString() || fb.id
      }))
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feedback'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { feedbackId, updates } = await request.json();
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 500 });
    }

    // If responding to feedback, add response metadata
    if (updates.response) {
      updates.respondedAt = new Date();
      updates.status = 'resolved';
      updates.respondedBy = 'Admin'; // You can get this from auth context
    }
    
    // Try updating in feedback collection first
    const feedbackCollection = db.collection('customer_feedback');
    let result = await feedbackCollection.updateOne(
      { _id: feedbackId },
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    // If not found in feedback collection, try orders collection
    if (result.matchedCount === 0) {
      const ordersCollection = db.collection('orders');
      result = await ordersCollection.updateOne(
        { _id: feedbackId },
        { 
          $set: {
            feedbackResponse: updates.response,
            feedbackRespondedBy: updates.respondedBy || 'Admin',
            feedbackResponseDate: updates.respondedAt || new Date(),
            updatedAt: new Date()
          }
        }
      );
    }

    if (result.acknowledged && result.matchedCount > 0) {
      // Broadcast update to all connected clients
      broadcastFeedbackUpdate({
        type: 'response_added',
        feedbackId,
        updates
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Feedback updated successfully' 
      });
    } else {
      throw new Error('Feedback not found or failed to update');
    }

  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update feedback' 
    }, { status: 500 });
  }
}