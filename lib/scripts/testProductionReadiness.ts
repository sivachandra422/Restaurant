import { connectToDatabase } from '@/lib/mongodb';
import { createVectorService } from '@/lib/services/multiProviderVectorService';
import { loadVectorConfig, getEnvironmentSummary, isProductionReady } from '@/lib/config/vectorConfig';
import { MenuItem } from '@/lib/models/MenuItem';

/**
 * Production readiness test script
 * Run this before deploying to Render to ensure everything is configured correctly
 */
export async function testProductionReadiness() {
  console.log('🚀 Testing Production Readiness...\n');
  
  const results = {
    environment: false,
    vectorService: false,
    database: false,
    vectorSearch: false,
    performance: false
  };

  let totalTests = 0;
  let passedTests = 0;

  try {
    // Test 1: Environment Configuration
    console.log('1️⃣ Testing Environment Configuration...');
    totalTests++;
    
    try {
      const envSummary = getEnvironmentSummary();
      const productionReady = isProductionReady();
      
      console.log(`   Environment: ${envSummary.environment}`);
      console.log(`   Production: ${envSummary.isProduction}`);
      console.log(`   MongoDB: ${envSummary.hasMongoDB ? '✅' : '❌'}`);
      console.log(`   Vector Provider: ${envSummary.hasVectorProvider ? '✅' : '❌'}`);
      console.log(`   Active Providers: ${envSummary.activeProviders.join(', ')}`);
      console.log(`   Production Ready: ${productionReady.ready ? '✅' : '❌'}`);
      
      if (!productionReady.ready) {
        console.log('   ⚠️ Production Issues:');
        productionReady.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      if (envSummary.hasMongoDB && envSummary.hasVectorProvider && productionReady.ready) {
        results.environment = true;
        passedTests++;
        console.log('   ✅ Environment configuration: PASSED');
      } else {
        console.log('   ❌ Environment configuration: FAILED');
      }
    } catch (error) {
      console.log(`   ❌ Environment configuration: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Vector Service
    console.log('\n2️⃣ Testing Vector Service...');
    totalTests++;
    
    try {
      const vectorConfig = loadVectorConfig();
      const vectorService = createVectorService(vectorConfig);
      
      if (vectorService.isServiceConfigured) {
        const providerInfo = vectorService.getProviderInfo();
        console.log(`   Active Provider: ${providerInfo.activeProvider}`);
        console.log(`   Configured: ${providerInfo.isConfigured}`);
        console.log(`   Production: ${providerInfo.isProduction}`);
        
        // Test health check
        const health = await vectorService.healthCheck();
        console.log(`   Health Status: ${health.status}`);
        
        if (health.status === 'healthy') {
          results.vectorService = true;
          passedTests++;
          console.log('   ✅ Vector service: PASSED');
        } else {
          console.log(`   ❌ Vector service: FAILED - ${health.error}`);
        }
      } else {
        console.log('   ❌ Vector service: FAILED - No provider configured');
      }
    } catch (error) {
      console.log(`   ❌ Vector service: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Database Connection
    console.log('\n3️⃣ Testing Database Connection...');
    totalTests++;
    
    try {
      const { db } = await connectToDatabase();
      if (db) {
        // Test connection with ping
        await db.admin().ping();
        console.log(`   Database: ${db.databaseName}`);
        console.log(`   Connection: ✅ Active`);
        
        // Check if vector search indexes exist
        try {
          const collections = await db.listCollections().toArray();
          const menuitemsCollection = collections.find(c => c.name === 'menuitems');
          
          if (menuitemsCollection) {
            const indexes = await db.collection('menuitems').indexes();
            const vectorIndex = indexes.find((idx: any) => idx.name === 'vector_search_index');
            
            if (vectorIndex) {
              console.log('   Vector Index: ✅ Found');
              results.database = true;
              passedTests++;
              console.log('   ✅ Database connection: PASSED');
            } else {
              console.log('   Vector Index: ❌ Missing - Run migration script first');
            }
          } else {
            console.log('   Menu Items Collection: ❌ Missing');
          }
        } catch (indexError) {
          console.log(`   Index Check: ❌ Failed - ${indexError instanceof Error ? indexError.message : 'Unknown error'}`);
        }
      } else {
        console.log('   ❌ Database connection: FAILED - No database connection');
      }
    } catch (error) {
      console.log(`   ❌ Database connection: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Vector Search Functionality
    console.log('\n4️⃣ Testing Vector Search Functionality...');
    totalTests++;
    
    try {
      const vectorConfig = loadVectorConfig();
      const vectorService = createVectorService(vectorConfig);
      
      if (vectorService.isServiceConfigured) {
        // Test embedding generation
        const testStart = Date.now();
        const testEmbedding = await vectorService.generateEmbeddings('chicken biryani');
        const testDuration = Date.now() - testStart;
        
        console.log(`   Embedding Generation: ✅ ${testDuration}ms`);
        console.log(`   Embedding Length: ${testEmbedding.length} dimensions`);
        
        // Test vector search if database is connected
        if (results.database) {
          try {
            const searchStart = Date.now();
            const searchResults = await vectorService.vectorSearch('chicken', {}, 5);
            const searchDuration = Date.now() - searchStart;
            
            console.log(`   Vector Search: ✅ ${searchDuration}ms`);
            console.log(`   Search Results: ${searchResults.length} items`);
            
            results.vectorSearch = true;
            passedTests++;
            console.log('   ✅ Vector search functionality: PASSED');
          } catch (searchError) {
            console.log(`   Vector Search: ❌ Failed - ${searchError instanceof Error ? searchError.message : 'Unknown error'}`);
          }
        } else {
          console.log('   Vector Search: ⏸️ Skipped - Database not connected');
        }
      } else {
        console.log('   ❌ Vector search functionality: FAILED - Vector service not configured');
      }
    } catch (error) {
      console.log(`   ❌ Vector search functionality: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Performance Test
    console.log('\n5️⃣ Testing Performance...');
    totalTests++;
    
    try {
      const vectorConfig = loadVectorConfig();
      const vectorService = createVectorService(vectorConfig);
      
      if (vectorService.isServiceConfigured) {
        const testTexts = [
          'chicken biryani',
          'paneer butter masala',
          'spicy chicken curry',
          'vegetable fried rice',
          'mutton curry'
        ];
        
        console.log('   Testing embedding generation performance...');
        const startTime = Date.now();
        
        for (const text of testTexts) {
          const start = Date.now();
          await vectorService.generateEmbeddings(text);
          const duration = Date.now() - start;
          console.log(`      "${text}": ${duration}ms`);
        }
        
        const totalTime = Date.now() - startTime;
        const avgTime = totalTime / testTexts.length;
        
        console.log(`   Total Time: ${totalTime}ms`);
        console.log(`   Average Time: ${avgTime.toFixed(1)}ms per embedding`);
        
        // Performance thresholds
        if (avgTime < 1000) { // Less than 1 second per embedding
          results.performance = true;
          passedTests++;
          console.log('   ✅ Performance: PASSED (Good)');
        } else if (avgTime < 3000) {
          results.performance = true;
          passedTests++;
          console.log('   ✅ Performance: PASSED (Acceptable)');
        } else {
          console.log('   ⚠️ Performance: PASSED (Slow - consider optimization)');
        }
      } else {
        console.log('   ❌ Performance: FAILED - Vector service not configured');
      }
    } catch (error) {
      console.log(`   ❌ Performance: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Summary
    console.log('\n📊 Production Readiness Summary');
    console.log('================================');
    
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${test.charAt(0).toUpperCase() + test.slice(1)}: ${status}`);
    });
    
    console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
    
    const overallPassed = passedTests === totalTests;
    if (overallPassed) {
      console.log('\n🎉 PRODUCTION READY! 🎉');
      console.log('Your system is ready for deployment to Render.');
      console.log('\nNext steps:');
      console.log('1. Set environment variables in Render dashboard');
      console.log('2. Deploy your application');
      console.log('3. Monitor the health endpoint: /api/health');
    } else {
      console.log('\n⚠️ NOT PRODUCTION READY');
      console.log('Please fix the failed tests before deploying.');
      console.log('\nCommon issues:');
      console.log('- Missing environment variables');
      console.log('- Invalid API keys');
      console.log('- Database connection issues');
      console.log('- Missing vector search indexes');
    }
    
    return {
      overallPassed,
      results,
      passedTests,
      totalTests
    };

  } catch (error) {
    console.error('\n💥 Production readiness test failed:', error);
    return {
      overallPassed: false,
      results,
      passedTests,
      totalTests,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run test if this script is executed directly
 */
if (require.main === module) {
  testProductionReadiness()
    .then((result) => {
      if (result.overallPassed) {
        console.log('\n✅ Production readiness test completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Production readiness test failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Production readiness test crashed:', error);
      process.exit(1);
    });
}
