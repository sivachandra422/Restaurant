'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, X, Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  itemId: string;
  itemName: string;
  searchScore: number;
  category: string;
  price: number;
  isVeg: boolean;
  reason: string;
  description: string;
  image: string;
  popularity: number;
  isSignature: boolean;
  isSpecial: boolean;
}

interface SearchFilters {
  category: string;
  priceRange: [number, number];
  dietary: string;
  spiceLevel: number;
  sortBy: string;
}

interface VectorSearchComponentProps {
  onItemSelect: (item: SearchResult) => void;
  onSearchResults: (results: SearchResult[]) => void;
  className?: string;
}

export function VectorSearchComponent({ 
  onItemSelect, 
  onSearchResults, 
  className = '' 
}: VectorSearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMethod, setSearchMethod] = useState<string>('');
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string>('');
  
  // Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    priceRange: [0, 1000],
    dietary: 'all',
    spiceLevel: 5,
    sortBy: 'relevance'
  });

  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Search categories
  const searchCategories = [
    { id: 'all', name: 'All Categories' },
    { id: 'biryanis', name: 'Biryanis' },
    { id: 'curries', name: 'Curries' },
    { id: 'starters', name: 'Starters' },
    { id: 'rice', name: 'Rice & Noodles' },
    { id: 'breads', name: 'Breads' },
    { id: 'desserts', name: 'Desserts' }
  ];

  // Dietary options
  const dietaryOptions = [
    { id: 'all', name: 'All' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'non-vegetarian', name: 'Non-Vegetarian' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'relevance', name: 'Best Match' },
    { id: 'price', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'popularity', name: 'Most Popular' },
    { id: 'name', name: 'Name A-Z' }
  ];

  // Perform search
  const performSearch = useCallback(async (query: string, searchFilters: SearchFilters) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch('/api/menu/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          filters: {
            category: searchFilters.category !== 'all' ? searchFilters.category : undefined,
            priceRange: {
              min: searchFilters.priceRange[0],
              max: searchFilters.priceRange[1]
            },
            dietary: searchFilters.dietary !== 'all' ? searchFilters.dietary : undefined,
            spiceLevel: searchFilters.spiceLevel
          },
          searchType: 'hybrid',
          limit: 50,
          sortBy: searchFilters.sortBy
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
        setTotalResults(data.total);
        setSearchMethod(data.searchMethod);
        onSearchResults(data.results);
      } else {
        throw new Error(data.error || 'Search failed');
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  }, [onSearchResults]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (debouncedQuery) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(debouncedQuery, filters);
      }, 100);
    } else {
      setSearchResults([]);
      setTotalResults(0);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedQuery, filters, performSearch]);

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Trigger search with new filters
    if (searchQuery.trim()) {
      performSearch(searchQuery, newFilters);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      category: 'all',
      priceRange: [0, 1000],
      dietary: 'all',
      spiceLevel: 5,
      sortBy: 'relevance'
    };
    setFilters(defaultFilters);
    
    if (searchQuery.trim()) {
      performSearch(searchQuery, defaultFilters);
    }
  };

  // Get search method icon
  const getSearchMethodIcon = () => {
    switch (searchMethod) {
      case 'vector':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'hybrid':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'text':
        return <Search className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search for dishes, ingredients, or flavors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-lg border-2 focus:border-orange-500 focus:ring-orange-500"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Stats */}
      {searchQuery && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            {getSearchMethodIcon()}
            <span>
              {isSearching ? 'Searching...' : `${totalResults} results found`}
            </span>
            {searchMethod && (
              <Badge variant="outline" className="text-xs">
                {searchMethod} search
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card className="border-2 border-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Search Filters
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {searchCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => handleFilterChange('priceRange', value)}
                max={1000}
                min={0}
                step={50}
                className="w-full"
              />
            </div>

            {/* Dietary Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Dietary Preference
              </label>
              <Select
                value={filters.dietary}
                onValueChange={(value) => handleFilterChange('dietary', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dietaryOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Spice Level Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Max Spice Level: {filters.spiceLevel}/5
              </label>
              <Slider
                value={[filters.spiceLevel]}
                onValueChange={(value) => handleFilterChange('spiceLevel', value[0])}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Search Results
          </h3>
          
          {searchResults.map((result, index) => (
            <Card 
              key={result.itemId} 
              className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-orange-500"
              onClick={() => onItemSelect(result)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Item Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {result.image ? (
                      <Image 
                        src={result.image} 
                        alt={result.itemName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {result.itemName}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-orange-600">
                          ₹{result.price}
                        </span>
                        {result.isVeg && (
                          <Badge variant="secondary" className="text-xs">
                            🥬 Veg
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {result.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="capitalize">{result.category}</span>
                      {result.isSignature && (
                        <Badge variant="outline" className="text-orange-600">
                          <Star className="w-3 h-3 mr-1" />
                          Signature
                        </Badge>
                      )}
                      {result.isSpecial && (
                        <Badge variant="outline" className="text-purple-600">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Special
                        </Badge>
                      )}
                      {result.popularity > 7 && (
                        <Badge variant="outline" className="text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>

                    {/* Search Relevance */}
                    <div className="mt-2 text-xs text-gray-400">
                      {result.reason} • Score: {result.searchScore.toFixed(3)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchQuery && !isSearching && searchResults.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600">No dishes found matching &quot;{searchQuery}&quot;</p>
          <p className="text-sm text-gray-400 mt-1">
            Try different keywords or adjust your filters
          </p>
        </div>
      )}
    </div>
  );
}
