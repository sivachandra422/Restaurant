# Webhook Setup Guide for Sri Kanya Restaurant Menu

## Step 1: Create Environment File

Create a `.env.local` file in your project root with the following content:

```env
# Restaurant Order System Webhook Configuration

# N8N Webhook URL (Primary - for Excel export and kitchen printing)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/restaurant-orders

# Kitchen Display System Webhook (for real-time kitchen notifications)
KITCHEN_WEBHOOK_URL=https://your-kitchen-system.com/webhook/orders

# POS System Webhook (for order management and billing)
POS_WEBHOOK_URL=https://your-pos-system.com/api/orders

# Analytics Webhook (for business intelligence and reporting)
ANALYTICS_WEBHOOK_URL=https://your-analytics-platform.com/webhook/orders

# Optional: API Key for additional security (generate a secure random string)
ORDER_API_KEY=your-secure-api-key-here

# Restaurant Configuration
RESTAURANT_NAME=Sri Kanya Family Restaurants
RESTAURANT_PHONE=+91-XXXXXXXXXX
RESTAURANT_ADDRESS=Your Restaurant Address Here

# Order Processing Settings
DEFAULT_ESTIMATED_TIME=20-25 minutes
DEFAULT_ORDER_TYPE=dine-in
DEFAULT_TAX_RATE=0.05
DEFAULT_SERVICE_CHARGE=0.10
```

## Step 2: N8N Workflow Setup

### For Excel Export and Kitchen Printing:

1. **Create N8N Workflow**:
   - Go to your N8N instance
   - Create a new workflow
   - Add a "Webhook" trigger node
   - Copy the webhook URL from the trigger node

2. **Update your `.env.local`**:
   ```env
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/restaurant-orders
   ```

3. **Add Excel Export Node**:
   - Add "Google Sheets" or "Excel" node
   - Configure to append order data to your spreadsheet
   - Map the incoming data fields

4. **Add Kitchen Print Node**:
   - Add "HTTP Request" node for printer integration
   - Or use "Email" node to send to kitchen printer email
   - Format the order data for printing

### Sample N8N Workflow Structure:
```
Webhook Trigger → Data Processing → Excel Export → Kitchen Print → Success Response
```

## Step 3: Test Your Webhook

### Option 1: Use the Test Script

Create a file called `test-webhook.js` in your project root:

```javascript
// test-webhook.js
const testOrder = {
  orderId: `SRK-${Date.now()}`,
  restaurantName: 'Sri Kanya Family Restaurants',
  tableNumber: 5,
  timestamp: new Date().toISOString(),
  customer: {
    name: 'Test Customer',
    phone: '+91-9876543210',
  },
  items: [
    {
      id: 'chicken_dum_biryani_full',
      name: 'Chicken Dum Biryani (Full)',
      quantity: 2,
      unitPrice: 220,
      subtotal: 440,
      category: 'biryanis',
      isVeg: false,
      isSignature: true,
    },
    {
      id: 'paneer_butter_masala',
      name: 'Paneer Butter Masala',
      quantity: 1,
      unitPrice: 180,
      subtotal: 180,
      category: 'vegCurries',
      isVeg: true,
      isSignature: false,
    }
  ],
  orderSummary: {
    itemCount: 3,
    subtotal: 620,
    tax: 0,
    serviceCharge: 0,
    discount: 0,
    grandTotal: 620,
  },
  specialInstructions: 'Less spicy please',
  orderType: 'dine-in',
  estimatedTime: '20-25 minutes',
  status: 'received',
};

async function testWebhook() {
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
    });

    const result = await response.json();
    console.log('Webhook Test Result:', result);
    
    if (result.success) {
      console.log('✅ Webhook test successful!');
      console.log('Order ID:', result.orderId);
      console.log('Webhook Status:', result.webhookStatus);
    } else {
      console.log('❌ Webhook test failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testWebhook();
```

### Option 2: Use Browser Developer Tools

1. Open your restaurant menu in the browser
2. Add some items to cart
3. Proceed to checkout
4. Fill in test details and place order
5. Check browser console for webhook responses

### Option 3: Use Postman or curl

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "SRK-1234567890",
    "restaurantName": "Sri Kanya Family Restaurants",
    "tableNumber": 5,
    "timestamp": "2025-01-27T10:30:00.000Z",
    "customer": {
      "name": "Test Customer",
      "phone": "+91-9876543210"
    },
    "items": [
      {
        "id": "chicken_dum_biryani_full",
        "name": "Chicken Dum Biryani (Full)",
        "quantity": 2,
        "unitPrice": 220,
        "subtotal": 440,
        "category": "biryanis",
        "isVeg": false,
        "isSignature": true
      }
    ],
    "orderSummary": {
      "itemCount": 2,
      "subtotal": 440,
      "tax": 0,
      "serviceCharge": 0,
      "discount": 0,
      "grandTotal": 440
    },
    "specialInstructions": "Test order",
    "orderType": "dine-in",
    "estimatedTime": "20-25 minutes",
    "status": "received"
  }'
```

## Step 4: Verify Webhook Functionality

### Check Webhook Status in Order Response

When an order is placed successfully, you'll see a response like:

```json
{
  "success": true,
  "message": "Order received successfully",
  "orderId": "SRK-1706341234567",
  "webhookStatus": [
    {
      "type": "n8n",
      "status": "success"
    },
    {
      "type": "kitchen",
      "status": "success"
    }
  ],
  "estimatedTime": "20-25 minutes"
}
```

### Monitor Webhook Logs

Check your server console for webhook status messages:
```
Webhook results: [
  { type: 'n8n', status: 'success' },
  { type: 'kitchen', status: 'success' }
]
```

## Step 5: Production Deployment

### For Production Environment:

1. **Update Environment Variables**:
   ```env
   N8N_WEBHOOK_URL=https://your-production-n8n.com/webhook/restaurant-orders
   KITCHEN_WEBHOOK_URL=https://your-production-kitchen.com/webhook
   POS_WEBHOOK_URL=https://your-production-pos.com/api/orders
   ANALYTICS_WEBHOOK_URL=https://your-production-analytics.com/webhook
   ```

2. **Set API Key** (Recommended):
   ```env
   ORDER_API_KEY=your-secure-production-api-key
   ```

3. **Deploy to Your Hosting Platform**:
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - AWS/GCP: Follow your deployment process

## Troubleshooting

### Common Issues:

1. **Webhook Timeout**:
   - Check if your webhook URLs are accessible
   - Verify network connectivity
   - Ensure webhook endpoints are responding quickly

2. **CORS Issues**:
   - Your webhook endpoints should accept POST requests
   - No CORS configuration needed for server-to-server communication

3. **Authentication Issues**:
   - If using API keys, ensure they're correctly set
   - Check webhook endpoint authentication requirements

4. **Data Format Issues**:
   - Verify your webhook endpoints accept JSON
   - Check the expected data structure for each endpoint

### Debug Mode:

Add this to your `.env.local` for detailed logging:
```env
DEBUG_WEBHOOKS=true
```

## Webhook Payload Examples

### N8N Webhook (Full Order Data):
```json
{
  "orderId": "SRK-1706341234567",
  "restaurantName": "Sri Kanya Family Restaurants",
  "tableNumber": 5,
  "timestamp": "2025-01-27T10:30:00.000Z",
  "customer": {
    "name": "John Doe",
    "phone": "+91-9876543210"
  },
  "items": [...],
  "orderSummary": {...},
  "specialInstructions": "Less spicy please",
  "orderType": "dine-in",
  "estimatedTime": "20-25 minutes",
  "status": "received"
}
```

### Kitchen Webhook (Optimized for Kitchen Display):
```json
{
  "orderId": "SRK-1706341234567",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "tableNumber": 5,
  "customerName": "John Doe",
  "customerPhone": "+91-9876543210",
  "items": [
    {
      "name": "Chicken Dum Biryani (Full)",
      "quantity": 2,
      "category": "biryanis",
      "isVeg": false,
      "isSignature": true,
      "specialNotes": "SIGNATURE DISH"
    }
  ],
  "specialInstructions": "Less spicy please",
  "totalAmount": 440,
  "estimatedTime": "20-25 minutes",
  "priority": "HIGH"
}
```

## Next Steps

1. ✅ Set up your `.env.local` file
2. ✅ Configure your N8N workflow
3. ✅ Test the webhook functionality
4. ✅ Deploy to production
5. ✅ Monitor webhook performance
6. ✅ Set up error alerts for failed webhooks

Your restaurant menu system is now ready for production with full webhook integration! 