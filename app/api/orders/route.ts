import { NextRequest, NextResponse } from 'next/server';

// Type declaration for process.env to avoid TypeScript linter errors in Next.js API routes
declare const process: {
  env: { [key: string]: string | undefined };
};

// Enhanced order data interface with session management
interface OrderData {
  orderId: string;
  restaurantName: string;
  tableNumber: number;
  sessionId: string; // Unique session ID for tracking
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
    maxQuantity?: number; // Item-specific quantity limit
    bulkPricing?: { quantity: number; price: number }[]; // Bulk pricing info
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
  quantityValidation: {
    totalItems: number;
    maxItemsPerOrder: number;
    hasBulkItems: boolean;
    bulkItemsCount: number;
  };
}

// Simple validation function for order data
function validateOrder(data: any): string | null {
  if (!data) return 'No data provided';
  if (typeof data.orderId !== 'string') return 'Invalid orderId';
  if (typeof data.restaurantName !== 'string') return 'Invalid restaurantName';
  if (typeof data.tableNumber !== 'number') return 'Invalid tableNumber';
  if (typeof data.sessionId !== 'string') return 'Invalid sessionId';
  if (!data.customer || typeof data.customer.name !== 'string' || typeof data.customer.phone !== 'string') return 'Invalid customer info';
  if (!Array.isArray(data.items) || data.items.length === 0) return 'No items in order';
  if (!data.orderSummary || typeof data.orderSummary.grandTotal !== 'number') return 'Invalid order summary';
  
  // Validate quantity limits
  for (const item of data.items) {
    if (item.quantity <= 0) return `Invalid quantity for ${item.name}`;
    if (item.maxQuantity && item.quantity > item.maxQuantity) {
      return `Quantity exceeds limit for ${item.name} (max: ${item.maxQuantity})`;
    }
  }
  
  return null;
}

// Enhanced webhook payload formatting
function formatWebhookPayload(orderData: OrderData) {
  return {
    // Kitchen notification format
    kitchen: {
      orderId: orderData.orderId,
      sessionId: orderData.sessionId,
      timestamp: orderData.timestamp,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customer.name,
      customerPhone: orderData.customer.phone,
      items: orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        category: item.category,
        isVeg: item.isVeg,
        isSignature: item.isSignature,
        specialNotes: item.isSignature ? 'SIGNATURE DISH' : '',
        maxQuantity: item.maxQuantity,
        bulkPricing: item.bulkPricing,
      })),
      specialInstructions: orderData.specialInstructions,
      totalAmount: orderData.orderSummary.grandTotal,
      estimatedTime: orderData.estimatedTime,
      priority: orderData.items.some(item => item.isSignature) ? 'HIGH' : 'NORMAL',
      quantityValidation: orderData.quantityValidation,
    },
    // POS system format
    pos: {
      orderId: orderData.orderId,
      sessionId: orderData.sessionId,
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
      quantityValidation: orderData.quantityValidation,
    },
    // Analytics format
    analytics: {
      orderId: orderData.orderId,
      sessionId: orderData.sessionId,
      timestamp: orderData.timestamp,
      tableNumber: orderData.tableNumber,
      totalAmount: orderData.orderSummary.grandTotal,
      itemCount: orderData.orderSummary.itemCount,
      categories: Array.from(new Set(orderData.items.map(item => item.category))),
      hasSignatureItems: orderData.items.some(item => item.isSignature),
      hasVegItems: orderData.items.some(item => item.isVeg),
      hasBulkItems: orderData.quantityValidation.hasBulkItems,
      bulkItemsCount: orderData.quantityValidation.bulkItemsCount,
      customerPhone: orderData.customer.phone, // For analytics only
    },
    // N8N format (for Excel export and kitchen printing)
    n8n: {
      orderId: orderData.orderId,
      sessionId: orderData.sessionId,
      timestamp: orderData.timestamp,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customer.name,
      customerPhone: orderData.customer.phone,
      items: orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        category: item.category,
        isVeg: item.isVeg,
        isSignature: item.isSignature,
        maxQuantity: item.maxQuantity,
        bulkPricing: item.bulkPricing,
      })),
      orderSummary: orderData.orderSummary,
      specialInstructions: orderData.specialInstructions,
      estimatedTime: orderData.estimatedTime,
      status: orderData.status,
      quantityValidation: orderData.quantityValidation,
    },
  };
}

// Function to send order data to webhook endpoints
async function sendToWebhooks(orderData: OrderData, webhookPayloads: any) {
  const webhookUrls = {
    n8n: process.env.N8N_WEBHOOK_URL,
    kitchen: process.env.KITCHEN_WEBHOOK_URL,
    pos: process.env.POS_WEBHOOK_URL,
    analytics: process.env.ANALYTICS_WEBHOOK_URL,
  };

  const results = [];

  for (const [type, url] of Object.entries(webhookUrls)) {
    if (url) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Order-ID': orderData.orderId,
            'X-Session-ID': orderData.sessionId,
            'X-Table-Number': orderData.tableNumber.toString(),
          },
          body: JSON.stringify(webhookPayloads[type]),
        });

        results.push({
          type,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
        });

        console.log(`Webhook ${type}: ${response.ok ? 'SUCCESS' : 'FAILED'} (${response.status})`);
      } catch (error) {
        console.error(`Webhook ${type} error:`, error);
        results.push({
          type,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    // API key check (optional, but recommended)
    const apiKey = typeof process !== 'undefined' ? process.env.ORDER_API_KEY : undefined;
    if (apiKey && apiKey !== '') {
      const reqKey = request.headers.get('x-api-key');
      if (reqKey !== apiKey) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
    }

    const orderData: OrderData = await request.json();

    // Validate order data
    const validationError = validateOrder(orderData);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: `Validation error: ${validationError}` },
        { status: 400 }
      );
    }

    // Calculate quantity validation info
    const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    const hasBulkItems = orderData.items.some(item => item.bulkPricing && item.bulkPricing.length > 0);
    const bulkItemsCount = orderData.items.filter(item => item.bulkPricing && item.bulkPricing.length > 0).length;
    
    // Add quantity validation to order data
    orderData.quantityValidation = {
      totalItems,
      maxItemsPerOrder: 50, // Configurable limit
      hasBulkItems,
      bulkItemsCount,
    };

    // Format webhook payloads
    const webhookPayloads = formatWebhookPayload(orderData);

    // Send to webhooks
    const webhookResults = await sendToWebhooks(orderData, webhookPayloads);

    // Log order details
    console.log('Order received:', {
      orderId: orderData.orderId,
      sessionId: orderData.sessionId,
      tableNumber: orderData.tableNumber,
      itemCount: orderData.items.length,
      totalAmount: orderData.orderSummary.grandTotal,
      webhookResults,
    });

    return NextResponse.json({
      success: true,
      message: 'Order received successfully',
      orderId: orderData.orderId,
      sessionId: orderData.sessionId,
      tableNumber: orderData.tableNumber,
      webhookResults,
    });

  } catch (error) {
    console.error('Order processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}