# 🚀 Render Deployment Guide for Vector Search

## **🌐 Production vs Development Environment**

### **Local Development (.env.local)**
```bash
# Use Gemini for free development
GEMINI_API_KEY=AIzaSyYour_API_Key_Here
MONGODB_URI=mongodb://localhost:27017/restaurant
```

### **Render Production (Environment Variables)**
```bash
# Use Groq for production (recommended)
GROQ_API_KEY=gsk_your_groq_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

## **🔧 Render Environment Variables Setup**

### **Step 1: Access Render Dashboard**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your service
3. Navigate to **Environment** tab

### **Step 2: Add Required Environment Variables**

#### **🔑 Vector Search Provider (Choose ONE)**
```bash
# Option 1: Groq (Recommended for Production)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Option 2: OpenAI (Most Reliable)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Option 3: OpenRouter (Multiple Models)
OPENROUTER_API_KEY=sk-or-your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Option 4: Gemini (Free - NOT recommended for production)
GEMINI_API_KEY=AIzaSyYour_gemini_api_key_here
```

#### **🗄️ Database Configuration**
```bash
# MongoDB Atlas Connection (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Optional: MongoDB Configuration
MONGODB_DB_NAME=restaurant_menu
MONGODB_MAX_POOL_SIZE=10
```

#### **🔐 Security & Authentication**
```bash
# JWT Secret (Required for admin)
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_chars

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_in_production
```

#### **☁️ Cloudinary (Image Uploads)**
```bash
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### **📧 Email Configuration (Optional)**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Restaurant <your-email@gmail.com>
```

#### **🌍 Application Configuration**
```bash
# Environment
NODE_ENV=production

# WebSocket (if using)
NEXT_PUBLIC_WEBSOCKET_URL=https://your-app.onrender.com

# Vector Search Configuration
VECTOR_SEARCH_ENABLED=true
VECTOR_SEARCH_MODEL=text-embedding-3-small
VECTOR_SEARCH_DIMENSIONS=1536
```

## **📋 Complete Render Environment Variables List**

### **Copy & Paste This Template:**
```bash
# Vector Search Provider (Choose ONE)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Security
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_chars

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_in_production

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Environment
NODE_ENV=production

# Vector Search
VECTOR_SEARCH_ENABLED=true
VECTOR_SEARCH_MODEL=text-embedding-3-small
VECTOR_SEARCH_DIMENSIONS=1536
```

## **🚀 Deployment Steps**

### **Step 1: Prepare Your Repository**
```bash
# Ensure all changes are committed
git add .
git commit -m "Add vector search system for production"
git push origin main
```

### **Step 2: Configure Render Service**
1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Environment**: `Node`
4. **Node Version**: `18.x` or `20.x`

### **Step 3: Set Environment Variables**
1. Go to **Environment** tab
2. Add each variable from the template above
3. **Important**: Don't include quotes around values
4. Click **Save Changes**

### **Step 4: Deploy**
1. Click **Manual Deploy**
2. Select **Deploy latest commit**
3. Wait for build to complete
4. Check deployment logs for any errors

## **🔍 Environment Variable Validation**

### **Automatic Validation**
The system automatically validates environment variables on startup:

```bash
# ✅ Valid API Key Formats
GROQ_API_KEY=gsk_1234567890abcdef...
OPENAI_API_KEY=sk-1234567890abcdef...
GEMINI_API_KEY=AIzaSy1234567890abcdef...
OPENROUTER_API_KEY=sk-or-1234567890abcdef...

# ❌ Invalid API Key Formats
GROQ_API_KEY=invalid_key
OPENAI_API_KEY=wrong_format
```

### **Validation Errors**
If validation fails, you'll see:
```bash
❌ Environment validation errors:
- MONGODB_URI is required
- At least one vector service provider API key is required

⚠️ Environment validation warnings:
- GROQ_API_KEY format appears invalid
- Gemini free tier is not recommended for production
```

## **📊 Production Readiness Check**

### **Run Health Check**
```bash
# The system automatically checks production readiness
npm start

# Look for these messages:
✅ Environment validation passed
✅ MongoDB connection successful
✅ Vector service provider configured
✅ Production ready
```

### **Production Requirements Checklist**
- [ ] `MONGODB_URI` configured
- [ ] Vector service API key configured
- [ ] `JWT_SECRET` set (recommended)
- [ ] `NODE_ENV=production`
- [ ] MongoDB Atlas M10+ cluster
- [ ] Vector search indexes created

## **💰 Cost Optimization for Production**

### **With Your $500 MongoDB Credits:**

| Service | Monthly Cost | Credits Used | Months Covered |
|----------|--------------|--------------|----------------|
| **MongoDB Atlas M10** | $57 | $456 | **8 months** |
| **Groq Vector Search** | $5 | $40 | **8 months** |
| **Total** | $62 | **$496** | **8 months** |

### **Recommended Production Setup:**
```bash
# Use your MongoDB credits for infrastructure
MONGODB_URI=mongodb+srv://... # M10+ cluster

# Use Groq for vector search (best value)
GROQ_API_KEY=gsk_... # $5/month

# Result: 8+ months of production service
```

## **🚨 Troubleshooting Render Deployment**

### **Common Issues & Solutions**

#### **1. Build Failures**
```bash
# Error: Cannot find module 'groq-sdk'
# Solution: Ensure package.json has all dependencies
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push origin main
```

#### **2. Environment Variable Issues**
```bash
# Error: Environment validation failed
# Solution: Check all required variables are set in Render dashboard
# Don't include quotes around values
GROQ_API_KEY=gsk_1234567890abcdef  # ✅ Correct
GROQ_API_KEY="gsk_1234567890abcdef" # ❌ Wrong
```

#### **3. MongoDB Connection Issues**
```bash
# Error: MongoDB connection failed
# Solution: 
# 1. Verify MONGODB_URI format
# 2. Check MongoDB Atlas cluster is running
# 3. Ensure IP whitelist includes Render IPs
# 4. Verify username/password
```

#### **4. Vector Search Not Working**
```bash
# Error: Vector search not available
# Solution:
# 1. Check API key format
# 2. Verify API key is valid
# 3. Check provider service status
# 4. Ensure MongoDB vector indexes exist
```

### **Debug Commands**
```bash
# Check environment variables
echo $GROQ_API_KEY
echo $MONGODB_URI

# Check Node environment
echo $NODE_ENV

# Check if running on Render
echo $RENDER
```

## **📈 Monitoring & Logs**

### **Render Logs**
1. Go to your service in Render dashboard
2. Click **Logs** tab
3. Look for structured JSON logs:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "service": "VectorService",
  "message": "Groq vector service initialized",
  "provider": "groq"
}
```

### **Health Check Endpoint**
```bash
# Add this to your API routes for monitoring
GET /api/health
Response: {
  "status": "healthy",
  "vectorService": {
    "status": "healthy",
    "provider": "groq"
  },
  "database": "connected"
}
```

## **🔄 Update Process**

### **Updating Environment Variables**
1. Go to Render dashboard
2. Edit environment variables
3. Click **Save Changes**
4. **Manual Deploy** → **Deploy latest commit**

### **Updating Code**
```bash
# Make changes locally
git add .
git commit -m "Update description"
git push origin main

# Render automatically deploys from main branch
# Or manually deploy from dashboard
```

## **🎯 Production Checklist**

### **Before Deployment**
- [ ] All environment variables set in Render
- [ ] MongoDB Atlas M10+ cluster running
- [ ] Vector search indexes created
- [ ] API keys tested locally
- [ ] Code committed and pushed

### **After Deployment**
- [ ] Build successful
- [ ] Service running
- [ ] Environment validation passed
- [ ] Vector search working
- [ ] Health check endpoint responding
- [ ] Logs showing no errors

### **Monitoring**
- [ ] Check Render logs regularly
- [ ] Monitor MongoDB Atlas usage
- [ ] Track vector search API costs
- [ ] Set up alerts for errors

## **📞 Support Resources**

### **Render Support**
- [Render Documentation](https://render.com/docs)
- [Render Status](https://status.render.com/)
- [Render Community](https://community.render.com/)

### **Vector Search Providers**
- **Groq**: [Console](https://console.groq.com/) | [Status](https://status.groq.com/)
- **OpenAI**: [Platform](https://platform.openai.com/) | [Status](https://status.openai.com/)
- **Gemini**: [AI Studio](https://makersuite.google.com/) | [Status](https://status.cloud.google.com/)

### **MongoDB Atlas**
- [Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vector Search Guide](https://docs.atlas.mongodb.com/atlas-vector-search/)

---

**🎯 Ready to deploy to production?**
Follow this guide step by step and you'll have a production-ready vector search system running on Render!
