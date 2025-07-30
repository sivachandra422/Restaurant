# Render Deployment Guide for Sri Kanya Restaurant Menu

## 🚀 Quick Deploy to Render

### Step 1: Connect Your GitHub Repository

1. **Go to Render Dashboard**:
   - Visit https://dashboard.render.com
   - Sign up/Login with your GitHub account

2. **Create New Web Service**:
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub account if not already connected

3. **Select Your Repository**:
   - Choose `sivachandra422/Restaurant` from the list
   - Click "Connect"

### Step 2: Configure Your Web Service

**Service Configuration**:
```
Name: sri-kanya-restaurant-menu
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

**Environment Variables** (Add these in Render dashboard):
```env
NODE_ENV=production
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/restaurant-orders
KITCHEN_WEBHOOK_URL=https://your-kitchen-system.com/webhook/orders
POS_WEBHOOK_URL=https://your-pos-system.com/api/orders
ANALYTICS_WEBHOOK_URL=https://your-analytics-platform.com/webhook/orders
ORDER_API_KEY=your-secure-api-key-here
```

### Step 3: Advanced Settings

**Auto-Deploy**: Enable (recommended)
**Branch**: `main`
**Root Directory**: Leave empty (default)

## 🔧 Render Configuration Files

### Option 1: Use Built-in Render Support

Render automatically detects Next.js applications and configures them correctly.

### Option 2: Custom Build Configuration

If you need custom configuration, create a `render.yaml` file:

```yaml
services:
  - type: web
    name: sri-kanya-restaurant-menu
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: N8N_WEBHOOK_URL
        sync: false
      - key: KITCHEN_WEBHOOK_URL
        sync: false
      - key: POS_WEBHOOK_URL
        sync: false
      - key: ANALYTICS_WEBHOOK_URL
        sync: false
      - key: ORDER_API_KEY
        sync: false
```

## 📋 Pre-Deployment Checklist

### ✅ Repository Ready
- [x] Code pushed to GitHub
- [x] All images included
- [x] Webhook integration working
- [x] Environment variables documented

### ✅ Render Account Setup
- [ ] GitHub account connected to Render
- [ ] Render account created
- [ ] Payment method added (if required)

### ✅ Environment Variables
- [ ] N8N webhook URL configured
- [ ] Kitchen webhook URL configured
- [ ] POS webhook URL configured
- [ ] Analytics webhook URL configured
- [ ] API key generated

## 🎯 Deployment Steps

### 1. **Create Render Account**
- Go to https://render.com
- Sign up with GitHub
- Verify your email

### 2. **Create Web Service**
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select `sivachandra422/Restaurant`

### 3. **Configure Service**
```
Name: sri-kanya-restaurant-menu
Environment: Node
Region: Choose closest to your customers
Branch: main
Root Directory: (leave empty)
```

### 4. **Set Environment Variables**
In the Render dashboard, add these environment variables:

```env
NODE_ENV=production
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/restaurant-orders
KITCHEN_WEBHOOK_URL=https://your-kitchen-system.com/webhook/orders
POS_WEBHOOK_URL=https://your-pos-system.com/api/orders
ANALYTICS_WEBHOOK_URL=https://your-analytics-platform.com/webhook/orders
ORDER_API_KEY=your-secure-api-key-here
```

### 5. **Deploy**
- Click "Create Web Service"
- Wait for build to complete (5-10 minutes)
- Your app will be live at: `https://your-app-name.onrender.com`

## 🔗 Post-Deployment Setup

### 1. **Update Webhook URLs**
After deployment, update your webhook URLs to point to your production domain:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/restaurant-orders
KITCHEN_WEBHOOK_URL=https://your-kitchen-system.com/webhook/orders
POS_WEBHOOK_URL=https://your-pos-system.com/api/orders
ANALYTICS_WEBHOOK_URL=https://your-analytics-platform.com/webhook/orders
```

### 2. **Test Your Deployment**
- Visit your deployed URL
- Test the menu functionality
- Test webhook integration
- Test QR code navigation

### 3. **Custom Domain (Optional)**
- Go to your Render service settings
- Click "Custom Domains"
- Add your domain (e.g., `menu.srikanya.com`)
- Configure DNS settings

## 🧪 Testing Your Deployment

### Test Webhook Integration
```bash
# Test your deployed webhook
curl -X POST https://your-app-name.onrender.com/api/orders \
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

## 🔄 Continuous Deployment

### Automatic Deployments
- Render automatically deploys when you push to `main` branch
- Build logs are available in the Render dashboard
- Failed builds are reported via email

### Manual Deployments
- Go to your service dashboard
- Click "Manual Deploy"
- Select branch to deploy

## 📊 Monitoring & Analytics

### Render Dashboard
- **Build Logs**: View deployment progress
- **Logs**: Monitor application logs
- **Metrics**: CPU, memory usage
- **Uptime**: Service availability

### Custom Monitoring
- Set up webhook monitoring
- Configure error alerts
- Monitor order processing

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Render dashboard
   - Verify all dependencies in `package.json`
   - Ensure Node.js version compatibility

2. **Environment Variables**:
   - Verify all required env vars are set
   - Check for typos in variable names
   - Ensure webhook URLs are accessible

3. **Image Loading Issues**:
   - Verify images are in `public/menu-images/`
   - Check image file permissions
   - Ensure correct file paths in `imageMappings.ts`

4. **Webhook Failures**:
   - Test webhook endpoints independently
   - Check network connectivity
   - Verify webhook URL format

### Support Resources
- Render Documentation: https://render.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- GitHub Issues: Check your repository issues

## 🎉 Success Checklist

After deployment, verify:

- [ ] ✅ Application loads without errors
- [ ] ✅ Menu images display correctly
- [ ] ✅ Cart functionality works
- [ ] ✅ Checkout process completes
- [ ] ✅ Webhook integration functions
- [ ] ✅ QR code navigation works
- [ ] ✅ Mobile responsiveness
- [ ] ✅ Order processing successful

## 🚀 Your Restaurant is Live!

Once deployed, your restaurant menu will be available at:
`https://your-app-name.onrender.com`

### QR Code URLs
Generate QR codes for each table:
- Table 1: `https://your-app-name.onrender.com/menu?table=1`
- Table 2: `https://your-app-name.onrender.com/menu?table=2`
- Table 3: `https://your-app-name.onrender.com/menu?table=3`
- etc.

Your Sri Kanya Family Restaurants digital menu is now live and ready for customers! 🍽️✨ 