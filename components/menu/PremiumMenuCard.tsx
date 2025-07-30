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
    <Card className="group overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
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
            className={`object-cover transition-all duration-700 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            } group-hover:scale-110`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          
          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Special Badges - Only Signature and Special */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {item.isSignature && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-medium text-xs px-3 py-1.5 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Signature
              </Badge>
            )}
            {item.isSpecial && (
              <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 font-medium text-xs px-3 py-1.5 shadow-lg">
                <Zap className="w-3 h-3 mr-1" />
                Special
              </Badge>
            )}
            {item.isVeg && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 font-medium text-xs px-3 py-1.5 shadow-lg">
                <Leaf className="w-3 h-3 mr-1" />
                Veg
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title and Description */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 line-clamp-2">
              {item.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
              {item.description}
            </p>
            
            {/* Price Display */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-2xl text-gray-900">
                ₹{item.price}
              </span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            {quantity === 0 ? (
              <Button
                onClick={handleAddClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={isAtMaxQuantity}
              >
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center gap-4 w-full">
                <Button
                  onClick={handleDecreaseClick}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full w-10 h-10 p-0 flex items-center justify-center transition-all duration-300 shadow-md"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                
                <span className="font-bold text-gray-900 min-w-[3rem] text-center text-lg">
                  {quantity}
                </span>
                
                <Button
                  onClick={handleIncreaseClick}
                  className={`rounded-full w-10 h-10 p-0 flex items-center justify-center transition-all duration-300 shadow-md ${
                    isAtMaxQuantity
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  disabled={isAtMaxQuantity}
                >
                  <Plus className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={handleRemoveClick}
                  className="ml-auto bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition-all duration-300 shadow-md"
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
