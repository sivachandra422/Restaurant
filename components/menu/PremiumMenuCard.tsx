'use client';

import React, { useEffect } from 'react';
import { Plus, Minus, Star, Leaf, Zap } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MenuItem } from '@/data/sriKanyaMenu';
import { getFoodImage, getFallbackImage } from '@/lib/imageMappings';
import { useCart } from '@/contexts/CartContext';

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
  const { getMaxQuantity } = useCart();
  
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  // Get the proper image URL for this item
  const imageUrl = getFoodImage(item.id);

  // Get item-specific limits
  const maxQuantity = getMaxQuantity(item);
  const isAtMaxQuantity = quantity >= maxQuantity;

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAdd();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  };

  const handleIncreaseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAtMaxQuantity) {
      onUpdateQuantity(quantity + 1);
    }
  };

  const handleDecreaseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      onUpdateQuantity(quantity - 1);
    } else {
      onRemove();
    }
  };

  return (
    <Card className="group overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-24 sm:h-28 md:h-32 lg:h-36 overflow-hidden">
          {/* Loading Placeholder */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-xl sm:text-2xl lg:text-3xl">🍽️</div>
            </div>
          )}
          
          <Image
            src={imageError ? getFallbackImage(item.category) : imageUrl}
            alt={item.name}
            fill
            className={`object-cover transition-all duration-500 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            } group-hover:scale-105`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Special Badges - Only Signature and Special */}
          <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5">
            {item.isSignature && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-medium text-xs px-1.5 py-0.5 shadow-sm">
                <Star className="w-2.5 h-2.5 mr-0.5" />
                Signature
              </Badge>
            )}
            {item.isSpecial && (
              <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 font-medium text-xs px-1.5 py-0.5 shadow-sm">
                <Zap className="w-2.5 h-2.5 mr-0.5" />
                Special
              </Badge>
            )}
            {item.isVeg && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 font-medium text-xs px-1.5 py-0.5 shadow-sm">
                <Leaf className="w-2.5 h-2.5 mr-0.5" />
                Veg
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-2.5 sm:p-3 lg:p-4">
          {/* Title and Description */}
          <div className="mb-2.5 sm:mb-3">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight mb-1 sm:mb-1.5 line-clamp-2">
              {item.name}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-2 sm:mb-2.5">
              {item.description}
            </p>
            
            {/* Price Display */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-base sm:text-lg lg:text-xl text-gray-900">
                ₹{item.price}
              </span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            {quantity === 0 ? (
              <Button
                onClick={handleAddClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm text-xs sm:text-sm"
                disabled={isAtMaxQuantity}
              >
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 w-full">
                <Button
                  onClick={handleDecreaseClick}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full w-6 h-6 sm:w-7 sm:h-7 p-0 flex items-center justify-center transition-all duration-300 shadow-sm"
                >
                  <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Button>
                
                <span className="font-bold text-gray-900 min-w-[1.25rem] sm:min-w-[1.5rem] text-center text-sm sm:text-base">
                  {quantity}
                </span>
                
                <Button
                  onClick={handleIncreaseClick}
                  className={`rounded-full w-6 h-6 sm:w-7 sm:h-7 p-0 flex items-center justify-center transition-all duration-300 shadow-sm ${
                    isAtMaxQuantity
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  disabled={isAtMaxQuantity}
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Button>
                
                <Button
                  onClick={handleRemoveClick}
                  className="ml-auto bg-red-500 hover:bg-red-600 text-white text-xs px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg transition-all duration-300 shadow-sm"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
