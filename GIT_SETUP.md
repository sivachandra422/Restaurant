# Git Repository Setup Guide

## Current Status ✅
- ✅ Git repository initialized
- ✅ All files committed locally
- ✅ Ready to connect to remote repository

## Next Steps

### Option 1: GitHub (Recommended)

1. **Create a new repository on GitHub**:
   - Go to https://github.com
   - Click "New repository"
   - Name it: `sri-kanya-restaurant-menu`
   - Make it public or private (your choice)
   - **Don't** initialize with README (we already have one)
   - Click "Create repository"

2. **Connect your local repository**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sri-kanya-restaurant-menu.git
   git branch -M main
   git push -u origin main
   ```

### Option 2: GitLab

1. **Create a new repository on GitLab**:
   - Go to https://gitlab.com
   - Click "New project"
   - Name it: `sri-kanya-restaurant-menu`
   - Make it public or private
   - Click "Create project"

2. **Connect your local repository**:
   ```bash
   git remote add origin https://gitlab.com/YOUR_USERNAME/sri-kanya-restaurant-menu.git
   git branch -M main
   git push -u origin main
   ```

### Option 3: Bitbucket

1. **Create a new repository on Bitbucket**:
   - Go to https://bitbucket.org
   - Click "Create repository"
   - Name it: `sri-kanya-restaurant-menu`
   - Make it public or private
   - Click "Create repository"

2. **Connect your local repository**:
   ```bash
   git remote add origin https://bitbucket.org/YOUR_USERNAME/sri-kanya-restaurant-menu.git
   git branch -M main
   git push -u origin main
   ```

## Quick Commands

Once you have your repository URL, run these commands:

```bash
# Replace YOUR_REPOSITORY_URL with your actual repository URL
git remote add origin YOUR_REPOSITORY_URL
git branch -M main
git push -u origin main
```

## Repository Features

Your repository includes:

### 🍽️ Restaurant Menu System
- **Responsive Design**: Mobile-first approach
- **Real-time Cart**: Live cart updates with quantity controls
- **Category Navigation**: Horizontal scrollable category tabs
- **Premium UI**: Modern design with smooth animations

### 🔗 Webhook Integration
- **Multi-system Integration**: N8N, Kitchen, POS, Analytics
- **Excel Export**: Automatic order data export
- **Kitchen Printing**: Real-time order printing
- **Order Processing**: Complete order management

### 🖼️ Image Management
- **High-Quality Images**: Professional food photography
- **Local Image System**: All images stored locally
- **Fallback System**: Graceful error handling
- **Optimized Loading**: Next.js Image optimization

### 📱 QR Code Navigation
- **Table-specific URLs**: Direct navigation to menu with table number
- **Dynamic Routing**: Automatic table number capture
- **Customer Experience**: Seamless ordering process

## Files Included

- ✅ Complete Next.js application
- ✅ Webhook integration system
- ✅ N8N workflow example
- ✅ Test scripts
- ✅ Setup documentation
- ✅ All menu images
- ✅ Production-ready configuration

## Environment Setup

After pushing to your repository, don't forget to:

1. **Create `.env.local`** with your webhook URLs
2. **Set up N8N workflow** using the provided example
3. **Configure your webhook endpoints**
4. **Deploy to your hosting platform**

## Support

If you need help with:
- Setting up webhooks
- Configuring N8N
- Deploying to production
- Customizing the menu

Just ask! Your restaurant menu system is production-ready! 🚀 