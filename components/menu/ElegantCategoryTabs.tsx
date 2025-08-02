'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ElegantCategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ElegantCategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: ElegantCategoryTabsProps) {
  return (
    <div className="w-full bg-white">
      {/* Horizontal Scroll for All Screen Sizes */}
      <ScrollArea className="w-full" type="always">
        <div className="flex space-x-3 sm:space-x-4 p-3 sm:p-4 pb-4 sm:pb-6 min-w-max">
          {categories.map((category, index) => {
            const isActive = category.id === activeCategory;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group relative px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation flex-shrink-0 min-w-[160px] sm:min-w-[180px] max-w-[180px] sm:max-w-[220px] focus-ring ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-glow'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200 hover:border-orange-200'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Icon */}
                <div className={`text-xl sm:text-2xl mb-2 sm:mb-3 transition-all duration-300 ${
                  isActive ? 'transform scale-110' : 'group-hover:scale-110'
                }`}>
                  {category.icon}
                </div>
                
                {/* Category Name */}
                <div className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2 leading-tight">
                  {category.name}
                </div>
                
                {/* Description */}
                <div className={`text-xs leading-tight line-clamp-2 transition-colors duration-200 ${
                  isActive ? 'text-orange-100' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {category.description}
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-lg pulse-glow" />
                )}
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-lg sm:rounded-xl transition-opacity duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 opacity-0' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-10'
                }`} />
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1 sm:h-2" />
      </ScrollArea>
    </div>
  );
}