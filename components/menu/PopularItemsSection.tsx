'use client';

import React from 'react';
import { TrendingUp, Star, Flame } from 'lucide-react';
import { MenuItem } from '@/data/sriKanyaMenu';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useCustomerExperience } from '@/contexts/CustomerExperienceContext';
import { PremiumMenuCard } from './PremiumMenuCard';
import { useCart } from '@/contexts/CartContext';

interface PopularItemsSectionProps {
  allMenuItems: MenuItem[];
}

export function PopularItemsSection({ allMenuItems }: PopularItemsSectionProps) {
  const { getPopularItems, getTrendingItems } = useAnalytics();
  const { getWaitTime } = useCustomerExperience();
  const { state, addToCart, removeFromCart, updateQuantity } = useCart();

  // Get trending items from menu data
  const trendingItems = allMenuItems.filter(item => item.trending);
  
  // Get popular items (items with high popularity scores)
  const popularItems = allMenuItems.filter(item => item.popularity && item.popularity >= 8);

  // Combine and deduplicate
  const featuredItems = [...trendingItems, ...popularItems]
    .filter((item, index, self) => self.findIndex(t => t.id === item.id) === index)
    .slice(0, 6); // Show max 6 items

  if (featuredItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 sm:mb-10 lg:mb-12">
      {/* Section Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Popular & Trending
          </h2>
          <TrendingUp className="w-6 h-6 text-orange-500" />
        </div>
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          Discover our most loved dishes and trending favorites
        </p>
      </div>

      {/* Featured Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {featuredItems.map((item) => {
          const cartItem = state.items.find(cartItem => cartItem.id === item.id);
          const quantity = cartItem?.quantity || 0;

          return (
            <div key={item.id} className="relative">
              {/* Popular Badge */}
              {item.popularity && item.popularity >= 9 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
                    <Star className="w-3 h-3" />
                  </div>
                </div>
              )}
              
              <PremiumMenuCard
                item={item}
                quantity={quantity}
                onAdd={() => addToCart(item, 1)}
                onRemove={() => removeFromCart(item.id)}
                onUpdateQuantity={(newQuantity: number) => updateQuantity(item.id, newQuantity)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
} 