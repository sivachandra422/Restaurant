import { NextRequest } from 'next/server';
import sseEventEmitter from '@/lib/sse-events';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        const eventName = data?.type ? `event: ${data.type}\n` : '';
        controller.enqueue(encoder.encode(`${eventName}data: ${JSON.stringify(data)}\n\n`));
      };

      // initial
      send({ type: 'connected', message: 'feedback stream connected' });

      const handler = (payload: any) => {
        if (payload?.type === 'feedback-submitted' || payload?.type === 'order-updated') {
          send(payload);
        }
      };
      sseEventEmitter.on('order-event', handler);

      request.signal.addEventListener('abort', () => {
        sseEventEmitter.off('order-event', handler);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}


