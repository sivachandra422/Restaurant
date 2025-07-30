import { NextRequest, NextResponse } from 'next/server';

// Type declaration for process.env to avoid TypeScript linter errors in Next.js API routes
declare const process: {
  env: { [key: string]: string | undefined };
};

// Enhanced order data interface
interface OrderData {
  orderId: string;
  restaurantName: string;
  tableNumber: number;
  timestamp: string;
  customer: {
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    category: string;
    isVeg: boolean;
    isSignature: boolean;
  }>;
  orderSummary: {
    itemCount: number;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    discount: number;
    grandTotal: number;
  };
  specialInstructions: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  estimatedTime: string;
  status: 'received' | 'preparing' | 'ready' | 'served' | 'completed';
}

// Simple validation function for order data
function validateOrder(data: any): string | null {
  if (!data) return 'No data provided';
  if (typeof data.orderId !== 'string') return 'Invalid orderId';
  if (typeof data.restaurantName !== 'string') return 'Invalid restaurantName';
  if (typeof data.tableNumber !== 'number') return 'Invalid tableNumber';
  if (!data.customer || typeof data.customer.name !== 'string' || typeof data.customer.phone !== 'string') return 'Invalid customer info';
  if (!Array.isArray(data.items) || data.items.length === 0) return 'No items in order';
  if (!data.orderSummary || typeof data.orderSummary.grandTotal !== 'number') return 'Invalid order summary';
  return null;
}

// Enhanced webhook payload formatting
function formatWebhookPayload(orderData: OrderData) {
  return {
    // Kitchen notification format
    kitchen: {
      orderId: orderData.orderId,
      timestamp: orderData.timestamp,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customer.name,
      customerPhone: orderData.customer.phone,
      items: orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        isVeg: item.isVeg,
        isSignature: item.isSignature,
        specialNotes: item.isSignature ? 'SIGNATURE DISH' : '',
      })),
      specialInstructions: orderData.specialInstructions,
      totalAmount: orderData.orderSummary.grandTotal,
      estimatedTime: orderData.estimatedTime,
      priority: orderData.items.some(item => item.isSignature) ? 'HIGH' : 'NORMAL',
    },
    // POS system format
    pos: {
      orderId: orderData.orderId,
      restaurantName: orderData.restaurantName,
      tableNumber: orderData.tableNumber,
      customer: orderData.customer,
      items: orderData.items,
      orderSummary: orderData.orderSummary,
      specialInstructions: orderData.specialInstructions,
      orderType: orderData.orderType,
      estimatedTime: orderData.estimatedTime,
      status: orderData.status,
      timestamp: orderData.timestamp,
    },
    // Analytics format
    analytics: {
      orderId: orderData.orderId,
      timestamp: orderData.timestamp,
      totalAmount: orderData.orderSummary.grandTotal,
      itemCount: orderData.orderSummary.itemCount,
      categories: Array.from(new Set(orderData.items.map(item => item.category))),
      hasSignatureItems: orderData.items.some(item => item.isSignature),
      hasVegItems: orderData.items.some(item => item.isVeg),
      customerPhone: orderData.customer.phone, // For analytics only
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    // API key check (optional, but recommended)
    const apiKey = typeof process !== 'undefined' ? process.env.ORDER_API_KEY : undefined;
    if (apiKey) {
      const reqKey = request.headers.get('x-api-key');
      if (reqKey !== apiKey) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
    }

    const orderData: OrderData = await request.json();

    // Validate order data
    const validationError = validateOrder(orderData);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    // Enhanced webhook integration
    const webhookUrls = {
      kitchen: typeof process !== 'undefined' ? process.env.KITCHEN_WEBHOOK_URL : undefined,
      pos: typeof process !== 'undefined' ? process.env.POS_WEBHOOK_URL : undefined,
      analytics: typeof process !== 'undefined' ? process.env.ANALYTICS_WEBHOOK_URL : undefined,
      n8n: typeof process !== 'undefined' ? process.env.N8N_WEBHOOK_URL : undefined,
    };

    const webhookPayload = formatWebhookPayload(orderData);
    const webhookResults = [];

    // Send to multiple webhook endpoints
    for (const [type, url] of Object.entries(webhookUrls)) {
      if (url) {
        try {
          const payload = type === 'n8n' ? orderData : webhookPayload[type as keyof typeof webhookPayload];
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Type': type,
              'X-Order-ID': orderData.orderId,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`Webhook ${type} failed with status ${response.status}`);
          }

          webhookResults.push({ type, status: 'success' });
        } catch (err) {
          console.error(`Webhook ${type} error:`, err);
          webhookResults.push({ type, status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }
    }

    // Log webhook results
    console.log('Webhook results:', webhookResults);

    // Return success response with webhook status
    return NextResponse.json(
      {
        success: true,
        message: 'Order received successfully',
        orderId: orderData.orderId,
        webhookStatus: webhookResults,
        estimatedTime: orderData.estimatedTime,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging, but do not expose details to client
    console.error('Error processing order:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process order',
      },
      { status: 500 }
    );
  }
}