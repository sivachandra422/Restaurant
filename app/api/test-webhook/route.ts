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

    // Test 1: Check if webhook URL is accessible
    console.log('🔍 Step 1: Testing webhook URL accessibility...');
    let getResponse: Response | undefined;
    try {
      getResponse = await fetch(webhookUrl, { method: 'GET' });
      console.log('📥 GET response status:', getResponse.status);
      console.log('📥 GET response body:', await getResponse.text());
    } catch (getError) {
      console.log('❌ GET request failed:', getError);
    }

    // Test 2: Try POST with minimal headers
    console.log('🔍 Step 2: Testing POST with minimal headers...');
    const minimalHeaders = { 'Content-Type': 'application/json' };
    
    let minimalResponse: Response | undefined;
    try {
      minimalResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: minimalHeaders,
        body: JSON.stringify(testPayload),
      });
      console.log('📥 Minimal POST response status:', minimalResponse.status);
      console.log('📥 Minimal POST response body:', await minimalResponse.text());
    } catch (minimalError) {
      console.log('❌ Minimal POST request failed:', minimalError);
    }

    // Test 3: Try POST with full headers (including restaurant source)
    console.log('🔍 Step 3: Testing POST with full headers...');
    const fullHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Restaurant-Source': 'Sri-Kanya-App'
    };

    if (process.env.ORDER_API_KEY) {
      fullHeaders['x-api-key'] = process.env.ORDER_API_KEY;
      console.log('🔑 API key included in headers');
    }

    console.log('📋 Full headers:', fullHeaders);
    
    let fullResponse: Response | undefined;
    let responseText = '';
    try {
      fullResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: fullHeaders,
        body: JSON.stringify(testPayload),
      });
      responseText = await fullResponse.text();
      console.log('📥 Full POST response status:', fullResponse.status);
      console.log('📥 Full POST response body:', responseText);
    } catch (fullError) {
      console.log('❌ Full POST request failed:', fullError);
    }

    // Return comprehensive test results
    return NextResponse.json({
      success: fullResponse?.ok || false,
      message: fullResponse?.ok ? 'Webhook test successful' : 'Webhook test failed',
      webhookUrl,
      status: fullResponse?.status || 'N/A',
      response: responseText || 'N/A',
      payload: testPayload,
      debug: {
        getRequest: { status: getResponse?.status || 'N/A' },
        minimalPost: { status: minimalResponse?.status || 'N/A' },
        fullPost: { status: fullResponse?.status || 'N/A' }
      }
    });

  } catch (error: any) {
    console.error('💥 Webhook test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Webhook test error',
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace'
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
      message: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
