import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify webhook configuration
export async function GET(request: NextRequest) {
  try {
    const webhookUrl = process.env.SIMSTUDIO_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'SIMSTUDIO_WEBHOOK_URL not configured',
        message: 'Please set SIMSTUDIO_WEBHOOK_URL in your environment variables'
      }, { status: 400 });
    }

    // Test payload
    const testPayload = {
      success: true,
      orderId: "TEST_ORDER_123",
      order: {
        orderId: "TEST_ORDER_123",
        tableNumber: "TEST_TABLE",
        customerName: "Test Customer",
        items: [
          {
            name: "Test Item",
            quantity: 1,
            price: 10.99,
            category: "Test Category"
          }
        ],
        totalAmount: 10.99,
        timestamp: new Date().toISOString()
      },
      message: "Test webhook from Sri Kanya Restaurant"
    };

    console.log('🧪 Testing webhook with URL:', webhookUrl);
    console.log('📦 Test payload:', JSON.stringify(testPayload, null, 2));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Restaurant-Source': 'Sri-Kanya-App'
    };

    if (process.env.ORDER_API_KEY) {
      headers['x-api-key'] = process.env.ORDER_API_KEY;
    }

    console.log('📋 Test headers:', headers);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
    });

    const responseText = await response.text();
    
    console.log('📥 Test response status:', response.status);
    console.log('📥 Test response body:', responseText);

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Webhook test successful',
        webhookUrl,
        status: response.status,
        response: responseText,
        payload: testPayload
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Webhook test failed',
        webhookUrl,
        status: response.status,
        response: responseText,
        payload: testPayload
      }, { status: response.status });
    }

  } catch (error: any) {
    console.error('💥 Webhook test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Webhook test error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// POST endpoint to test with custom payload
export async function POST(request: NextRequest) {
  try {
    const webhookUrl = process.env.SIMSTUDIO_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'SIMSTUDIO_WEBHOOK_URL not configured'
      }, { status: 400 });
    }

    const customPayload = await request.json();
    
    console.log('🧪 Testing webhook with custom payload');
    console.log('📦 Custom payload:', JSON.stringify(customPayload, null, 2));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Restaurant-Source': 'Sri-Kanya-App'
    };

    if (process.env.ORDER_API_KEY) {
      headers['x-api-key'] = process.env.ORDER_API_KEY;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(customPayload),
    });

    const responseText = await response.text();
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Custom webhook test successful',
        status: response.status,
        response: responseText
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Custom webhook test failed',
        status: response.status,
        response: responseText
      }, { status: response.status });
    }

  } catch (error: any) {
    console.error('💥 Custom webhook test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Custom webhook test error',
      message: error.message
    }, { status: 500 });
  }
}
