import { connectToDatabase } from '@/lib/mongodb';
import { createVectorService } from '@/lib/services/multiProviderVectorService';
import { loadVectorConfig, getRecommendedProvider, getProviderCostComparison } from '@/lib/config/vectorConfig';

/**
 * Test script for multi-provider vector search functionality
 */
export async function testMultiProviderVectorSearch() {
  try {
    console.log('🧪 Testing Multi-Provider Vector Search System...');
    
    // Load configuration
    const config = loadVectorConfig();
    const vectorService = createVectorService(config);
    
    // Test 1: Check provider configuration
    console.log('\n1️⃣ Testing Provider Configuration...');
    const providerInfo = vectorService.getProviderInfo();
    console.log('Provider Info:', providerInfo);
    
    if (!vectorService.isServiceConfigured) {
      console.log('❌ No vector service providers configured');
      console.log('💡 Set one of these environment variables:');
      console.log('   - GROQ_API_KEY (Recommended: Fastest & Cost-effective)');
      console.log('   - GEMINI_API_KEY (Free tier available)');
      console.log('   - OPENAI_API_KEY (Most reliable)');
      console.log('   - OPENROUTER_API_KEY (Multiple models)');
      return;
    }

    // Test 2: Show provider comparison
    console.log('\n2️⃣ Provider Cost Comparison...');
    const costComparison = getProviderCostComparison();
    Object.entries(costComparison).forEach(([key, info]) => {
      console.log(`   ${info.name}: ${info.cost} - ${info.speed}`);
      console.log(`   Best for: ${info.bestFor}`);
    });

    // Test 3: Test embedding generation
    console.log('\n3️⃣ Testing Embedding Generation...');
    try {
      const testText = "Chicken Biryani";
      const embedding = await vectorService.generateEmbeddings(testText);
      console.log(`✅ Generated embedding for "${testText}"`);
      console.log(`   Provider: ${vectorService.getActiveProvider()}`);
      console.log(`   Embedding length: ${embedding.length}`);
      console.log(`   First 5 values: [${embedding.slice(0, 5).join(', ')}...]`);
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      return;
    }

    // Test 4: Test metadata extraction
    console.log('\n4️⃣ Testing Metadata Extraction...');
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

    // Test 5: Test database connection
    console.log('\n5️⃣ Testing Database Connection...');
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

    // Test 6: Performance test
    console.log('\n6️⃣ Performance Test...');
    try {
      const startTime = Date.now();
      const testTexts = [
        "Chicken Biryani",
        "Paneer Butter Masala", 
        "Spicy Chicken Curry",
        "Vegetable Fried Rice",
        "Mutton Curry"
      ];
      
      for (const text of testTexts) {
        const start = Date.now();
        await vectorService.generateEmbeddings(text);
        const duration = Date.now() - start;
        console.log(`   "${text}": ${duration}ms`);
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`   Total time for 5 embeddings: ${totalTime}ms`);
      console.log(`   Average time per embedding: ${totalTime / testTexts.length}ms`);
    } catch (error) {
      console.error('❌ Performance test failed:', error);
    }

    console.log('\n🎉 Multi-Provider Vector Search System Test Completed!');
    console.log(`\n🏆 Active Provider: ${vectorService.getActiveProvider()}`);
    console.log(`💡 Recommendation: ${getRecommendedProvider()}`);
    
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
  testMultiProviderVectorSearch()
    .then(() => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}
