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
    <div className="w-full">
      {/* Horizontal Scroll for All Screen Sizes */}
      <ScrollArea className="w-full" type="always">
        <div className="flex space-x-3 p-4 pb-6 min-w-max">
          {categories.map((category) => {
            const isActive = category.id === activeCategory;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group relative px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0 min-w-[140px] max-w-[160px] ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                }`}
              >
                {/* Icon */}
                <div className={`text-xl mb-2 transition-transform duration-300 ${
                  isActive ? 'transform scale-110' : 'group-hover:scale-110'
                }`}>
                  {category.icon}
                </div>
                
                {/* Category Name */}
                <div className="font-semibold text-sm mb-1 leading-tight">
                  {category.name}
                </div>
                
                {/* Description */}
                <div className={`text-xs leading-tight line-clamp-2 ${
                  isActive ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  {category.description}
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
                )}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}