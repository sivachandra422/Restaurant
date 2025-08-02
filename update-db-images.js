const { MongoClient } = require('mongodb');
const { getFoodImage } = require('./lib/imageMappings');

async function updateDatabaseImages() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MongoDB URI found, skipping database update');
    return;
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    const collection = db.collection('menuitems');
    
    // Get all menu items
    const items = await collection.find({}).toArray();
    console.log(`Found ${items.length} items in database`);
    
    // Update each item with correct image URL
    for (const item of items) {
      const correctImageUrl = getFoodImage(item.id);
      console.log(`Updating ${item.name} (${item.id}): ${item.image} -> ${correctImageUrl}`);
      
      await collection.updateOne(
        { _id: item._id },
        { $set: { image: correctImageUrl } }
      );
    }
    
    console.log('Database images updated successfully!');
    await client.close();
  } catch (error) {
    console.error('Error updating database images:', error);
  }
}

updateDatabaseImages(); 