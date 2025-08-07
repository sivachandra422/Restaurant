import { NextRequest, NextResponse } from 'next/server';
import { emailService, OrderEmailData, NotificationEmailData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, recipientEmail } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type) {
      case 'order-confirmation':
        success = await emailService.sendOrderConfirmation(data as OrderEmailData, recipientEmail);
        break;
      
      case 'order-update':
        success = await emailService.sendOrderUpdate(data as OrderEmailData, recipientEmail);
        break;
      
      case 'kitchen-notification':
        success = await emailService.sendKitchenNotification(data as OrderEmailData, recipientEmail);
        break;
      
      case 'system-notification':
        success = await emailService.sendSystemNotification(data as NotificationEmailData, recipientEmail);
        break;
      
      case 'daily-report':
        success = await emailService.sendDailyReport(data, recipientEmail);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
