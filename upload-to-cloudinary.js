const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary (replace with your credentials)
cloudinary.config({
  cloud_name: 'YOUR_CLOUD_NAME',
  api_key: 'YOUR_API_KEY',
  api_secret: 'YOUR_API_SECRET'
});

// Function to upload a single image
async function uploadImage(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'sri-kanya-menu',
      transformation: [
        { width: 400, height: 300, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    console.log(`✅ Uploaded: ${publicId}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Failed to upload ${publicId}:`, error.message);
    return null;
  }
}

// Function to upload all images
async function uploadAllImages() {
  const imagesDir = path.join(__dirname, 'public', 'menu-images');
  
  if (!fs.existsSync(imagesDir)) {
    console.error('❌ Images directory not found:', imagesDir);
    return;
  }

  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => 
    file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
  );

  console.log(`📁 Found ${imageFiles.length} images to upload`);

  const results = {};

  for (const file of imageFiles) {
    const filePath = path.join(imagesDir, file);
    const publicId = path.parse(file).name; // Remove extension
    
    const url = await uploadImage(filePath, publicId);
    if (url) {
      results[publicId] = url;
    }
  }

  // Generate the updated imageMappings.ts content
  const mappingContent = generateImageMappings(results);
  
  // Write to a new file
  fs.writeFileSync('imageMappings-updated.ts', mappingContent);
  
  console.log('\n🎉 Upload complete!');
  console.log('📄 Updated mappings saved to: imageMappings-updated.ts');
  console.log('\n📋 Next steps:');
  console.log('1. Replace your Cloudinary credentials in this script');
  console.log('2. Run: node upload-to-cloudinary.js');
  console.log('3. Copy the generated URLs to lib/imageMappings.ts');
}

// Generate the image mappings TypeScript code
function generateImageMappings(results) {
  let content = `// Auto-generated image mappings for Sri Kanya Restaurant
// Generated from Cloudinary upload

export const foodImageMappings: { [key: string]: string } = {
`;

  // Sort by key for better organization
  const sortedKeys = Object.keys(results).sort();
  
  for (const key of sortedKeys) {
    content += `  '${key}': '${results[key]}',\n`;
  }

  content += `};

// Function to get the appropriate image for a menu item
export function getFoodImage(itemId: string): string {
  return foodImageMappings[itemId] || '${Object.values(results)[0] || '/images/food-placeholder.jpg'}';
}

// Function to get fallback image based on category
export function getFallbackImage(category: string): string {
  const categoryImages: { [key: string]: string } = {
    biryanis: '${Object.values(results).find(url => url.includes('biryani')) || Object.values(results)[0] || '/images/food-placeholder.jpg'}',
    vegCurries: '${Object.values(results).find(url => url.includes('curry')) || Object.values(results)[0] || '/images/food-placeholder.jpg'}',
    nonVegCurries: '${Object.values(results).find(url => url.includes('chicken')) || Object.values(results)[0] || '/images/food-placeholder.jpg'}',
    friedRiceNoodles: '${Object.values(results).find(url => url.includes('rice') || url.includes('noodle')) || Object.values(results)[0] || '/images/food-placeholder.jpg'}',
    breadsRoti: '${Object.values(results).find(url => url.includes('bread') || url.includes('roti')) || Object.values(results)[0] || '/images/food-placeholder.jpg'}',
  };

  return categoryImages[category] || '${Object.values(results)[0] || '/images/food-placeholder.jpg'}';
}
`;

  return content;
}

// Run the upload
if (require.main === module) {
  console.log('🚀 Starting Cloudinary upload...');
  console.log('⚠️  Make sure to update your Cloudinary credentials first!');
  uploadAllImages().catch(console.error);
}

module.exports = { uploadImage, uploadAllImages }; 