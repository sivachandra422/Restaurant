# Environment Variables Setup Guide

## 🔐 **Secure Credential Management**

Instead of hardcoding sensitive data, we'll use environment variables with a `.env` file.

## 📋 **Step 1: Create .env File**

Create a `.env` file in your project root with:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dklpiguqs
CLOUDINARY_API_KEY=your_actual_api_key_here
CLOUDINARY_API_SECRET=your_actual_api_secret_here

# Optional: Other environment variables
NODE_ENV=development
```

## 📋 **Step 2: Install dotenv Package**

```bash
npm install dotenv
```

## 📋 **Step 3: Get Your Cloudinary Credentials**

1. Go to [cloudinary.com](https://cloudinary.com) and log in
2. Go to **Dashboard** → **Settings** → **Access Keys**
3. Copy your:
   - **Cloud Name**: `dklpiguqs` (from your URL)
   - **API Key**: Your API key
   - **API Secret**: Your API secret

## 📋 **Step 4: Update .env File**

Replace the placeholder values in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=dklpiguqs
CLOUDINARY_API_KEY=123456789012345  # Your actual API key
CLOUDINARY_API_SECRET=abcdefghijklmnop  # Your actual API secret
```

## 📋 **Step 5: Run the Script**

```bash
node get-cloudinary-urls.js
```

## 🔒 **Security Benefits**

- ✅ **No hardcoded credentials** in your code
- ✅ **Git-safe** - .env files are ignored by git
- ✅ **Environment-specific** - different values for dev/prod
- ✅ **Best practice** - industry standard approach

## 📁 **File Structure**

```
your-project/
├── .env                    # Your actual credentials (not in git)
├── .env.example           # Template file (safe to commit)
├── .gitignore             # Should include .env
├── get-cloudinary-urls.js # Updated script
└── lib/
    └── imageMappings.ts   # Will be updated
```

## 🚫 **Important: .gitignore**

Make sure your `.gitignore` includes:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Already in your .gitignore
public/menu-images/
```

## 🎯 **Next Steps**

1. **Create the .env file** with your credentials
2. **Install dotenv**: `npm install dotenv`
3. **Run the script**: `node get-cloudinary-urls.js`
4. **Update your mappings** with the generated URLs
5. **Commit and deploy** - No more memory issues!

## 💡 **Benefits**

- **Security**: Credentials never in your code
- **Flexibility**: Easy to change between environments
- **Best Practice**: Industry standard approach
- **Git Safe**: .env files are ignored by version control

Would you like me to help you:
1. **Create the .env file** with your credentials?
2. **Run the updated script**?
3. **Set up the environment variables**?

Just let me know which step you'd like help with! 