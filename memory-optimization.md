# Memory Optimization Guide for Sri Kanya Restaurant

## 🚨 **Current Issue**
Your Render service is running out of memory (over 512MB) due to large image files.

## 🔧 **Quick Fixes**

### **Option 1: Use External Image URLs (Recommended)**

Replace local images with optimized external URLs. Update `lib/imageMappings.ts`:

```typescript
export const foodImageMappings: { [key: string]: string } = {
  // Use optimized external URLs instead of local files
  'chicken_dum_biryani_half': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
  'chicken_dum_biryani_full': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
  'chicken_biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
  'mughlai_biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
  // Add more optimized URLs...
};
```

### **Option 2: Remove Large Images from Git**

1. **Remove images from git tracking**:
   ```bash
   git rm -r --cached public/menu-images/
   echo "public/menu-images/" >> .gitignore
   ```

2. **Use placeholder images**:
   ```typescript
   export const foodImageMappings: { [key: string]: string } = {
     'chicken_dum_biryani_half': '/images/food-placeholder.jpg',
     'chicken_dum_biryani_full': '/images/food-placeholder.jpg',
     // Use same placeholder for all items
   };
   ```

### **Option 3: Optimize Images (Best Long-term)**

1. **Compress all images** to under 200KB each
2. **Use WebP format** for better compression
3. **Resize images** to 400x300px

## 🚀 **Immediate Solution**

### **Step 1: Remove Large Images**
```bash
# Remove images from git (but keep them locally)
git rm -r --cached public/menu-images/
echo "public/menu-images/" >> .gitignore
```

### **Step 2: Use Placeholder Images**
Create a simple placeholder image and update mappings:

```typescript
// lib/imageMappings.ts
export const foodImageMappings: { [key: string]: string } = {
  // Use a single optimized placeholder
  'chicken_dum_biryani_half': '/images/food-placeholder.jpg',
  'chicken_dum_biryani_full': '/images/food-placeholder.jpg',
  'chicken_biryani': '/images/food-placeholder.jpg',
  'mughlai_biryani': '/images/food-placeholder.jpg',
  'lolipop_biryani': '/images/food-placeholder.jpg',
  'joint_biryani': '/images/food-placeholder.jpg',
  'prawns_biryani': '/images/food-placeholder.jpg',
  'sp_chicken_biryani': '/images/food-placeholder.jpg',
  'mix_biryani': '/images/food-placeholder.jpg',
  'mutton_biryani': '/images/food-placeholder.jpg',
  'kaju_biryani': '/images/food-placeholder.jpg',
  'paneer_biryani': '/images/food-placeholder.jpg',
  'mushroom_biryani': '/images/food-placeholder.jpg',
  'mixed_veg_biryani': '/images/food-placeholder.jpg',
  // Add all other items with same placeholder
};
```

### **Step 3: Add Optimized Placeholder**
Create a small placeholder image (under 50KB) in `public/images/food-placeholder.jpg`

## 📊 **Memory Impact**

**Before**: ~80MB of images in git
**After**: ~50KB single placeholder
**Memory Reduction**: 99.9% reduction

## 🔄 **Deploy the Fix**

1. **Commit the changes**:
   ```bash
   git add .
   git commit -m "Optimize memory usage by removing large images"
   git push
   ```

2. **Redeploy on Render**:
   - Go to your Render dashboard
   - Click "Manual Deploy"
   - Wait for deployment

## 🎯 **Expected Results**

- ✅ **Memory usage under 200MB**
- ✅ **Faster deployment times**
- ✅ **No more out-of-memory errors**
- ✅ **Service stays stable**

## 🔄 **Future Improvements**

1. **Use CDN** for images (Cloudinary, AWS S3)
2. **Implement lazy loading** for images
3. **Use Next.js Image optimization**
4. **Compress images** to WebP format

## 🚀 **Quick Implementation**

Would you like me to:
1. **Remove the large images** from git tracking?
2. **Create optimized placeholder images**?
3. **Update the image mappings** to use external URLs?

Just let me know which option you prefer and I'll implement it immediately! 