import { connectToDatabase } from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';
import { vectorService } from '@/lib/services/vectorService';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';

/**
 * Migration script to add vector search capabilities to existing menu items
 * Run this script after setting up MongoDB Atlas Vector Search
 */
export async function migrateToVectorSearch() {
  try {
    console.log('🚀 Starting vector search migration...');
    
    // Connect to database
    const { db } = await connectToDatabase();
    if (!db) {
      throw new Error('Database connection failed');
    }

    // Check if vector search is configured
    if (!vectorService.isConfigured) {
      console.log('⚠️  OpenAI API not configured. Skipping vector generation.');
      console.log('📝 Items will be updated with enhanced metadata only.');
    }

    // Get all menu items from database
    const existingItems = await MenuItem.find({});
    console.log(`📊 Found ${existingItems.length} existing menu items`);

    if (existingItems.length === 0) {
      console.log('📝 No existing items found. Initializing with static data...');
      await initializeDatabaseWithVectorData();
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    // Process each menu item
    for (const item of existingItems) {
      try {
        console.log(`🔄 Processing: ${item.name}`);
        
        const updateData: any = {};
        
        // Generate enhanced metadata
        const enhancedMetadata = vectorService.extractEnhancedMetadata(item);
        updateData.cuisine = enhancedMetadata.cuisine;
        updateData.spiceLevel = enhancedMetadata.spiceLevel;
        updateData.dietaryTags = enhancedMetadata.dietaryTags;
        updateData.flavorProfile = enhancedMetadata.flavorProfile;
        updateData.cookingMethod = enhancedMetadata.cookingMethod;
        
        // Generate search text
        updateData.searchText = [
          item.name,
          item.description,
          item.category,
          item.isVeg ? 'vegetarian' : 'non-vegetarian',
          item.isSignature ? 'signature dish' : '',
          item.isSpecial ? 'special item' : ''
        ].filter(Boolean).join(' ').toLowerCase();

        // Generate vector embeddings if OpenAI is configured
        if (vectorService.isConfigured) {
          try {
            const embeddings = await vectorService.generateMenuItemEmbeddings(item);
            updateData.embeddings = {
              name: embeddings.name,
              description: embeddings.description,
              searchVector: embeddings.searchVector
            };
            console.log(`✅ Generated embeddings for: ${item.name}`);
          } catch (embeddingError) {
            console.error(`❌ Failed to generate embeddings for ${item.name}:`, embeddingError);
            // Continue without embeddings
          }
        }

        // Update the item
        await MenuItem.updateOne(
          { id: item.id },
          { $set: updateData }
        );

        updatedCount++;
        console.log(`✅ Updated: ${item.name}`);
        
        // Add delay to avoid rate limiting
        if (vectorService.isConfigured) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`❌ Error processing ${item.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} items`);
    if (errorCount > 0) {
      console.log(`❌ Errors encountered: ${errorCount} items`);
    }

    // Create indexes for optimal performance
    await createVectorSearchIndexes();
    
    console.log('🔍 Vector search indexes created successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

/**
 * Initialize database with static menu data including vector capabilities
 */
async function initializeDatabaseWithVectorData() {
  try {
    console.log('📝 Initializing database with static menu data...');
    
    const menuItems = Object.entries(sriKanyaMenu).flatMap(([categoryKey, items]) => 
      items.map(item => ({
        ...item,
        category: categoryKey,
        categorySlug: categoryKey
      }))
    );

    console.log(`📊 Processing ${menuItems.length} menu items...`);

    for (const item of menuItems) {
      try {
        const updateData: any = { ...item };
        
        // Generate enhanced metadata
        const enhancedMetadata = vectorService.extractEnhancedMetadata(item);
        updateData.cuisine = enhancedMetadata.cuisine;
        updateData.spiceLevel = enhancedMetadata.spiceLevel;
        updateData.dietaryTags = enhancedMetadata.dietaryTags;
        updateData.flavorProfile = enhancedMetadata.flavorProfile;
        updateData.cookingMethod = enhancedMetadata.cookingMethod;
        
        // Generate search text
        updateData.searchText = [
          item.name,
          item.description,
          item.category,
          item.isVeg ? 'vegetarian' : 'non-vegetarian',
          item.isSignature ? 'signature dish' : '',
          item.isSpecial ? 'special item' : ''
        ].filter(Boolean).join(' ').toLowerCase();

        // Generate vector embeddings if OpenAI is configured
        if (vectorService.isConfigured) {
          try {
            const embeddings = await vectorService.generateMenuItemEmbeddings(item);
            updateData.embeddings = {
              name: embeddings.name,
              description: embeddings.description,
              searchVector: embeddings.searchVector
            };
            console.log(`✅ Generated embeddings for: ${item.name}`);
          } catch (embeddingError) {
            console.error(`❌ Failed to generate embeddings for ${item.name}:`, embeddingError);
          }
        }

        // Insert the item
        await MenuItem.create(updateData);
        console.log(`✅ Created: ${item.name}`);
        
        // Add delay to avoid rate limiting
        if (vectorService.isConfigured) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`❌ Error creating ${item.name}:`, error);
      }
    }

    console.log('✅ Database initialization completed!');

  } catch (error) {
    console.error('💥 Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create vector search indexes for optimal performance
 */
async function createVectorSearchIndexes() {
  try {
    console.log('🔍 Creating vector search indexes...');
    
    const db = (global as any).MenuItem.db.db;
    
    // Create vector search index
    await db.collection('menuitems').createIndex({
      "embeddings.searchVector": "vector"
    }, {
      name: "vector_search_index",
      vectorSize: 1536,
      vectorSearchOptions: {
        numCandidates: 100,
        limit: 20
      }
    });

    // Create text search index
    await db.collection('menuitems').createIndex({
      "searchText": "text"
    }, {
      name: "text_search_index",
      weights: {
        name: 10,
        description: 5,
        category: 3
      }
    });

    // Create performance indexes
    await db.collection('menuitems').createIndex({
      "category": 1,
      "isVeg": 1,
      "price": 1,
      "popularity": -1
    }, { name: "category_performance_index" });

    await db.collection('menuitems').createIndex({
      "isDisabled": 1,
      "trending": 1,
      "isSignature": 1
    }, { name: "visibility_index" });

    console.log('✅ All indexes created successfully!');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

/**
 * Run migration if this script is executed directly
 */
if (require.main === module) {
  migrateToVectorSearch()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}
