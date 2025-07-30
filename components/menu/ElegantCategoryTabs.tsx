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
        <div className="flex space-x-4 p-4 pb-6 min-w-max">
          {categories.map((category) => {
            const isActive = category.id === activeCategory;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group relative px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation flex-shrink-0 min-w-[200px] max-w-[220px] ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                }`}
              >
                {/* Icon */}
                <div className={`text-2xl mb-3 transition-transform duration-300 ${
                  isActive ? 'transform scale-110' : 'group-hover:scale-110'
                }`}>
                  {category.icon}
                </div>
                
                {/* Category Name */}
                <div className="font-semibold text-sm mb-2 leading-tight">
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
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
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