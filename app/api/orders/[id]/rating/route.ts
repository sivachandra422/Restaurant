import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { rating, feedback } = await request.json();
    const orderId = params.id;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be between 1 and 5.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order with rating and feedback
    order.rating = rating;
    order.feedback = feedback;
    await order.save();

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