# Cloudinary Setup Guide for Sri Kanya Restaurant

## 🎯 **Why Cloudinary?**
- **25GB free storage** (enough for all your images)
- **Automatic optimization** (reduces file sizes)
- **CDN delivery** (fast loading worldwide)
- **Easy upload** via dashboard or API

## 📋 **Step-by-Step Setup**

### **Step 1: Create Cloudinary Account**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Create your account
4. Get your **Cloud Name**, **API Key**, and **API Secret**

### **Step 2: Upload Your Images**
1. **Via Dashboard**:
   - Log into Cloudinary dashboard
   - Click "Upload" button
   - Drag & drop all your food images
   - Images will be automatically optimized

2. **Via API** (if you have many images):
   ```bash
   # Install Cloudinary CLI
   npm install -g cloudinary-cli
   
   # Upload all images from your folder
   cloudinary upload public/menu-images/*.jpg
   ```

### **Step 3: Get Image URLs**
After upload, each image gets a URL like:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/food/chicken_biryani.jpg
```

### **Step 4: Update Your Code**
Replace the image mappings with your actual Cloudinary URLs:

```typescript
// lib/imageMappings.ts
export const foodImageMappings: { [key: string]: string } = {
  'chicken_dum_biryani_half': 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_400,h_300,c_fill,f_auto,q_auto/v1234567890/food/chicken_dum_biryani_half.jpg',
  'chicken_dum_biryani_full': 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_400,h_300,c_fill,f_auto,q_auto/v1234567890/food/chicken_dum_biryani_full.jpg',
  // Add all your images here
};
```

## 🔧 **URL Parameters Explained**
- `w_400,h_300`: Resize to 400x300px
- `c_fill`: Crop to fill dimensions
- `f_auto`: Auto-format (WebP for modern browsers)
- `q_auto`: Auto-quality optimization

## 📊 **Memory Benefits**
- **Before**: 80MB+ in your git repo
- **After**: 0MB in git, optimized delivery
- **Performance**: 50-80% smaller file sizes
- **Speed**: Global CDN delivery

## 🚀 **Alternative: GitHub + Raw URLs**
If you prefer to keep images in your repo:

1. **Create a separate repo** for images only
2. **Use raw GitHub URLs**:
   ```typescript
   'chicken_biryani': 'https://raw.githubusercontent.com/username/food-images/main/chicken_biryani.jpg'
   ```

## 💡 **Quick Start**
1. **Sign up for Cloudinary** (free)
2. **Upload your images** via dashboard
3. **Copy the URLs** for each image
4. **Update `lib/imageMappings.ts`** with your URLs
5. **Commit and deploy**

Would you like me to help you:
1. **Set up Cloudinary account**?
2. **Create a script** to upload all your images?
3. **Update the mappings** with your actual URLs?

Just let me know which option you prefer! 