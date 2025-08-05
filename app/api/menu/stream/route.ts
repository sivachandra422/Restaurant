import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';

// Force dynamic rendering for SSE endpoint - never statically generate this
export const dynamic = 'force-dynamic';

// Global variable to store menu updates
declare global {
  var menuUpdates: Array<{ timestamp: number; data: any }>;
}

if (!global.menuUpdates) {
  global.menuUpdates = [];
}

export async function GET(request: NextRequest) {
  try {
    const encoder = new TextEncoder();
    let isActive = true;
    let lastUpdate = Date.now();

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`));
        } catch (error) {
          console.error('Failed to send initial message:', error);
          return;
        }

        // Function to safely send data
        const safeEnqueue = (data: any) => {
          if (!isActive) return false;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            return true;
          } catch (error) {
            console.error('Failed to enqueue data:', error);
            isActive = false;
            return false;
          }
        };

        // Function to check for updates
        const checkForUpdates = async () => {
          if (!isActive) return;

          try {
            // Check for menu updates from broadcast
            if (global.menuUpdates && global.menuUpdates.length > 0) {
              const latestUpdate = global.menuUpdates[global.menuUpdates.length - 1];
              if (latestUpdate.timestamp > lastUpdate) {
                const success = safeEnqueue({
                  type: 'menuUpdate',
                  timestamp: latestUpdate.timestamp,
                  data: latestUpdate
                });
                if (success) {
                  lastUpdate = latestUpdate.timestamp;
                }
                return;
              }
            }

            // If no database, just send heartbeat
            if (!process.env.MONGODB_URI) {
              safeEnqueue({ type: 'heartbeat', timestamp: Date.now() });
              return;
            }

            // Get the latest update timestamp from database
            try {
              await dbConnect();
              const latestItem = await MenuItem.findOne().sort({ updatedAt: -1 });
              const currentUpdate = latestItem ? latestItem.updatedAt.getTime() : Date.now();

              // If there's a new update, send it
              if (currentUpdate > lastUpdate) {
                const success = safeEnqueue({
                  type: 'update',
                  timestamp: currentUpdate,
                  message: 'Menu has been updated'
                });
                if (success) {
                  lastUpdate = currentUpdate;
                }
              } else {
                // Send heartbeat to keep connection alive
                safeEnqueue({ type: 'heartbeat', timestamp: Date.now() });
              }
            } catch (dbError) {
              console.error('Database error in stream:', dbError);
              // Send heartbeat even if database fails
              safeEnqueue({ type: 'heartbeat', timestamp: Date.now() });
            }
          } catch (error) {
            console.error('SSE error:', error);
            safeEnqueue({ type: 'error', message: 'Connection error' });
          }
        };

        // Set up interval for checking updates
        const interval = setInterval(() => {
          if (!isActive) {
            clearInterval(interval);
            return;
          }
          checkForUpdates();
        }, 30000); // Check every 30 seconds

        // Clean up function
        const cleanup = () => {
          isActive = false;
          if (interval) {
            clearInterval(interval);
          }
        };

        // Handle stream close
        return cleanup;
      },
      cancel() {
        isActive = false;
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
    return new Response(JSON.stringify({ error: 'Failed to establish SSE connection' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 