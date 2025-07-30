# Free Webhook Setup for Sri Kanya Restaurant

## 🚀 Quick Setup - No Cost Required!

### Option 1: Webhook.site (Recommended - 5 minutes setup)

1. **Go to https://webhook.site**
2. **Copy your unique webhook URL** (it looks like: `https://webhook.site/abc123-def456-ghi789`)
3. **Use this URL in your Render environment variables**

### Option 2: RequestBin (Alternative - 3 minutes setup)

1. **Go to https://requestbin.com**
2. **Click "Create a Request Bin"**
3. **Copy the webhook URL** (it looks like: `https://requestbin.com/r/abc123def456`)
4. **Use this URL in your Render environment variables**

## 🔧 Configure Your Render Environment Variables

Go to your Render dashboard and add these environment variables:

```env
NODE_ENV=production
N8N_WEBHOOK_URL=https://webhook.site/YOUR-UNIQUE-URL-HERE
KITCHEN_WEBHOOK_URL=https://webhook.site/YOUR-KITCHEN-URL-HERE
POS_WEBHOOK_URL=https://webhook.site/YOUR-POS-URL-HERE
ANALYTICS_WEBHOOK_URL=https://webhook.site/YOUR-ANALYTICS-URL-HERE
ORDER_API_KEY=test-api-key-123
```

## 📋 Step-by-Step Instructions

### Step 1: Create Webhook URLs
1. Open https://webhook.site in a new tab
2. You'll see a unique URL like: `https://webhook.site/abc123-def456-ghi789`
3. Copy this URL

### Step 2: Update Render Environment Variables
1. Go to https://dashboard.render.com
2. Click on your service: `sri-kanya-restaurant-menu`
3. Go to **Environment** tab
4. Add these variables:

```
Key: N8N_WEBHOOK_URL
Value: https://webhook.site/YOUR-UNIQUE-URL-HERE

Key: KITCHEN_WEBHOOK_URL  
Value: https://webhook.site/YOUR-UNIQUE-URL-HERE

Key: POS_WEBHOOK_URL
Value: https://webhook.site/YOUR-UNIQUE-URL-HERE

Key: ANALYTICS_WEBHOOK_URL
Value: https://webhook.site/YOUR-UNIQUE-URL-HERE

Key: ORDER_API_KEY
Value: test-api-key-123

Key: NODE_ENV
Value: production
```

### Step 3: Redeploy Your Service
1. Click **"Manual Deploy"** in Render
2. Wait for deployment to complete
3. Your webhooks will now be active!

## 🧪 Test Your Webhook

### Test Order Placement
1. Go to your live site: https://sri-kanya-restaurant-menu.onrender.com/menu
2. Add items to cart
3. Complete checkout
4. Check your webhook.site page to see the order data!

### Expected Webhook Data
You'll see order data like this in your webhook:
```json
{
  "orderId": "SRK-1706341234567",
  "restaurantName": "Sri Kanya Family Restaurants",
  "tableNumber": 5,
  "customer": {
    "name": "John Doe",
    "phone": "+91-9876543210"
  },
  "items": [
    {
      "name": "Chicken Dum Biryani (Full)",
      "quantity": 2,
      "price": 220
    }
  ],
  "totalAmount": 440
}
```

## 🎯 What This Gives You

✅ **Real-time order notifications** - See orders as they come in
✅ **Order data logging** - All order details are captured
✅ **No setup cost** - Completely free
✅ **Immediate testing** - Works right away
✅ **Production ready** - Can handle real orders

## 🔄 Next Steps

Once you have this working, you can:
1. **Set up N8N** for Excel export
2. **Configure kitchen printer** integration
3. **Add custom domain** to your restaurant
4. **Generate QR codes** for tables

## 🚀 Your Restaurant is Ready!

With this setup, your restaurant will have:
- **Live order processing** via webhooks
- **Real-time order notifications**
- **Complete order data capture**
- **Professional order management**

Just follow the steps above and your webhook system will be live in minutes! 🍽️✨ 