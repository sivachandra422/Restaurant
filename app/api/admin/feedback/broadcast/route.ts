import { NextRequest, NextResponse } from 'next/server';
import { broadcastFeedbackUpdate } from '../stream/route';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Broadcast the update to all connected SSE clients
    broadcastFeedbackUpdate(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error broadcasting feedback update:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to broadcast update' 
    }, { status: 500 });
  }
}