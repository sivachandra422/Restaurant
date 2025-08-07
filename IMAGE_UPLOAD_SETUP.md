# 🖼️ Image Upload Setup Guide

## 🎯 **Overview**
This guide will help you set up image uploads for menu items in your admin dashboard. Images will be automatically optimized and stored on Cloudinary for fast loading.

## 📋 **Step-by-Step Setup**

### **Step 1: Create Cloudinary Account**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Create your account
4. Get your credentials from the dashboard:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### **Step 2: Configure Environment Variables**
Add these to your `.env.local` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### **Step 3: Test the Setup**
1. Start your development server: `npm run dev`
2. Go to admin dashboard: `http://localhost:3000/admin`
3. Click "Add New Item" or edit an existing item
4. Try uploading an image using the new image upload component

## 🎨 **Features**

### **✅ What's Included:**
- **Drag & Drop Upload**: Simply drag images onto the upload area
- **File Validation**: Only accepts JPEG, PNG, and WebP files
- **Size Limits**: Maximum 5MB per image
- **Auto-Optimization**: Images are automatically resized to 400x300px
- **Preview**: See your uploaded image immediately
- **Remove Option**: Remove images with a single click
- **Error Handling**: Clear error messages for invalid files

### **🖼️ Image Specifications:**
- **Supported Formats**: JPEG, JPG, PNG, WebP
- **Maximum Size**: 5MB
- **Output Size**: 400x300px (optimized for menu cards)
- **Quality**: Auto-optimized for web

## 🚀 **How to Use**

### **Adding Images to New Items:**
1. Go to Admin Dashboard → Menu Management
2. Click "Add New Item"
3. In the "Item Image" section:
   - Drag and drop an image file, OR
   - Click "browse" to select a file
4. The image will be uploaded and displayed as a preview
5. Fill in other item details
6. Click "Create Item"

### **Updating Images for Existing Items:**
1. Go to Admin Dashboard → Menu Management
2. Click the edit icon (pencil) next to any item
3. In the "Item Image" section:
   - Upload a new image to replace the current one
   - Or click the X button to remove the current image
4. Click "Save Changes"

## 🔧 **Technical Details**

### **Upload Process:**
1. **Client-side Validation**: File type and size checked before upload
2. **FormData Upload**: Image sent to `/api/upload` endpoint
3. **Cloudinary Processing**: Image uploaded to Cloudinary with optimization
4. **URL Return**: Optimized URL returned and stored in database
5. **Immediate Display**: Image appears in menu immediately

### **Storage Structure:**
```
Cloudinary Folder: sri-kanya-menu/
├── menu_1234567890_abc123def.jpg
├── menu_1234567891_xyz789ghi.jpg
└── ...
```

### **Optimized URLs:**
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_400,h_300,c_fill,f_auto,q_auto/menu_1234567890_abc123def
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

**1. "Upload failed" error:**
- Check your Cloudinary credentials in `.env.local`
- Ensure all three environment variables are set
- Verify your Cloudinary account is active

**2. "Invalid file type" error:**
- Only JPEG, PNG, and WebP files are supported
- Convert your image to a supported format

**3. "File size too large" error:**
- Maximum file size is 5MB
- Compress your image before uploading

**4. Image not showing in menu:**
- Check if the image URL is stored in the database
- Verify the image URL is accessible
- Clear browser cache and refresh

### **Debug Steps:**
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test Cloudinary credentials manually
4. Check network tab for upload requests

## 📊 **Benefits**

### **Performance:**
- **Fast Loading**: CDN delivery worldwide
- **Optimized Images**: Automatic compression and resizing
- **Caching**: Images cached for faster subsequent loads

### **User Experience:**
- **Instant Preview**: See images immediately after upload
- **Drag & Drop**: Intuitive file upload interface
- **Error Feedback**: Clear error messages
- **Mobile Friendly**: Works on all devices

### **Management:**
- **Centralized Storage**: All images in one place
- **Easy Backup**: Cloudinary handles backups
- **Scalable**: Handles unlimited images
- **Cost Effective**: Free tier includes 25GB storage

## 🎯 **Next Steps**

1. **Test the Setup**: Upload a few test images
2. **Add Real Images**: Upload actual menu item photos
3. **Optimize Workflow**: Train staff on the new process
4. **Monitor Usage**: Check Cloudinary dashboard for usage stats

## 📞 **Support**

If you encounter any issues:
1. Check this guide first
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify environment variables
5. Test with a simple image file

---

**🎉 You're all set! Your restaurant menu now has professional image upload capabilities!**
