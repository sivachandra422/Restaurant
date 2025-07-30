'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
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
  // Safety check for undefined categories
  if (!categories || !Array.isArray(categories)) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="w-full">
      <ScrollArea className="w-full" type="always">
        <div className="flex space-x-2 sm:space-x-3 p-2 sm:p-4 pb-4 sm:pb-6 min-w-max">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              onClick={() => onCategoryChange(category.id)}
              className={`
                relative px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex-shrink-0 whitespace-nowrap min-w-[140px] sm:min-w-[180px] md:min-w-[200px]
                ${activeCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/30 border-0'
                  : 'bg-white/90 backdrop-blur-sm border-2 border-orange-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 shadow-lg'
                }
                group
              `}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`
                  w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0
                  ${activeCategory === category.id
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-orange-100 group-hover:bg-orange-200'
                  }
                `}>
                  <span className="text-sm sm:text-lg md:text-xl">{category.icon}</span>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-bold text-xs sm:text-sm md:text-sm">{category.name}</div>
                  <div className={`
                    text-xs opacity-75 transition-opacity hidden sm:block
                    ${activeCategory === category.id ? 'text-white/90' : 'text-gray-500'}
                  `}>
                    {category.description}
                  </div>
                </div>
              </div>
              
              {/* Active indicator */}
              {activeCategory === category.id && (
                <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-8 sm:w-12 h-0.5 sm:h-1 bg-white rounded-full shadow-sm" />
              )}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}