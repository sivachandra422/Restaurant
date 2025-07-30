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
      {/* Mobile: Horizontal Scroll */}
      <div className="block md:hidden">
        <ScrollArea className="w-full" type="always">
          <div className="flex space-x-3 p-2 pb-4 min-w-max">
            {categories.map((category) => {
              const isActive = category.id === activeCategory;
              
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`group relative px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 min-w-[160px] ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                  }`}
                >
                  {/* Icon */}
                  <div className={`text-xl mb-2 transition-transform duration-300 ${
                    isActive ? 'transform scale-110' : 'group-hover:scale-110'
                  }`}>
                    {category.icon}
                  </div>
                  
                  {/* Category Name */}
                  <div className="font-semibold text-sm mb-1">
                    {category.name}
                  </div>
                  
                  {/* Description */}
                  <div className={`text-xs leading-tight max-w-[140px] ${
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
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>

      {/* Desktop: Centered Layout */}
      <div className="hidden md:flex justify-center">
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 max-w-6xl">
          {categories.map((category) => {
            const isActive = category.id === activeCategory;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group relative px-6 py-4 lg:px-8 lg:py-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl shadow-orange-200'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-gray-200'
                }`}
              >
                {/* Icon */}
                <div className={`text-2xl lg:text-3xl mb-3 lg:mb-4 transition-transform duration-300 ${
                  isActive ? 'transform scale-110' : 'group-hover:scale-110'
                }`}>
                  {category.icon}
                </div>
                
                {/* Category Name */}
                <div className="font-semibold text-sm lg:text-base mb-2 lg:mb-3">
                  {category.name}
                </div>
                
                {/* Description */}
                <div className={`text-xs lg:text-sm leading-tight max-w-[200px] lg:max-w-[250px] ${
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
      </div>
    </div>
  );
}