import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import sseEventEmitter from '@/lib/sse-events';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { rating, feedback } = await request.json();
    const orderId = params.id;
    
    console.log('Rating submission request:', { orderId, rating, feedback });

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be between 1 and 5.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    console.log('Looking for order with orderId:', orderId);
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      console.log('Order not found with orderId:', orderId);
      // Try to find by _id as well
      const orderById = await Order.findById(orderId);
      if (orderById) {
        console.log('Order found by _id:', orderById.orderId);
        // Update the order
        orderById.rating = rating;
        orderById.feedback = feedback;
        orderById.updatedAt = new Date();
        await orderById.save();

        // Emit SSE events
        sseEventEmitter.emit('order-event', {
          type: 'order-updated',
          order: orderById.toObject()
        });

        sseEventEmitter.emit('order-event', {
          type: 'feedback-submitted',
          order: orderById.toObject(),
          rating,
          feedback
        });

        return NextResponse.json({
          success: true,
          message: 'Rating submitted successfully',
          order: {
            orderId: orderById.orderId,
            rating: orderById.rating,
            feedback: orderById.feedback
          }
        });
      }
      
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('Order found:', order.orderId);

    // Update the order with rating and feedback
    order.rating = rating;
    order.feedback = feedback;
    order.updatedAt = new Date();
    await order.save();

    // Emit SSE event for real-time updates
    sseEventEmitter.emit('order-event', {
      type: 'order-updated',
      order: order.toObject()
    });

    // Also emit a specific feedback event
    sseEventEmitter.emit('order-event', {
      type: 'feedback-submitted',
      order: order.toObject(),
      rating,
      feedback
    });

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      order: {
        orderId: order.orderId,
        rating: order.rating,
        feedback: order.feedback
      }
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
} 