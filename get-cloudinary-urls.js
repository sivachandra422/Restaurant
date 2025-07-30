// Script to help extract Cloudinary URLs from your collection
// Based on your collection: https://collection.cloudinary.com/dklpiguqs/a7929dc14ac74d52a008e57053c387a6

// Load environment variables from .env file
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

// Configure with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dklpiguqs',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to get all images from your collection
async function getCollectionImages() {
  try {
    // Check if credentials are available
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Missing Cloudinary credentials in .env file');
      console.log('\n📋 Please create a .env file with:');
      console.log('CLOUDINARY_CLOUD_NAME=dklpiguqs');
      console.log('CLOUDINARY_API_KEY=your_api_key_here');
      console.log('CLOUDINARY_API_SECRET=your_api_secret_here');
      return;
    }

    // Get all resources from your account (without prefix to find all images)
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 100
    });

    console.log('📁 Found images in your Cloudinary account:');
    console.log('==========================================');

    const imageMappings = {};

    if (result.resources && result.resources.length > 0) {
      result.resources.forEach(resource => {
        const publicId = resource.public_id.split('/').pop(); // Get filename without folder
        const optimizedUrl = `https://res.cloudinary.com/dklpiguqs/image/upload/w_400,h_300,c_fill,f_auto,q_auto/${resource.public_id}`;
        
        console.log(`✅ ${publicId}: ${optimizedUrl}`);
        imageMappings[publicId] = optimizedUrl;
      });
    } else {
      console.log('❌ No images found in your Cloudinary account');
      console.log('📋 Please upload your images to Cloudinary first');
      console.log('📋 Or check if your credentials are correct');
    }

    // Generate the updated imageMappings.ts content
    generateImageMappingsFile(imageMappings);

  } catch (error) {
    console.error('❌ Error fetching images:', error.message);
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Go to your Cloudinary dashboard');
    console.log('2. Navigate to your Media Library');
    console.log('3. For each image, copy the URL and add optimization parameters:');
    console.log('   Original: https://res.cloudinary.com/dklpiguqs/image/upload/v1234567890/filename.jpg');
    console.log('   Optimized: https://res.cloudinary.com/dklpiguqs/image/upload/w_400,h_300,c_fill,f_auto,q_auto/v1234567890/filename.jpg');
  }
}

// Generate the image mappings TypeScript file
function generateImageMappingsFile(imageMappings) {
  let content = `// Auto-generated image mappings for Sri Kanya Restaurant
// Generated from Cloudinary collection: https://collection.cloudinary.com/dklpiguqs/a7929dc14ac74d52a008e57053c387a6

export const foodImageMappings: { [key: string]: string } = {
`;

  // Sort by key for better organization
  const sortedKeys = Object.keys(imageMappings).sort();
  
  for (const key of sortedKeys) {
    content += `  '${key}': '${imageMappings[key]}',\n`;
  }

  content += `};

// Function to get the appropriate image for a menu item
export function getFoodImage(itemId: string): string {
  return foodImageMappings[itemId] || '${Object.values(imageMappings)[0] || '/images/food-placeholder.jpg'}';
}

// Function to get fallback image based on category
export function getFallbackImage(category: string): string {
  const categoryImages: { [key: string]: string } = {
    biryanis: '${Object.values(imageMappings).find(url => url.includes('biryani')) || Object.values(imageMappings)[0] || '/images/food-placeholder.jpg'}',
    vegCurries: '${Object.values(imageMappings).find(url => url.includes('curry')) || Object.values(imageMappings)[0] || '/images/food-placeholder.jpg'}',
    nonVegCurries: '${Object.values(imageMappings).find(url => url.includes('chicken')) || Object.values(imageMappings)[0] || '/images/food-placeholder.jpg'}',
    friedRiceNoodles: '${Object.values(imageMappings).find(url => url.includes('rice') || url.includes('noodle')) || Object.values(imageMappings)[0] || '/images/food-placeholder.jpg'}',
    breadsRoti: '${Object.values(imageMappings).find(url => url.includes('bread') || url.includes('roti')) || Object.values(imageMappings)[0] || '/images/food-placeholder.jpg'}',
  };

  return categoryImages[category] || '${Object.values(imageMappings)[0] || '/images/food-placeholder.jpg'}';
}
`;

  // Write to file
  const fs = require('fs');
  fs.writeFileSync('lib/imageMappings-updated.ts', content);
  
  console.log('\n🎉 Generated image mappings!');
  console.log('📄 File saved as: lib/imageMappings-updated.ts');
  console.log('\n📋 Next steps:');
  console.log('1. Replace lib/imageMappings.ts with the new content');
  console.log('2. Commit and push the changes');
  console.log('3. Deploy to Render');
}

// Manual URL generation helper
function generateManualUrls() {
  console.log('\n🔧 Manual URL Generation Helper:');
  console.log('================================');
  console.log('For each image in your collection, use this format:');
  console.log('https://res.cloudinary.com/dklpiguqs/image/upload/w_400,h_300,c_fill,f_auto,q_auto/[YOUR_IMAGE_PATH]');
  console.log('\nExample:');
  console.log('Original: https://res.cloudinary.com/dklpiguqs/image/upload/v1234567890/chicken_biryani.jpg');
  console.log('Optimized: https://res.cloudinary.com/dklpiguqs/image/upload/w_400,h_300,c_fill,f_auto,q_auto/v1234567890/chicken_biryani.jpg');
}

// Run the script
if (require.main === module) {
  console.log('🚀 Fetching images from your Cloudinary collection...');
  console.log('Collection: https://collection.cloudinary.com/dklpiguqs/a7929dc14ac74d52a008e57053c387a6');
  console.log('⚠️  Make sure to create a .env file with your Cloudinary credentials!');
  
  getCollectionImages().catch(() => {
    generateManualUrls();
  });
}

module.exports = { getCollectionImages, generateManualUrls }; 