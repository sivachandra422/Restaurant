import { connectToDatabase } from '@/lib/mongodb';
import { vectorService } from '@/lib/services/vectorService';

/**
 * Simple test script to verify vector search functionality
 */
export async function testVectorSearch() {
  try {
    console.log('🧪 Testing Vector Search System...');
    
    // Test 1: Check if OpenAI is configured
    console.log('\n1️⃣ Testing OpenAI Configuration...');
    if (vectorService.isConfigured) {
      console.log('✅ OpenAI API is configured');
    } else {
      console.log('❌ OpenAI API is not configured');
      console.log('💡 Set OPENAI_API_KEY in your environment variables');
      return;
    }

    // Test 2: Test embedding generation
    console.log('\n2️⃣ Testing Embedding Generation...');
    try {
      const testText = "Chicken Biryani";
      const embedding = await vectorService.generateEmbeddings(testText);
      console.log(`✅ Generated embedding for "${testText}"`);
      console.log(`   Embedding length: ${embedding.length}`);
      console.log(`   First 5 values: [${embedding.slice(0, 5).join(', ')}...]`);
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      return;
    }

    // Test 3: Test metadata extraction
    console.log('\n3️⃣ Testing Metadata Extraction...');
    try {
      const testItem = {
        name: "Spicy Chicken Curry",
        description: "Hot and spicy chicken curry with rich gravy",
        isVeg: false,
        isSignature: true,
        isSpecial: false,
        category: "curries"
      };
      
      const metadata = vectorService.extractEnhancedMetadata(testItem);
      console.log('✅ Metadata extraction successful:');
      console.log(`   Cuisine: ${metadata.cuisine}`);
      console.log(`   Spice Level: ${metadata.spiceLevel}/5`);
      console.log(`   Dietary Tags: ${metadata.dietaryTags.join(', ')}`);
      console.log(`   Flavor Profile: ${metadata.flavorProfile.join(', ')}`);
      console.log(`   Cooking Method: ${metadata.cookingMethod.join(', ')}`);
    } catch (error) {
      console.error('❌ Metadata extraction failed:', error);
    }

    // Test 4: Test database connection
    console.log('\n4️⃣ Testing Database Connection...');
    try {
      const { db } = await connectToDatabase();
      if (db) {
        console.log('✅ Database connection successful');
      } else {
        console.log('❌ Database connection failed');
        console.log('💡 Check your MONGODB_URI environment variable');
      }
    } catch (error) {
      console.error('❌ Database connection error:', error);
    }

    console.log('\n🎉 Vector Search System Test Completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Set up MongoDB Atlas with M10+ cluster');
    console.log('   2. Create vector search indexes');
    console.log('   3. Run: npm run migrate:vector');
    console.log('   4. Test the search API endpoints');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

/**
 * Run test if this script is executed directly
 */
if (require.main === module) {
  testVectorSearch()
    .then(() => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}
