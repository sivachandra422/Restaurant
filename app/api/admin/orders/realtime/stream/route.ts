import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import sseEventEmitter from '@/lib/sse-events';
import { Order } from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

// GET - SSE stream endpoint
export async function GET(request: NextRequest) {
  try {
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialMessage));

        // Send current orders
        sendCurrentOrders(controller);

        // Event handler for real-time updates
        const handler = (data: any) => {
          try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(new TextEncoder().encode(message));
          } catch (error) {
            console.error('Error enqueuing message:', error);
            // If enqueue fails, it might mean the client disconnected, so remove handler
            sseEventEmitter.off('order-event', handler);
            controller.close();
          }
        };

        sseEventEmitter.on('order-event', handler);

        // Keep connection alive with heartbeats
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode('data: {"type": "heartbeat"}\n\n'));
          } catch (error) {
            console.error('Error sending heartbeat:', error);
            clearInterval(heartbeatInterval);
            sseEventEmitter.off('order-event', handler);
            controller.close();
          }
        }, 15000); // Send heartbeat every 15 seconds

        // Clean up when client disconnects
        request.signal.addEventListener('abort', () => {
          console.log('Client disconnected from SSE stream.');
          clearInterval(heartbeatInterval);
          sseEventEmitter.off('order-event', handler);
          controller.close();
        });
      },
      cancel() {
        console.log('Stream cancelled by client.');
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error setting up SSE stream:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set up SSE stream' },
      { status: 500 }
    );
  }
}

async function sendCurrentOrders(controller: ReadableStreamDefaultController<Uint8Array>) {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      console.error('Database connection failed in sendCurrentOrders');
      return;
    }
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    const message = `data: ${JSON.stringify({ type: 'initial-orders', orders })}\n\n`;
    controller.enqueue(new TextEncoder().encode(message));
  } catch (error) {
    console.error('Error sending current orders:', error);
    // Do not close controller here, let the main stream logic handle it
  }
} 