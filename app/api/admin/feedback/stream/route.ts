import { NextRequest } from 'next/server';

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

// This route should not be statically generated
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      connections.add(controller);
      
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        timestamp: Date.now()
      })}\n\n`);
      
      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: Date.now()
          })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          connections.delete(controller);
        }
      }, 30000);
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        connections.delete(controller);
        try {
          controller.close();
        } catch (error) {
          // Controller already closed
        }
      });
    },
    
    cancel(controller) {
      connections.delete(controller);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Function to broadcast updates to all connected clients
export function broadcastFeedbackUpdate(data: any) {
  const message = `data: ${JSON.stringify({
    type: 'feedback-update',
    data,
    timestamp: Date.now()
  })}\n\n`;

  connections.forEach(controller => {
    try {
      controller.enqueue(message);
    } catch (error) {
      // Remove dead connections
      connections.delete(controller);
    }
  });
}