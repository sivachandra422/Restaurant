'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

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
    <div className="flex justify-center">
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`group relative px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
              }`}
            >
              {/* Icon */}
              <div className={`text-2xl mb-2 transition-transform duration-300 ${
                isActive ? 'transform scale-110' : 'group-hover:scale-110'
              }`}>
                {category.icon}
              </div>
              
              {/* Category Name */}
              <div className="font-semibold text-sm mb-1">
                {category.name}
              </div>
              
              {/* Description */}
              <div className={`text-xs leading-tight max-w-[200px] ${
                isActive ? 'text-orange-100' : 'text-gray-500'
              }`}>
                {category.description}
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}