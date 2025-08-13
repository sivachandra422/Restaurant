import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nameHi: { type: String }, // Hindi name
  nameTe: { type: String }, // Telugu name
  description: { type: String, required: true },
  descriptionHi: { type: String }, // Hindi description
  descriptionTe: { type: String }, // Telugu description
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isVeg: { type: Boolean, default: false },
  isSignature: { type: Boolean, default: false },
  isSpecial: { type: Boolean, default: false },
  image: { type: String, required: true },
  maxQuantity: { type: Number },
  minQuantity: { type: Number },
  bulkPricing: [{
    quantity: { type: Number },
    price: { type: Number }
  }],
  preparationTime: { type: Number },
  popularity: { type: Number, default: 0 },
  trending: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Vector Search Fields
  embeddings: {
    name: [Number], // 1536-dimensional vector for item names
    description: [Number], // 1536-dimensional vector for descriptions
    searchVector: [Number] // Combined semantic vector for search
  },
  
  // Enhanced Search Metadata
  searchText: String, // Preprocessed text for full-text search
  cuisine: String, // Indian, Chinese, etc.
  spiceLevel: Number, // 1-5 scale
  dietaryTags: [String], // ['vegetarian', 'gluten-free', 'spicy']
  flavorProfile: [String], // ['sweet', 'spicy', 'tangy', 'creamy']
  cookingMethod: [String], // ['fried', 'grilled', 'curry', 'biryani']
  
  // Performance & Analytics Fields
  searchScore: { type: Number, default: 0 }, // Dynamic relevance score
  clickCount: { type: Number, default: 0 }, // User engagement metric
  conversionRate: { type: Number, default: 0 }, // Order conversion rate
  lastSearched: { type: Date }, // Last time item was searched
  searchRank: { type: Number, default: 0 } // Position in search results
});

// Update the updatedAt field on save
menuItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for optimal performance
// Note: Vector search index requires MongoDB Atlas with vector search enabled
// Uncomment and configure when using MongoDB Atlas vector search
/*
menuItemSchema.index({ "embeddings.searchVector": "vector" }, { 
  name: "vector_search_index",
  vectorSize: 1536,
  vectorSearchOptions: {
    numCandidates: 100,
    limit: 20
  }
});
*/

menuItemSchema.index({ searchText: "text" }, { 
  name: "text_search_index",
  weights: {
    name: 10,
    description: 5,
    category: 3
  }
});

menuItemSchema.index({ 
  category: 1, 
  isVeg: 1, 
  price: 1, 
  popularity: -1 
}, { name: "category_performance_index" });

menuItemSchema.index({ 
  isDisabled: 1, 
  trending: 1, 
  isSignature: 1 
}, { name: "visibility_index" });

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema); 