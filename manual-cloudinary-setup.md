# Manual Cloudinary Setup for Your Collection

## 🎯 **Your Cloudinary Collection**
Collection URL: https://collection.cloudinary.com/dklpiguqs/a7929dc14ac74d52a008e57053c387a6

## 📋 **Step-by-Step Manual Setup**

### **Step 1: Get Your Cloudinary Credentials**
1. Go to [cloudinary.com](https://cloudinary.com) and log in
2. Go to Dashboard → Settings → Access Keys
3. Copy your:
   - **Cloud Name**: `dklpiguqs` (from your URL)
   - **API Key**: Your API key
   - **API Secret**: Your API secret

### **Step 2: Install Cloudinary Package**
```bash
npm install cloudinary
```

### **Step 3: Update the Script**
Edit `get-cloudinary-urls.js` and replace:
```javascript
cloudinary.config({
  cloud_name: 'dklpiguqs',
  api_key: 'YOUR_API_KEY', // ← Replace with your actual API key
  api_secret: 'YOUR_API_SECRET' // ← Replace with your actual API secret
});
```

### **Step 4: Run the Script**
```bash
node get-cloudinary-urls.js
```

This will:
- ✅ Fetch all your images from Cloudinary
- ✅ Generate optimized URLs
- ✅ Create `lib/imageMappings-updated.ts` with your actual URLs

### **Step 5: Update Your Code**
Replace `lib/imageMappings.ts` with the generated content from `lib/imageMappings-updated.ts`

## 🔧 **Manual URL Format**
If you prefer to manually copy URLs from your Cloudinary dashboard:

**Original URL from Cloudinary:**
```
https://res.cloudinary.com/dklpiguqs/image/upload/v1234567890/chicken_biryani.jpg
```

**Optimized URL for your app:**
```
https://res.cloudinary.com/dklpiguqs/image/upload/w_400,h_300,c_fill,f_auto,q_auto/v1234567890/chicken_biryani.jpg
```

## 📊 **URL Parameters Explained**
- `w_400,h_300`: Resize to 400x300px
- `c_fill`: Crop to fill dimensions
- `f_auto`: Auto-format (WebP for modern browsers)
- `q_auto`: Auto-quality optimization

## 🚀 **Quick Alternative: Manual Mapping**
If you want to manually map your images, here's the format:

```typescript
// lib/imageMappings.ts
export const foodImageMappings: { [key: string]: string } = {
  'chicken_dum_biryani_half': 'https://res.cloudinary.com/dklpiguqs/image/upload/w_400,h_300,c_fill,f_auto,q_auto/v1234567890/chicken_dum_biryani_half.jpg',
  'chicken_dum_biryani_full': 'https://res.cloudinary.com/dklpiguqs/image/upload/w_400,h_300,c_fill,f_auto,q_auto/v1234567890/chicken_dum_biryani_full.jpg',
  // Add all your images here
};
```

## 💡 **Benefits of This Setup**
- ✅ **No memory issues** - Images served from CDN
- ✅ **Optimized delivery** - 50-80% smaller file sizes
- ✅ **Fast loading** - Global CDN network
- ✅ **Automatic optimization** - WebP format for modern browsers

## 🎯 **Next Steps**
1. **Get your Cloudinary credentials**
2. **Run the script** to generate URLs
3. **Update your image mappings**
4. **Commit and deploy** - No more memory issues!

Would you like me to help you:
1. **Set up the script** with your credentials?
2. **Generate the URLs** automatically?
3. **Update the mappings** manually?

Just let me know which approach you prefer! 