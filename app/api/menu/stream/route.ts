import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';

// Force dynamic rendering for SSE
export const dynamic = 'force-dynamic';

// SSE endpoint for real-time menu updates
export async function GET() {
  try {
    await dbConnect();

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        let lastUpdate = Date.now();

        // Send initial connection message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: lastUpdate })}\n\n`));

        // Check for updates every 30 seconds
        const interval = setInterval(async () => {
          try {
            // Check if controller is still active
            if (controller.signal?.aborted) {
              clearInterval(interval);
              return;
            }

            if (!process.env.MONGODB_URI) {
              // If no database, just send heartbeat
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`));
              return;
            }

            // Get the latest update timestamp
            const latestItem = await MenuItem.findOne().sort({ updatedAt: -1 });
            const currentUpdate = latestItem ? latestItem.updatedAt.getTime() : Date.now();

            // If there's a new update, send it
            if (currentUpdate > lastUpdate) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'update', 
                timestamp: currentUpdate,
                message: 'Menu has been updated'
              })}\n\n`));
              lastUpdate = currentUpdate;
            } else {
              // Send heartbeat to keep connection alive
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`));
            }
          } catch (error) {
            console.error('SSE error:', error);
            // Only try to send error if controller is still active
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Connection error' })}\n\n`));
            } catch (enqueueError) {
              console.error('Failed to send error message:', enqueueError);
              clearInterval(interval);
            }
          }
        }, 30000);

        // Clean up on close
        return () => {
          clearInterval(interval);
        };
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
  } catch (error) {
    console.error('SSE setup error:', error);
    return NextResponse.json({ error: 'Failed to establish SSE connection' }, { status: 500 });
  }
} 