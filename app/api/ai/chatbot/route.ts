import { NextRequest, NextResponse } from 'next/server';
import { AIChatbot } from '@/lib/ai/chatbot';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';
import { RESTAURANT_INFO } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    // Flatten menu
    const chatbot = new AIChatbot(sriKanyaMenu, RESTAURANT_INFO);
    const response = chatbot.processMessage(message);
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
} 