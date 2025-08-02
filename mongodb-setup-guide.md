# MongoDB Setup Guide for Real-Time Menu Updates

## 🎯 **Why MongoDB is Needed**

Your app currently shows: `"MONGODB_URI not found. Running without database connection."`

This means the real-time synchronization between admin dashboard and customer menu is not working properly. Here's how to fix it:

## 🔧 **Step 1: Create MongoDB Atlas Account**

1. **Go to MongoDB Atlas**: https://www.mongodb.com/atlas
2. **Sign up for free account** (no credit card required)
3. **Create a new cluster** (choose the free tier)

## 🔧 **Step 2: Get Your Connection String**

1. **In Atlas Dashboard**:
   - Click on your cluster
   - Click "Connect" button
   - Choose "Connect your application"
   - Select "Node.js" as driver
   - Copy the connection string

2. **Your connection string will look like**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
   ```

## 🔧 **Step 3: Set Environment Variable**

### **For Local Development:**
Create a `.env.local` file in your project root:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/srikanya-restaurant?retryWrites=true&w=majority

# Admin Password
ADMIN_PASSWORD=srikanya2024

# Optional: N8N Webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/sri-kanya-order
```

### **For Production (Render.com):**
1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Find your service**: `sri-kanya-restaurant-menu`
3. **Click on your service**
4. **Go to "Environment" tab**
5. **Add Environment Variable**:
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string

## 🔧 **Step 4: Initialize Database**

The app will automatically create the database and tables when it first connects. The API routes will:

1. **Check if database exists**
2. **Create tables if needed**
3. **Populate with menu items from static data**
4. **Enable real-time updates**

## 🔧 **Step 5: Test the Connection**

After setting up the environment variable:

1. **Restart your service** on Render
2. **Check the logs** - you should see:
   ```
   MongoDB connected successfully
   ```
3. **Test admin dashboard** - disable/enable items
4. **Test customer menu** - changes should appear in real-time

## 🔧 **How the Connection Works**

### **Connection Flow:**
```
App → lib/mongodb.ts → MongoDB Atlas → Database
```

### **API Routes:**
- `GET /api/menu` - Fetch all menu items
- `PUT /api/menu/[id]` - Update specific item
- `POST /api/menu` - Create new item
- `DELETE /api/menu/[id]` - Delete item

### **Real-Time Updates:**
1. **Admin makes change** → API call to MongoDB
2. **Database updated** → All clients poll for changes
3. **Changes appear** → Within 5 seconds on all devices

## 🔧 **Database Schema**

The app uses this MongoDB collection:

```javascript
// MenuItem Schema
{
  id: String,           // Unique item ID
  name: String,         // Item name
  description: String,  // Item description
  price: Number,        // Item price
  category: String,     // Item category
  isVeg: Boolean,       // Vegetarian flag
  isSignature: Boolean, // Signature dish flag
  isSpecial: Boolean,   // Special dish flag
  image: String,        // Image URL
  isDisabled: Boolean,  // Visibility flag
  popularity: Number,   // Popularity score
  trending: Boolean,    // Trending flag
  createdAt: Date,      // Creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

## 🔧 **Troubleshooting**

### **If you see "MONGODB_URI not found":**
1. ✅ Check if environment variable is set
2. ✅ Restart your service after setting variable
3. ✅ Check connection string format

### **If connection fails:**
1. ✅ Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
2. ✅ Check username/password in connection string
3. ✅ Check cluster name in connection string

### **If real-time updates don't work:**
1. ✅ Check if database has data
2. ✅ Check API routes are working
3. ✅ Check browser console for errors

## 🚀 **Benefits After Setup**

- ✅ **True real-time updates** across all devices
- ✅ **Persistent storage** - changes survive restarts
- ✅ **Cross-browser sync** - works on different devices
- ✅ **Admin dashboard** - fully functional with database
- ✅ **Customer menu** - updates in real-time
- ✅ **Scalable** - can handle multiple restaurants

## 📞 **Need Help?**

If you need help setting up MongoDB Atlas or have any issues:

1. **Check the logs** in Render dashboard
2. **Test the API** directly: `/api/menu`
3. **Verify environment variables** are set correctly
4. **Restart the service** after making changes

The app will work without MongoDB (using static data), but real-time features won't work properly. Setting up MongoDB enables the full real-time experience! 🚀 