import OpenAI from 'openai';
import { MenuItem } from '@/data/sriKanyaMenu';

export interface VectorSearchResult {
  itemId: string;
  itemName: string;
  searchScore: number;
  category: string;
  price: number;
  isVeg: boolean;
  reason: string;
}

export class VectorSearchService {
  private openai?: OpenAI;
  public isConfigured: boolean;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
      console.warn('OpenAI API key not found. Vector search will be disabled.');
    }
  }

  /**
   * Generate embeddings for a text string
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.isConfigured || !this.openai) {
      throw new Error('OpenAI API not configured');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Generate embeddings for a menu item
   */
  async generateMenuItemEmbeddings(item: any): Promise<{
    name: number[];
    description: number[];
    searchVector: number[];
    searchText: string;
    enhancedMetadata: {
      cuisine: string;
      spiceLevel: number;
      dietaryTags: string[];
      flavorProfile: string[];
      cookingMethod: string[];
    };
  }> {
    // Combine all text fields for comprehensive embedding
    const combinedText = [
      item.name,
      item.description,
      item.category,
      item.isVeg ? 'vegetarian' : 'non-vegetarian',
      item.isSignature ? 'signature dish' : '',
      item.isSpecial ? 'special item' : ''
    ].filter(Boolean).join(' ');

    // Generate embeddings
    const nameEmbedding = await this.generateEmbeddings(item.name);
    const descriptionEmbedding = await this.generateEmbeddings(item.description);
    const searchVector = await this.generateEmbeddings(combinedText);

    // Enhanced metadata extraction
    const enhancedMetadata = this.extractEnhancedMetadata(item);

    return {
      name: nameEmbedding,
      description: descriptionEmbedding,
      searchVector,
      searchText: combinedText.toLowerCase(),
      enhancedMetadata
    };
  }

  /**
   * Extract enhanced metadata from menu item
   */
  extractEnhancedMetadata(item: any) {
    const metadata = {
      cuisine: 'Indian',
      spiceLevel: 3,
      dietaryTags: [] as string[],
      flavorProfile: [] as string[],
      cookingMethod: [] as string[]
    };

    // Dietary tags
    if (item.isVeg) metadata.dietaryTags.push('vegetarian');
    if (!item.isVeg) metadata.dietaryTags.push('non-vegetarian');

    // Spice level detection
    const spicyKeywords = ['spicy', 'hot', 'chilli', 'chilly', 'schezwan', 'dragon'];
    const isSpicy = spicyKeywords.some(keyword => 
      item.name.toLowerCase().includes(keyword) || 
      item.description.toLowerCase().includes(keyword)
    );
    metadata.spiceLevel = isSpicy ? 4 : 3;

    // Flavor profile detection
    const flavorKeywords = {
      sweet: ['sweet', 'honey', 'jaggery'],
      spicy: ['spicy', 'hot', 'chilli'],
      tangy: ['tangy', 'lemon', 'tamarind'],
      creamy: ['creamy', 'butter', 'milk', 'yogurt']
    };

    Object.entries(flavorKeywords).forEach(([flavor, keywords]) => {
      if (keywords.some(keyword => 
        item.name.toLowerCase().includes(keyword) || 
        item.description.toLowerCase().includes(keyword)
      )) {
        metadata.flavorProfile.push(flavor);
      }
    });

    // Cooking method detection
    const cookingKeywords = {
      fried: ['fried', 'fry', 'crispy'],
      grilled: ['grilled', 'tandoor', 'barbecue'],
      curry: ['curry', 'gravy', 'masala'],
      biryani: ['biryani', 'layered', 'dum']
    };

    Object.entries(cookingKeywords).forEach(([method, keywords]) => {
      if (keywords.some(keyword => 
        item.name.toLowerCase().includes(keyword) || 
        item.description.toLowerCase().includes(keyword)
      )) {
        metadata.cookingMethod.push(method);
      }
    });

    return metadata;
  }

  /**
   * Perform vector similarity search
   */
  async vectorSearch(
    query: string, 
    filters: any = {}, 
    limit: number = 20
  ): Promise<VectorSearchResult[]> {
    if (!this.isConfigured) {
      throw new Error('Vector search not available');
    }

    try {
      const queryEmbedding = await this.generateEmbeddings(query);
      
      // Use MongoDB's $vectorSearch aggregation
      const results = await (global as any).MenuItem.aggregate([
        {
          $vectorSearch: {
            queryVector: queryEmbedding,
            path: "embeddings.searchVector",
            numCandidates: 100,
            limit: limit,
            index: "vector_search_index"
          }
        },
        {
          $addFields: {
            searchScore: { $meta: "vectorSearchScore" }
          }
        },
        {
          $match: {
            isDisabled: { $ne: true },
            ...filters
          }
        },
        {
          $sort: { searchScore: -1, popularity: -1 }
        },
        {
          $project: {
            itemId: "$id",
            itemName: "$name",
            searchScore: 1,
            category: 1,
            price: 1,
            isVeg: 1,
            reason: { $concat: ["Matched: ", "$name"] }
          }
        }
      ]);

      return results;
    } catch (error) {
      console.error('Vector search error:', error);
      throw new Error('Vector search failed');
    }
  }

  /**
   * Hybrid search combining vector and text search
   */
  async hybridSearch(
    query: string, 
    filters: any = {}, 
    limit: number = 20
  ): Promise<VectorSearchResult[]> {
    try {
      // Try vector search first
      const vectorResults = await this.vectorSearch(query, filters, limit);
      
      if (vectorResults.length > 0) {
        return vectorResults;
      }
    } catch (error) {
      console.log('Vector search failed, falling back to text search');
    }

    // Fallback to text search
    return this.textSearch(query, filters, limit);
  }

  /**
   * Traditional text search fallback
   */
  private async textSearch(
    query: string, 
    filters: any = {}, 
    limit: number = 20
  ): Promise<VectorSearchResult[]> {
    try {
      const results = await (global as any).MenuItem.find({
        $text: { $search: query },
        isDisabled: { $ne: true },
        ...filters
      })
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();

      return results.map((item: any) => ({
        itemId: item.id,
        itemName: item.name,
        searchScore: item.score || 0,
        category: item.category,
        price: item.price,
        isVeg: item.isVeg,
        reason: 'Text search match'
      }));
    } catch (error) {
      console.error('Text search error:', error);
      return [];
    }
  }

  /**
   * Update search analytics for an item
   */
  async updateSearchAnalytics(itemId: string, searchRank: number): Promise<void> {
    try {
      await (global as any).MenuItem.updateOne(
        { id: itemId },
        {
          $inc: { clickCount: 1 },
          $set: { 
            lastSearched: new Date(),
            searchRank: searchRank
          }
        }
      );
    } catch (error) {
      console.error('Error updating search analytics:', error);
    }
  }
}

export const vectorService = new VectorSearchService();
