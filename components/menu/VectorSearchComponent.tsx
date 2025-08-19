'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, ChefHat, Star, Clock, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MenuItem } from '@/data/sriKanyaMenu';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { transliterateFriendly } from '@/lib/friendlyTransliteration';

interface VectorSearchComponentProps {
  items: MenuItem[];
  onSearchResults: (results: MenuItem[]) => void;
  className?: string;
}

export function VectorSearchComponent({ 
  items, 
  onSearchResults, 
  className = '' 
}: VectorSearchComponentProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced search with multiple criteria
  const performSearch = async (query: string, filters: Set<string>) => {
    if (!query.trim() && filters.size === 0) {
      setSearchResults([]);
      onSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let results = items.filter(item => {
                 // Text search across multiple fields
         const searchText = query.toLowerCase();
         const itemText = [
           item.name.toLowerCase(),
           item.description?.toLowerCase() || '',
           item.category.toLowerCase(),
           item.isSignature ? 'signature' : '',
           item.isSpecial ? 'special' : '',
           item.trending ? 'trending' : ''
         ].join(' ').toLowerCase();
        
        const textMatch = !query.trim() || itemText.includes(searchText);
        
        // Filter matching
        const filterMatch = filters.size === 0 || Array.from(filters).every(filter => {
          switch (filter) {
            case 'veg':
              return item.isVeg;
            case 'nonveg':
              return !item.isVeg;
            case 'signature':
              return item.isSignature;
            case 'trending':
              return item.trending;
                         case 'quick':
               return item.preparationTime && item.preparationTime <= 15;
            case 'premium':
              return item.price >= 200;
            default:
              return true;
          }
        });
        
        return textMatch && filterMatch;
      });
      
      // Sort results by relevance and popularity
      results.sort((a, b) => {
        let score = 0;
        
        // Exact name match gets highest priority
        if (query.trim() && a.name.toLowerCase().includes(query.toLowerCase())) score += 10;
        if (query.trim() && b.name.toLowerCase().includes(query.toLowerCase())) score -= 10;
        
        // Signature items get priority
        if (a.isSignature) score += 5;
        if (b.isSignature) score -= 5;
        
        // Trending items get priority
        if (a.trending) score += 3;
        if (b.trending) score -= 3;
        
        return score;
      });
      
      setSearchResults(results);
      onSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, activeFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeFilters]);

  // Filter management
  const toggleFilter = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters(new Set());
    setSearchQuery('');
  };

  // Available filters
  const availableFilters = [
    { key: 'veg', label: t('vegetarian', language), icon: Leaf, color: 'bg-success-100 text-success-700 border-success-200' },
    { key: 'nonveg', label: t('non_vegetarian', language), icon: ChefHat, color: 'bg-error-100 text-error-700 border-error-200' },
    { key: 'signature', label: t('signature', language), icon: Star, color: 'bg-warning-100 text-warning-700 border-warning-200' },
    { key: 'trending', label: t('trending', language), icon: Star, color: 'bg-info-100 text-info-700 border-info-200' },
    { key: 'quick', label: t('quick_service', language), icon: Clock, color: 'bg-primary-100 text-primary-700 border-primary-200' },
    { key: 'premium', label: t('premium', language), icon: Star, color: 'bg-warning-100 text-warning-700 border-warning-200' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            type="text"
            placeholder={t('search_menu_items', language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20 py-3 text-base border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl shadow-sm"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                showFilters 
                  ? 'bg-primary-100 text-primary-700 border-primary-200' 
                  : 'text-neutral-600 hover:text-primary-600'
              }`}
            >
              <Filter className="w-4 h-4 mr-1" />
              {t('filters', language)}
            </Button>
            {(searchQuery || activeFilters.size > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="px-2 py-1.5 text-neutral-500 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Search Status Indicator */}
        {isSearching && (
          <div className="absolute -bottom-8 left-0 text-sm text-neutral-500 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span>{t('searching', language)}...</span>
          </div>
        )}
      </div>

      {/* Enhanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-neutral-900">{t('filter_by', language)}</h3>
            {activeFilters.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                {t('clear_all', language)}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableFilters.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  activeFilters.has(key)
                    ? `${color} border-current shadow-sm`
                    : 'border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilters.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(activeFilters).map(filter => {
            const filterInfo = availableFilters.find(f => f.key === filter);
            return (
              <Badge
                key={filter}
                variant="secondary"
                className="px-3 py-1.5 bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200 transition-colors duration-200"
              >
                {filterInfo?.label}
                <button
                  onClick={() => toggleFilter(filter)}
                  className="ml-2 hover:text-primary-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Search Results Summary */}
      {searchQuery || activeFilters.size > 0 ? (
        <div className="text-sm text-neutral-600">
          {searchResults.length > 0 ? (
            <span>
              {t('found', language)} <strong>{searchResults.length}</strong> {t('items', language)}
              {searchQuery && ` ${t('for', language)} "${searchQuery}"`}
            </span>
          ) : !isSearching ? (
            <span className="text-neutral-500">
              {t('no_items_found', language)}
              {searchQuery && ` ${t('for', language)} "${searchQuery}"`}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
