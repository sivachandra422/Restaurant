import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import sseEventEmitter from '@/lib/sse-events';

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';

// Track active connections
let activeConnections = 0;
const MAX_CONNECTIONS = 10;

// GET - SSE stream endpoint
export async function GET(request: NextRequest) {
  // Skip during build time
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping SSE stream during build time');
    return new Response('SSE stream not available during build', { 
      status: 503,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }

  // Check connection limit
  if (activeConnections >= MAX_CONNECTIONS) {
    console.log(`Too many SSE connections (${activeConnections}/${MAX_CONNECTIONS}), rejecting new connection`);
    return new Response('Too many connections', { status: 429 });
  }

  activeConnections++;
  console.log(`SSE connection established. Active connections: ${activeConnections}`);

  try {
    const stream = new ReadableStream({
      start(controller) {
        let isControllerClosed = false;

        // Helper function to safely enqueue data
        const safeEnqueue = (data: any) => {
          if (isControllerClosed) {
            return false;
          }
          try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(new TextEncoder().encode(message));
            return true;
          } catch (error) {
            console.error('Error enqueuing message:', error);
            isControllerClosed = true;
            return false;
          }
        };

        // Send initial connection message
        safeEnqueue({ type: 'connected', message: 'SSE connection established' });

        // Send current orders (with better error handling)
        sendCurrentOrders(safeEnqueue);

        // Event handler for real-time updates
        const handler = (data: any) => {
          if (!isControllerClosed) {
            safeEnqueue(data);
          }
        };

        // Add event listener with proper cleanup
        sseEventEmitter.on('order-event', handler);

        // Keep connection alive with heartbeats
        const heartbeatInterval = setInterval(() => {
          if (!isControllerClosed) {
            safeEnqueue({ type: 'heartbeat' });
          } else {
            clearInterval(heartbeatInterval);
          }
        }, 15000); // Send heartbeat every 15 seconds

        // Clean up when client disconnects
        request.signal.addEventListener('abort', () => {
          console.log('Client disconnected from SSE stream.');
          isControllerClosed = true;
          activeConnections = Math.max(0, activeConnections - 1);
          console.log(`SSE connection closed. Active connections: ${activeConnections}`);
          clearInterval(heartbeatInterval);
          sseEventEmitter.off('order-event', handler);
          controller.close();
        });

        // Handle stream cancellation
        return () => {
          console.log('Stream cancelled by client.');
          isControllerClosed = true;
          activeConnections = Math.max(0, activeConnections - 1);
          console.log(`SSE connection cancelled. Active connections: ${activeConnections}`);
          clearInterval(heartbeatInterval);
          sseEventEmitter.off('order-event', handler);
        };
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    activeConnections = Math.max(0, activeConnections - 1);
    console.error('Error creating SSE stream:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

async function sendCurrentOrders(safeEnqueue: (data: any) => boolean) {
  try {
    // Only try to connect if MONGODB_URI is available
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI available, sending empty orders list');
      safeEnqueue({ type: 'initial-orders', orders: [] });
      return;
    }

    const { db } = await connectToDatabase();
    if (!db) {
      console.log('Database connection not available, sending empty orders list');
      safeEnqueue({ type: 'initial-orders', orders: [] });
      return;
    }

    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    safeEnqueue({ type: 'initial-orders', orders });
  } catch (error) {
    console.error('Error sending current orders:', error);
    // Send empty orders list instead of failing
    safeEnqueue({ type: 'initial-orders', orders: [] });
  }
} 