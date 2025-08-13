# 🚀 MongoDB Atlas Vector Search Setup Guide

This guide will help you set up MongoDB Atlas Vector Search for your restaurant menu application using your $500 credits.

## 📋 Prerequisites

- MongoDB Atlas account with $500 credits
- OpenAI API key (for generating embeddings)
- Node.js 18+ installed
- Access to your restaurant application codebase

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create Atlas Cluster

1. **Login to MongoDB Atlas**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Sign in with your account

2. **Create New Project**
   - Click "New Project"
   - Name it "Restaurant-Menu-Vector"
   - Click "Create Project"

3. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0) for development
   - Select your preferred cloud provider and region
   - Click "Create"

### 1.2 Configure Database Access

1. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Username: `restaurant-admin`
   - Password: Generate a strong password
   - Role: "Atlas admin"
   - Click "Add User"

2. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses
   - Click "Confirm"

### 1.3 Get Connection String

1. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## 🔍 Step 2: Enable Vector Search

### 2.1 Upgrade to M10+ Cluster (Required for Vector Search)

**⚠️ Important**: Vector Search requires M10+ cluster (minimum $57/month)

1. **Upgrade Cluster**
   - Go to "Database" in the left sidebar
   - Click on your cluster name
   - Click "Edit Configuration"
   - Change tier to "M10" or higher
   - Click "Confirm"

2. **Wait for Upgrade**
   - The upgrade process takes 5-10 minutes
   - You'll receive an email when complete

### 2.2 Create Vector Search Index

1. **Access Vector Search**
   - Go to "Search" in the left sidebar
   - Click "Create Search Index"

2. **Choose Index Type**
   - Select "JSON Editor"
   - Click "Next"

3. **Configure Index**
   ```json
   {
     "mappings": {
       "dynamic": true,
       "fields": {
         "embeddings.searchVector": {
           "dimensions": 1536,
           "similarity": "cosine",
           "type": "knnVector"
         }
       }
     }
   }
   ```

4. **Set Index Name**
   - Name: `vector_search_index`
   - Click "Create"

## 🔑 Step 3: OpenAI API Setup

### 3.1 Get OpenAI API Key

1. **Create OpenAI Account**
   - Go to [OpenAI Platform](https://platform.openai.com)
   - Sign up or sign in

2. **Generate API Key**
   - Go to "API Keys" in the left sidebar
   - Click "Create new secret key"
   - Name: "Restaurant-Menu-Vector"
   - Copy the key (you won't see it again)

### 3.2 Configure Environment Variables

1. **Create .env.local file**
   ```bash
   cp env.example .env.local
   ```

2. **Add your credentials**
   ```env
   MONGODB_URI=mongodb+srv://restaurant-admin:your_password@cluster.mongodb.net/restaurant-menu
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## 📦 Step 4: Install Dependencies

### 4.1 Install Required Packages

```bash
npm install openai
npm install --save-dev ts-node
```

### 4.2 Verify Installation

```bash
npm list openai
npm list ts-node
```

## 🚀 Step 5: Run Migration Script

### 5.1 Execute Migration

```bash
npm run migrate:vector
```

### 5.2 Monitor Progress

The script will:
- Connect to your MongoDB Atlas cluster
- Generate embeddings for all menu items
- Create optimized indexes
- Update existing items with vector data

**Expected Output:**
```
🚀 Starting vector search migration...
📊 Found 150 existing menu items
🔄 Processing: Chicken Dum Biryani (Half)
✅ Generated embeddings for: Chicken Dum Biryani (Half)
...
🎉 Migration completed!
✅ Successfully updated: 150 items
🔍 Vector search indexes created successfully!
```

## 🧪 Step 6: Test Vector Search

### 6.1 Test Search API

```bash
# Test basic search
curl "http://localhost:3000/api/menu/search?q=spicy%20chicken&limit=5"

# Test advanced search
curl -X POST "http://localhost:3000/api/menu/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "creamy vegetarian curry",
    "filters": {
      "category": "curries",
      "dietary": "vegetarian"
    },
    "searchType": "vector",
    "limit": 10
  }'
```

### 6.2 Expected Response

```json
{
  "success": true,
  "results": [
    {
      "itemId": "paneer_butter_masala",
      "itemName": "Paneer Butter Masala",
      "searchScore": 0.892,
      "category": "curries",
      "price": 180,
      "isVeg": true,
      "reason": "Matched: Paneer Butter Masala"
    }
  ],
  "total": 1,
  "searchMethod": "vector",
  "query": "creamy vegetarian curry"
}
```

## 📊 Step 7: Monitor Performance

### 7.1 Atlas Performance Metrics

1. **Monitor Cluster Performance**
   - Go to "Metrics" in Atlas
   - Check CPU, Memory, and Storage usage
   - Monitor query performance

2. **Vector Search Analytics**
   - Go to "Search" → "Analytics"
   - Monitor search query performance
   - Check index usage statistics

### 7.2 Application Performance

1. **Search Response Times**
   - Vector search: 50-200ms
   - Text search: 100-500ms
   - Hybrid search: 75-300ms

2. **Throughput**
   - Concurrent searches: 100-1000/second
   - Embedding generation: 10-50/second

## 💰 Step 8: Cost Optimization

### 8.1 MongoDB Atlas Costs

- **M10 Cluster**: $57/month
- **Storage**: $0.25/GB/month
- **Data Transfer**: $0.10/GB
- **Estimated Monthly Cost**: $60-80

### 8.2 OpenAI API Costs

- **Embeddings**: $0.0001 per 1K tokens
- **1000 menu items**: ~$2-5/month
- **Search queries**: ~$1-3/month
- **Total OpenAI Cost**: $3-8/month

### 8.3 Total Estimated Cost

- **MongoDB Atlas**: $60-80/month
- **OpenAI API**: $3-8/month
- **Total**: $63-88/month
- **Your Credits**: $500 (covers ~6-8 months)

## 🔧 Step 9: Production Deployment

### 9.1 Environment Configuration

```env
# Production Environment
NODE_ENV=production
MONGODB_URI=mongodb+srv://restaurant-admin:password@cluster.mongodb.net/restaurant-menu
OPENAI_API_KEY=your_production_openai_key
VECTOR_SEARCH_ENABLED=true
```

### 9.2 Performance Tuning

1. **Connection Pooling**
   ```typescript
   // lib/mongodb.ts
   maxPoolSize: 50,
   minPoolSize: 10,
   maxIdleTimeMS: 30000
   ```

2. **Caching Strategy**
   - Redis for search results
   - CDN for static assets
   - Browser caching for embeddings

### 9.3 Monitoring & Alerts

1. **Set up Alerts**
   - High CPU usage (>80%)
   - High memory usage (>90%)
   - Slow query response (>1s)
   - API rate limit warnings

2. **Logging**
   - Search query logs
   - Performance metrics
   - Error tracking

## 🚨 Troubleshooting

### Common Issues

1. **Vector Search Not Working**
   - Verify cluster is M10+
   - Check index creation
   - Validate embeddings format

2. **Slow Search Performance**
   - Check index usage
   - Monitor cluster resources
   - Optimize query filters

3. **OpenAI API Errors**
   - Verify API key
   - Check rate limits
   - Monitor API usage

### Support Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vector Search Guide](https://docs.atlas.mongodb.com/atlas-search/vector-search/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🎯 Next Steps

1. **Implement Caching Layer**
   - Redis for search results
   - Browser caching for embeddings

2. **Add Analytics Dashboard**
   - Search performance metrics
   - Popular search queries
   - User behavior insights

3. **Advanced Features**
   - Semantic similarity search
   - Personalized recommendations
   - Multi-language search

4. **Performance Optimization**
   - Query optimization
   - Index tuning
   - Connection pooling

## 📞 Support

If you encounter any issues:

1. Check MongoDB Atlas logs
2. Verify environment variables
3. Test with simple queries first
4. Monitor API rate limits
5. Check cluster resource usage

---

**🎉 Congratulations!** You now have a production-ready vector search system for your restaurant menu application.
