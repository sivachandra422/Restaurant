'use client';

import React, { useEffect } from 'react';
import { Plus, Minus, Star, Leaf, Zap } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MenuItem } from '@/data/sriKanyaMenu';
import { getFoodImage, getFallbackImage } from '@/lib/imageMappings';

interface PremiumMenuCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function PremiumMenuCard({ 
  item, 
  quantity, 
  onAdd, 
  onRemove, 
  onUpdateQuantity 
}: PremiumMenuCardProps) {
  const getImageByCategory = (category: string, itemName: string) => {
    const categoryStyles: { [key: string]: { emoji: string; gradient: string; text: string; bgEmoji: string } } = {
      biryanis: {
        emoji: '🍛',
        gradient: 'from-orange-200 to-amber-200',
        text: 'Premium Biryani',
        bgEmoji: '🍚'
      },
      vegCurries: {
        emoji: '🥗',
        gradient: 'from-green-200 to-emerald-200',
        text: 'Fresh Veg Curry',
        bgEmoji: '🥬'
      },
      nonVegCurries: {
        emoji: '🍗',
        gradient: 'from-red-200 to-orange-200',
        text: 'Tender Meat Curry',
        bgEmoji: '🥩'
      },
      friedRiceNoodles: {
        emoji: '🍜',
        gradient: 'from-yellow-200 to-orange-200',
        text: 'Indo-Chinese',
        bgEmoji: '🍚'
      },
      breadsRoti: {
        emoji: '🫓',
        gradient: 'from-amber-200 to-yellow-200',
        text: 'Fresh Bread',
        bgEmoji: '🌾'
      }
    };

    const style = categoryStyles[category] || {
      emoji: '🍽️',
      gradient: 'from-gray-200 to-gray-300',
      text: 'Delicious Dish',
      bgEmoji: '🍽️'
    };

    // Create variety based on item name and category
    const emojiVariations: { [key: string]: string[] } = {
      biryanis: ['🍛', '🍲', '🥘', '🍱', '🍽️'],
      vegCurries: ['🥗', '🥬', '🥦', '🥕', '🍆'],
      nonVegCurries: ['🍗', '🥩', '🍖', '🦐', '🐟'],
      friedRiceNoodles: ['🍜', '🍚', '🥢', '🍝', '🍲'],
      breadsRoti: ['🫓', '🥖', '🥨', '🥯', '🍞']
    };

    const variations = emojiVariations[category] || ['🍽️', '🍲', '🥘', '🍱', '🍽️'];
    const emojiIndex = itemName.length % variations.length;
    const selectedEmoji = variations[emojiIndex];

    return { ...style, emoji: selectedEmoji };
  };

  const imageStyle = getImageByCategory(item.category, item.name);
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  // Get the proper image URL for this item
  const imageUrl = getFoodImage(item.id);

  // Debug logging
  console.log(`PremiumMenuCard ${item.name}: quantity = ${quantity}`);

  useEffect(() => {
    console.log(`PremiumMenuCard ${item.name}: Quantity prop changed to ${quantity}`);
  }, [quantity, item.name]);

  // Handle button clicks with proper event handling
  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Adding ${item.name} to cart - CLICKED!`);
    onAdd();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Removing ${item.name} from cart - CLICKED!`);
    onRemove();
  };

  const handleIncreaseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newQuantity = quantity + 1;
    console.log(`Increasing quantity for ${item.name} to ${newQuantity} - CLICKED!`);
    if (newQuantity <= 10) {
      onUpdateQuantity(newQuantity);
    }
  };

  const handleDecreaseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newQuantity = quantity - 1;
    console.log(`Decreasing quantity for ${item.name} to ${newQuantity} - CLICKED!`);
    if (newQuantity >= 0) {
      onUpdateQuantity(newQuantity);
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl h-full flex flex-col">
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className={`aspect-[3/2] sm:aspect-[4/3] bg-gradient-to-br ${imageStyle.gradient} flex items-center justify-center relative`}>
            {/* Loading State */}
            {imageLoading && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
              </div>
            )}
            
            {/* Actual Food Image */}
            {!imageError && imageUrl && (
              <div className="absolute inset-0">
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageLoading(false)}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  priority={false}
                />
                {/* Professional overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            )}
            
            {/* Fallback/Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl sm:text-6xl">{imageStyle.bgEmoji}</span>
              </div>
            </div>
            
            {/* Main Content - Only show if image failed to load */}
            {imageError && (
              <div className="relative z-10 w-full h-full bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl sm:text-5xl mb-2 sm:mb-3 drop-shadow-lg">{imageStyle.emoji}</div>
                  <div className="text-xs sm:text-xs text-gray-700 font-medium bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    {imageStyle.text}
                  </div>
                </div>
              </div>
            )}
            
            {/* Decorative Elements - Only show if image failed to load */}
            {imageError && (
              <>
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 opacity-20">
                  <span className="text-lg sm:text-2xl">{imageStyle.bgEmoji}</span>
                </div>
                <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 opacity-20">
                  <span className="text-sm sm:text-xl">{imageStyle.emoji}</span>
                </div>
              </>
            )}
          </div>
          
          {/* Professional Badges */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
            {item.isSignature && (
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg font-semibold text-xs sm:text-xs px-1 sm:px-2 py-0.5 sm:py-0.5">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                Signature
              </Badge>
            )}
            {item.isSpecial && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg font-semibold text-xs sm:text-xs px-1 sm:px-2 py-0.5 sm:py-0.5">
                <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                Special
              </Badge>
            )}
            {item.isVeg && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg font-semibold text-xs sm:text-xs px-1 sm:px-2 py-0.5 sm:py-0.5">
                <Leaf className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                Veg
              </Badge>
            )}
          </div>

          {/* Price Badge */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <Badge className="bg-white/95 backdrop-blur-sm text-orange-600 border border-orange-200 shadow-lg font-bold text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
              ₹{item.price}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4 flex-1 flex flex-col">
          {/* Title and Description */}
          <div className="space-y-2 sm:space-y-3 flex-1">
            <h3 className="font-playfair text-sm sm:text-lg md:text-xl font-bold text-gray-800 leading-tight group-hover:text-orange-700 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
              {item.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-3 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[4rem]">
              {item.description}
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-1 sm:pt-2 mt-auto">
            {quantity > 0 ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={handleDecreaseClick}
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 shadow-md cursor-pointer active:scale-95 bg-white transition-all duration-200 z-10 relative focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  type="button"
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 mx-auto" />
                </button>
                <span className="w-8 sm:w-12 text-center font-bold text-gray-700 text-sm sm:text-lg select-none">
                  {quantity}
                </span>
                <button
                  onClick={handleIncreaseClick}
                  disabled={quantity >= 10}
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer active:scale-95 bg-white transition-all duration-200 z-10 relative focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  type="button"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 mx-auto" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-xl py-2 sm:py-3 cursor-pointer z-10 relative focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-xs sm:text-sm"
                type="button"
                aria-label={`Add ${item.name} to cart`}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 inline" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
