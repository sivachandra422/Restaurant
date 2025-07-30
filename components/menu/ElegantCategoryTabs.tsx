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
      {/* Compact Horizontal Scroll for All Screen Sizes */}
      <ScrollArea className="w-full" type="always">
        <div className="flex space-x-2 p-2 pb-3 min-w-max">
          {categories.map((category) => {
            const isActive = category.id === activeCategory;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group relative px-2.5 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0 min-w-[100px] max-w-[120px] ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                    : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200'
                }`}
              >
                {/* Icon */}
                <div className={`text-base mb-1 transition-transform duration-300 ${
                  isActive ? 'transform scale-110' : 'group-hover:scale-110'
                }`}>
                  {category.icon}
                </div>
                
                {/* Category Name */}
                <div className="font-semibold text-xs mb-1 leading-tight">
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
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>
    </div>
  );
}