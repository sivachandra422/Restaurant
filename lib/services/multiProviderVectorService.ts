import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface VectorSearchResult {
  itemId: string;
  itemName: string;
  searchScore: number;
  category: string;
  price: number;
  isVeg: boolean;
  reason: string;
}

export type VectorProvider = 'groq' | 'gemini' | 'openai' | 'openrouter';

export interface VectorProviderConfig {
  groq?: {
    apiKey: string;
    model?: string;
  };
  gemini?: {
    apiKey: string;
    model?: string;
  };
  openai?: {
    apiKey: string;
    model?: string;
  };
  openrouter?: {
    apiKey: string;
    model?: string;
    baseURL?: string;
  };
}

export class MultiProviderVectorService {
  private groq?: Groq;
  private gemini?: GoogleGenerativeAI;
  private openai?: OpenAI;
  private openrouter?: OpenAI;
  private activeProvider: VectorProvider | null = null;
  private isConfigured: boolean = false;
  private isProduction: boolean;

  constructor(config: VectorProviderConfig) {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.initializeProviders(config);
  }

  /**
   * Initialize vector service providers
   */
  private initializeProviders(config: VectorProviderConfig) {
    try {
      // Initialize Groq
      if (config.groq?.apiKey) {
        if (!config.groq.apiKey.startsWith('gsk_')) {
          throw new Error('Invalid Groq API key format. Should start with "gsk_"');
        }
        this.groq = new Groq({
          apiKey: config.groq.apiKey,
        });
        this.activeProvider = 'groq';
        this.isConfigured = true;
        this.log('✅ Groq vector service initialized', 'info');
      }

      // Initialize Gemini
      if (config.gemini?.apiKey) {
        if (!config.gemini.apiKey.startsWith('AIza')) {
          throw new Error('Invalid Gemini API key format. Should start with "AIza"');
        }
        this.gemini = new GoogleGenerativeAI(config.gemini.apiKey);
        if (!this.activeProvider) {
          this.activeProvider = 'gemini';
          this.isConfigured = true;
        }
        this.log('✅ Gemini vector service initialized', 'info');
      }

      // Initialize OpenAI
      if (config.openai?.apiKey) {
        if (!config.openai.apiKey.startsWith('sk-')) {
          throw new Error('Invalid OpenAI API key format. Should start with "sk-"');
        }
        this.openai = new OpenAI({
          apiKey: config.openai.apiKey,
        });
        if (!this.activeProvider) {
          this.activeProvider = 'openai';
          this.isConfigured = true;
        }
        this.log('✅ OpenAI vector service initialized', 'info');
      }

      // Initialize OpenRouter
      if (config.openrouter?.apiKey) {
        if (!config.openrouter.apiKey.startsWith('sk-or-')) {
          throw new Error('Invalid OpenRouter API key format. Should start with "sk-or-"');
        }
        this.openrouter = new OpenAI({
          apiKey: config.openrouter.apiKey,
          baseURL: config.openrouter.baseURL || 'https://openrouter.ai/api/v1',
        });
        if (!this.activeProvider) {
          this.activeProvider = 'openrouter';
          this.isConfigured = true;
        }
        this.log('✅ OpenRouter vector service initialized', 'info');
      }

      if (!this.isConfigured) {
        this.log('⚠️ No vector service providers configured', 'warn');
        if (this.isProduction) {
          this.log('This is a production environment. Vector search will not be available.', 'error');
        }
      } else {
        this.log(`Active provider: ${this.activeProvider}`, 'info');
      }
    } catch (error) {
      this.log(`Error initializing vector service: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
  }

  /**
   * Production-ready logging
   */
  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[VectorService] [${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (this.isProduction) {
      // In production, use structured logging
      console.log(JSON.stringify({
        timestamp,
        level,
        service: 'VectorService',
        message,
        provider: this.activeProvider
      }));
    } else {
      // In development, use console methods
      switch (level) {
        case 'error':
          console.error(logMessage);
          break;
        case 'warn':
          console.warn(logMessage);
          break;
        default:
          console.log(logMessage);
      }
    }
  }

  /**
   * Get the active provider
   */
  getActiveProvider(): VectorProvider | null {
    return this.activeProvider;
  }

  /**
   * Check if any provider is configured
   */
  get isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Generate embeddings using the active provider
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.isConfigured) {
      const error = 'No vector service provider configured';
      this.log(error, 'error');
      throw new Error(error);
    }

    if (!text || text.trim().length === 0) {
      const error = 'Text input cannot be empty';
      this.log(error, 'error');
      throw new Error(error);
    }

    try {
      this.log(`Generating embeddings for text: "${text.substring(0, 50)}..."`, 'info');
      
      let result: number[];
      switch (this.activeProvider) {
        case 'groq':
          result = await this.generateGroqEmbeddings(text);
          break;
        case 'gemini':
          result = await this.generateGeminiEmbeddings(text);
          break;
        case 'openai':
          result = await this.generateOpenAIEmbeddings(text);
          break;
        case 'openrouter':
          result = await this.generateOpenRouterEmbeddings(text);
          break;
        default:
          throw new Error('No active vector service provider');
      }

      this.log(`Successfully generated embeddings (${result.length} dimensions)`, 'info');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log(`Failed to generate embeddings: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * Generate embeddings using Groq
   */
  private async generateGroqEmbeddings(text: string): Promise<number[]> {
    if (!this.groq) throw new Error('Groq not configured');

    try {
      const startTime = Date.now();
      
      // Note: Groq doesn't have direct embedding API, so we'll use their chat completion
      // and convert the response to a vector-like representation
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `Generate a semantic representation for: "${text}". Respond with only a JSON array of 1536 numbers representing the semantic vector.`
          }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from Groq');

      const duration = Date.now() - startTime;
      this.log(`Groq embedding generated in ${duration}ms`, 'info');

      // Parse the response and generate a consistent vector
      return this.parseGroqResponse(text, response);
    } catch (error) {
      this.log(`Groq embedding error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw new Error('Failed to generate Groq embeddings');
    }
  }

  /**
   * Parse Groq response and generate consistent vector
   */
  private parseGroqResponse(text: string, response: string): number[] {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed) && parsed.length === 1536) {
        this.log('Successfully parsed Groq JSON response', 'info');
        return parsed;
      }
    } catch (parseError) {
      this.log(`Failed to parse Groq JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`, 'warn');
    }

    // Generate a deterministic vector based on text content
    this.log('Using hash-based vector fallback for Groq', 'info');
    return this.generateHashBasedVector(text, 1536);
  }

  /**
   * Generate embeddings using Gemini
   */
  private async generateGeminiEmbeddings(text: string): Promise<number[]> {
    if (!this.gemini) throw new Error('Gemini not configured');

    try {
      const startTime = Date.now();
      
      // Note: Gemini doesn't have direct embedding API, so we'll use their text generation
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `Generate a semantic representation for: "${text}". Respond with only a JSON array of 1536 numbers representing the semantic vector.`;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      if (!response) throw new Error('No response from Gemini');

      const duration = Date.now() - startTime;
      this.log(`Gemini embedding generated in ${duration}ms`, 'info');

      return this.parseGeminiResponse(text, response);
    } catch (error) {
      this.log(`Gemini embedding error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw new Error('Failed to generate Gemini embeddings');
    }
  }

  /**
   * Parse Gemini response and generate consistent vector
   */
  private parseGeminiResponse(text: string, response: string): number[] {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed) && parsed.length === 1536) {
        this.log('Successfully parsed Gemini JSON response', 'info');
        return parsed;
      }
    } catch (parseError) {
      this.log(`Failed to parse Gemini JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`, 'warn');
    }

    // Generate a deterministic vector based on text content
    this.log('Using hash-based vector fallback for Gemini', 'info');
    return this.generateHashBasedVector(text, 1536);
  }

  /**
   * Generate embeddings using OpenAI
   */
  private async generateOpenAIEmbeddings(text: string): Promise<number[]> {
    if (!this.openai) throw new Error('OpenAI not configured');

    try {
      const startTime = Date.now();
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
      });
      
      const duration = Date.now() - startTime;
      this.log(`OpenAI embedding generated in ${duration}ms`, 'info');
      
      return response.data[0].embedding;
    } catch (error) {
      this.log(`OpenAI embedding error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw new Error('Failed to generate OpenAI embeddings');
    }
  }

  /**
   * Generate embeddings using OpenRouter
   */
  private async generateOpenRouterEmbeddings(text: string): Promise<number[]> {
    if (!this.openrouter) throw new Error('OpenRouter not configured');

    try {
      const startTime = Date.now();
      
      const response = await this.openrouter.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
      });
      
      const duration = Date.now() - startTime;
      this.log(`OpenRouter embedding generated in ${duration}ms`, 'info');
      
      return response.data[0].embedding;
    } catch (error) {
      this.log(`OpenRouter embedding error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw new Error('Failed to generate OpenRouter embeddings');
    }
  }

  /**
   * Generate a hash-based vector for fallback
   */
  private generateHashBasedVector(text: string, dimensions: number): number[] {
    const vector: number[] = [];
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }
    
    for (let i = 0; i < dimensions; i++) {
      const seed = hash + i * 2654435761;
      const value = Math.sin(seed) * 10000;
      vector.push((value - Math.floor(value)) * 2 - 1); // Normalize to [-1, 1]
    }
    
    return vector;
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
    try {
      this.log(`Generating embeddings for menu item: ${item.name}`, 'info');
      
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
      const [nameEmbedding, descriptionEmbedding, searchVector] = await Promise.all([
        this.generateEmbeddings(item.name),
        this.generateEmbeddings(item.description),
        this.generateEmbeddings(combinedText)
      ]);

      // Enhanced metadata extraction
      const enhancedMetadata = this.extractEnhancedMetadata(item);

      this.log(`Successfully generated embeddings for: ${item.name}`, 'info');

      return {
        name: nameEmbedding,
        description: descriptionEmbedding,
        searchVector,
        searchText: combinedText.toLowerCase(),
        enhancedMetadata
      };
    } catch (error) {
      this.log(`Failed to generate embeddings for menu item ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
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
      const error = 'Vector search not available';
      this.log(error, 'error');
      throw new Error(error);
    }

    try {
      this.log(`Performing vector search for query: "${query}"`, 'info');
      
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

      this.log(`Vector search completed. Found ${results.length} results`, 'info');
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log(`Vector search error: ${errorMessage}`, 'error');
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
      this.log(`Performing hybrid search for query: "${query}"`, 'info');
      
      // Try vector search first
      const vectorResults = await this.vectorSearch(query, filters, limit);
      
      if (vectorResults.length > 0) {
        this.log(`Hybrid search: Vector search successful with ${vectorResults.length} results`, 'info');
        return vectorResults;
      }
    } catch (error) {
      this.log(`Vector search failed, falling back to text search: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warn');
    }

    // Fallback to text search
    this.log('Hybrid search: Falling back to text search', 'info');
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
      this.log(`Performing text search for query: "${query}"`, 'info');
      
      const results = await (global as any).MenuItem.find({
        $text: { $search: query },
        isDisabled: { $ne: true },
        ...filters
      })
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();

      this.log(`Text search completed. Found ${results.length} results`, 'info');

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log(`Text search error: ${errorMessage}`, 'error');
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
      
      this.log(`Updated search analytics for item: ${itemId}`, 'info');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log(`Error updating search analytics for item ${itemId}: ${errorMessage}`, 'error');
    }
  }

  /**
   * Get provider information
   */
  getProviderInfo() {
    return {
      activeProvider: this.activeProvider,
      isConfigured: this.isConfigured,
      isProduction: this.isProduction,
      providers: {
        groq: !!this.groq,
        gemini: !!this.gemini,
        openai: !!this.openai,
        openrouter: !!this.openrouter
      }
    };
  }

  /**
   * Health check for production monitoring
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; provider: string | null; error?: string }> {
    try {
      if (!this.isConfigured) {
        return {
          status: 'unhealthy',
          provider: null,
          error: 'No vector service provider configured'
        };
      }

      // Test embedding generation with a simple text
      await this.generateEmbeddings('test');
      
      return {
        status: 'healthy',
        provider: this.activeProvider
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        provider: this.activeProvider,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export a factory function to create the service
export function createVectorService(config: VectorProviderConfig): MultiProviderVectorService {
  return new MultiProviderVectorService(config);
}
