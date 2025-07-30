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
    <Card className="group overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {/* Loading Placeholder */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-4xl">🍽️</div>
            </div>
          )}
          
          <Image
            src={imageError ? getFallbackImage(item.category) : imageUrl}
            alt={item.name}
            fill
            className={`object-cover transition-all duration-500 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          
          {/* Overlay with category info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Special Badges - Only Signature and Special */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {item.isSignature && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-medium text-xs px-2 py-1">
                <Star className="w-3 h-3 mr-1" />
                Signature
              </Badge>
            )}
            {item.isSpecial && (
              <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 font-medium text-xs px-2 py-1">
                <Zap className="w-3 h-3 mr-1" />
                Special
              </Badge>
            )}
            {item.isVeg && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 font-medium text-xs px-2 py-1">
                <Leaf className="w-3 h-3 mr-1" />
                Veg
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title and Description */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
              {item.name}
            </h3>
            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-3">
              {item.description}
            </p>
            
            {/* Price Display */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-gray-900">
                ₹{item.price}
              </span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            {quantity === 0 ? (
              <Button
                onClick={handleAddClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                disabled={isAtMaxQuantity}
              >
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <Button
                  onClick={handleDecreaseClick}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all duration-200"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                  {quantity}
                </span>
                
                <Button
                  onClick={handleIncreaseClick}
                  className={`rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all duration-200 ${
                    isAtMaxQuantity
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  disabled={isAtMaxQuantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={handleRemoveClick}
                  className="ml-auto bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition-all duration-200"
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
