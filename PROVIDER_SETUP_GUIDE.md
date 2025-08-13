# 🚀 Vector Search Provider Setup Guide

## **🎯 Provider Options Overview**

| Provider | Speed | Cost | Best For | Setup Difficulty |
|----------|-------|------|----------|------------------|
| **Groq** | ⚡ 10-100x faster | 💰 $0.10/1M tokens | Production, high-speed | 🟢 Easy |
| **Gemini** | 🚀 Fast | 🆓 Free tier | Development, testing | 🟢 Easy |
| **OpenAI** | 🐌 Standard | 💰 $0.02/1M tokens | Production, reliability | 🟢 Easy |
| **OpenRouter** | 📊 Varies | 💰 Competitive | Model flexibility | 🟡 Medium |

## **🔧 Groq Setup (Recommended)**

### **Why Groq?**
- **Fastest**: 10-100x faster than OpenAI
- **Cost-effective**: $0.10 per 1M tokens
- **Reliable**: Enterprise-grade infrastructure
- **Simple**: Easy API integration

### **Setup Steps**

1. **Get API Key**
   ```bash
   # Visit: https://console.groq.com/
   # Sign up and get your API key
   ```

2. **Set Environment Variable**
   ```bash
   # Add to .env.local
   GROQ_API_KEY=gsk_your_api_key_here
   ```

3. **Test Configuration**
   ```bash
   npm run test:multi-vector
   ```

### **Expected Output**
```
✅ Groq vector service initialized
🏆 Active Provider: groq
💡 Recommendation: Groq (Fastest & Most Cost-Effective)
```

## **🔧 Google Gemini Setup (Free Tier)**

### **Why Gemini?**
- **Free**: 15 requests/minute, 1500 requests/day
- **Fast**: Reliable performance
- **Google**: Enterprise-grade reliability
- **No Credit Card**: Required for setup

### **Setup Steps**

1. **Get API Key**
   ```bash
   # Visit: https://makersuite.google.com/app/apikey
   # Sign in with Google account
   # Create new API key
   ```

2. **Set Environment Variable**
   ```bash
   # Add to .env.local
   GEMINI_API_KEY=AIzaSyYour_API_Key_Here
   ```

3. **Test Configuration**
   ```bash
   npm run test:multi-vector
   ```

### **Free Tier Limits**
- **Rate Limit**: 15 requests per minute
- **Daily Limit**: 1,500 requests per day
- **Model**: Gemini 1.5 Flash
- **Perfect for**: Development, testing, small production

## **🔧 OpenAI Setup (Most Reliable)**

### **Why OpenAI?**
- **Reliable**: Industry standard
- **Consistent**: Stable API performance
- **Support**: Excellent documentation
- **Embeddings**: Native embedding API

### **Setup Steps**

1. **Get API Key**
   ```bash
   # Visit: https://platform.openai.com/api-keys
   # Sign up and get your API key
   ```

2. **Set Environment Variable**
   ```bash
   # Add to .env.local
   OPENAI_API_KEY=sk-your_api_key_here
   ```

3. **Test Configuration**
   ```bash
   npm run test:multi-vector
   ```

## **🔧 OpenRouter Setup (Multiple Models)**

### **Why OpenRouter?**
- **Flexibility**: Access to 100+ models
- **Cost Optimization**: Choose best model for your needs
- **Competitive Pricing**: Often cheaper than direct providers
- **Model Variety**: Claude, Llama, Mistral, etc.

### **Setup Steps**

1. **Get API Key**
   ```bash
   # Visit: https://openrouter.ai/keys
   # Sign up and get your API key
   ```

2. **Set Environment Variables**
   ```bash
   # Add to .env.local
   OPENROUTER_API_KEY=sk-or-your_api_key_here
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   ```

3. **Test Configuration**
   ```bash
   npm run test:multi-vector
   ```

## **💰 Cost Comparison Calculator**

### **Monthly Cost Estimation (1000 menu items)**

| Provider | Embedding Cost | Search Cost | Total Monthly |
|----------|----------------|-------------|---------------|
| **Groq** | $2-5 | $1-3 | **$3-8** |
| **Gemini** | 🆓 Free | 🆓 Free | **$0** |
| **OpenAI** | $2-5 | $1-3 | **$3-8** |
| **OpenRouter** | $1-4 | $1-2 | **$2-6** |

### **With Your $500 MongoDB Credits**
- **MongoDB Atlas M10**: $57/month
- **Vector Search**: $0-8/month (depending on provider)
- **Total**: $57-65/month
- **Coverage**: **7-8 months** of production service

## **🚀 Quick Start Commands**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Set Environment Variables**
```bash
cp env.example .env.local
# Edit .env.local with your chosen provider
```

### **3. Test Configuration**
```bash
# Test all providers
npm run test:multi-vector

# Test specific provider
npm run test:vector
```

### **4. Run Migration**
```bash
npm run migrate:vector
```

## **🔍 Provider-Specific Features**

### **Groq Features**
- ✅ **Ultra-fast**: 10-100x speed improvement
- ✅ **Cost-effective**: Best price/performance ratio
- ✅ **Enterprise**: Production-ready infrastructure
- ⚠️ **No native embeddings**: Uses chat completion workaround

### **Gemini Features**
- ✅ **Free tier**: No cost for development
- ✅ **Google reliability**: Enterprise-grade uptime
- ✅ **Fast**: Good performance
- ⚠️ **Rate limits**: 15 req/min, 1500 req/day

### **OpenAI Features**
- ✅ **Native embeddings**: Direct embedding API
- ✅ **Industry standard**: Most reliable
- ✅ **Good performance**: Consistent speed
- ⚠️ **Higher cost**: More expensive than alternatives

### **OpenRouter Features**
- ✅ **Model flexibility**: Choose from 100+ models
- ✅ **Cost optimization**: Often cheaper than direct
- ✅ **Multiple providers**: Access to various AI services
- ⚠️ **Complexity**: More configuration options

## **🎯 Recommendation Matrix**

### **For Development & Testing**
```
🏆 Gemini (Free tier)
   - No cost
   - Easy setup
   - Good performance
```

### **For Production (Budget-Conscious)**
```
🏆 Groq
   - Best price/performance
   - Ultra-fast
   - Reliable
```

### **For Production (Reliability-First)**
```
🏆 OpenAI
   - Industry standard
   - Native embeddings
   - Best support
```

### **For Advanced Users**
```
🏆 OpenRouter
   - Model flexibility
   - Cost optimization
   - Multiple providers
```

## **🚨 Troubleshooting**

### **Common Issues**

1. **"No vector service providers configured"**
   ```bash
   # Check your .env.local file
   cat .env.local | grep API_KEY
   ```

2. **"Rate limit exceeded" (Gemini)**
   ```bash
   # Wait for rate limit reset
   # Consider upgrading to paid plan
   ```

3. **"API key invalid"**
   ```bash
   # Verify API key format
   # Check provider dashboard
   ```

4. **"Service unavailable"**
   ```bash
   # Check provider status page
   # Verify network connectivity
   ```

### **Provider Status Pages**
- **Groq**: https://status.groq.com/
- **Gemini**: https://status.cloud.google.com/
- **OpenAI**: https://status.openai.com/
- **OpenRouter**: https://status.openrouter.ai/

## **📞 Support Resources**

### **Provider Documentation**
- **Groq**: https://console.groq.com/docs
- **Gemini**: https://ai.google.dev/docs
- **OpenAI**: https://platform.openai.com/docs
- **OpenRouter**: https://openrouter.ai/docs

### **Community Support**
- **Discord**: Join AI developer communities
- **GitHub**: Check provider SDK repositories
- **Stack Overflow**: Search for provider-specific issues

---

**🎯 Ready to choose your vector search provider?**
Follow the setup guide for your preferred option and start testing!
