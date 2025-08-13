import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';
import { createVectorService } from '@/lib/services/multiProviderVectorService';
import { loadVectorConfig } from '@/lib/config/vectorConfig';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { 
      query, 
      filters = {}, 
      searchType = 'hybrid', // 'vector', 'text', 'hybrid'
      limit = 20,
      category,
      priceRange,
      dietary,
      spiceLevel,
      sortBy = 'relevance' // 'relevance', 'price', 'popularity', 'name'
    } = await request.json();

    // Initialize vector service
    const vectorConfig = loadVectorConfig();
    const vectorService = createVectorService(vectorConfig);

    // Validate query
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        error: 'Search query must be at least 2 characters long' 
      }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 503 });
    }

    // Build filters
    const searchFilters: any = { isDisabled: { $ne: true } };
    
    if (category && category !== 'all') {
      searchFilters.category = category;
    }
    
    if (priceRange) {
      if (priceRange.min !== undefined) searchFilters.price = { $gte: priceRange.min };
      if (priceRange.max !== undefined) {
        if (searchFilters.price) {
          searchFilters.price.$lte = priceRange.max;
        } else {
          searchFilters.price = { $lte: priceRange.max };
        }
      }
    }
    
    if (dietary) {
      if (dietary === 'vegetarian') searchFilters.isVeg = true;
      if (dietary === 'non-vegetarian') searchFilters.isVeg = false;
    }
    
    if (spiceLevel) {
      searchFilters['enhancedMetadata.spiceLevel'] = { $lte: spiceLevel };
    }

    let searchResults: any[] = [];
    let searchMethod = '';

    try {
      // Perform search based on type
      switch (searchType) {
        case 'vector':
          if (vectorService.isServiceConfigured) {
            searchResults = await vectorService.vectorSearch(query, searchFilters, limit);
            searchMethod = `vector-${vectorService.getActiveProvider()}`;
          } else {
            throw new Error('Vector search not available');
          }
          break;

        case 'text':
          searchResults = await performTextSearch(query, searchFilters, limit);
          searchMethod = 'text';
          break;

        case 'hybrid':
        default:
          try {
            searchResults = await vectorService.hybridSearch(query, searchFilters, limit);
            searchMethod = `hybrid-${vectorService.getActiveProvider()}`;
          } catch (error) {
            console.log('Hybrid search failed, falling back to text search');
            searchResults = await performTextSearch(query, searchFilters, limit);
            searchMethod = 'text';
          }
          break;
      }

      // Apply sorting
      if (sortBy !== 'relevance') {
        searchResults = sortSearchResults(searchResults, sortBy);
      }

      // Update search analytics for clicked items
      if (searchResults.length > 0) {
        await Promise.all(
          searchResults.map((result, index) => 
            vectorService.updateSearchAnalytics(result.itemId, index + 1)
          )
        );
      }

      // Get full menu item details for results
      const itemIds = searchResults.map(result => result.itemId);
      const fullItems = await MenuItem.find({ 
        id: { $in: itemIds } 
      }).lean();

      // Merge search results with full item details
      const enrichedResults = searchResults.map(result => {
        const fullItem = fullItems.find(item => item.id === result.itemId);
        return {
          ...result,
          ...fullItem,
          searchScore: result.searchScore,
          reason: result.reason
        };
      });

      return NextResponse.json({
        success: true,
        results: enrichedResults,
        total: enrichedResults.length,
        searchMethod,
        query,
        filters: searchFilters,
        metadata: {
          searchType,
          limit,
          sortBy,
          timestamp: new Date().toISOString()
        }
      });

    } catch (searchError) {
      console.error('Search error:', searchError);
      
      // Fallback to basic text search
      try {
        searchResults = await performTextSearch(query, searchFilters, limit);
        searchMethod = 'fallback_text';
        
        return NextResponse.json({
          success: true,
          results: searchResults,
          total: searchResults.length,
          searchMethod,
          query,
          filters: searchFilters,
          warning: 'Advanced search failed, using fallback method',
          metadata: {
            searchType: 'fallback',
            limit,
            sortBy,
            timestamp: new Date().toISOString()
          }
        });
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        return NextResponse.json({
          error: 'Search service temporarily unavailable',
          fallback: true
        }, { status: 503 });
      }
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Perform traditional text search using MongoDB text index
 */
async function performTextSearch(query: string, filters: any, limit: number) {
  const results = await MenuItem.find({
    $text: { $search: query },
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
    reason: 'Text search match',
    ...item
  }));
}

/**
 * Sort search results by different criteria
 */
function sortSearchResults(results: any[], sortBy: string) {
  switch (sortBy) {
    case 'price':
      return results.sort((a, b) => a.price - b.price);
    case 'price-high':
      return results.sort((a, b) => b.price - a.price);
    case 'popularity':
      return results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case 'name':
      return results.sort((a, b) => a.itemName.localeCompare(b.itemName));
    case 'relevance':
    default:
      return results; // Already sorted by relevance
  }
}

/**
 * GET endpoint for simple search queries
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json({ 
        error: 'Query parameter "q" is required' 
      }, { status: 400 });
    }

    // Convert GET request to POST format
    const postData = {
      query,
      filters: { category: category || 'all' },
      searchType: 'hybrid',
      limit
    };

    // Create a mock request object for POST method
    const mockRequest = {
      json: () => Promise.resolve(postData)
    } as NextRequest;

    return POST(mockRequest);

  } catch (error) {
    console.error('GET search error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
