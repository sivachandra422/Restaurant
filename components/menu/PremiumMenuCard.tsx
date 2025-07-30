'use client';

import React, { useEffect } from 'react';
import { Plus, Minus, Star, Leaf, Zap, Heart } from 'lucide-react';
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
  const [isFavorite, setIsFavorite] = React.useState(false);

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card className="group overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col animate-fadeInUp">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section - Fixed Height */}
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          {/* Loading Placeholder */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl animate-bounce">🍽️</div>
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
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 left-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-300 ${
                isFavorite ? 'text-red-500 fill-red-500' : 'text-white'
              }`} 
            />
          </button>
          
          {/* Special Badges - Only Signature and Special */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {item.isSignature && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-medium text-xs px-2 py-1 shadow-md animate-pulse">
                <Star className="w-3 h-3 mr-1" />
                Signature
              </Badge>
            )}
            {item.isSpecial && (
              <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 font-medium text-xs px-2 py-1 shadow-md animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                Special
              </Badge>
            )}
            {item.isVeg && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 font-medium text-xs px-2 py-1 shadow-md">
                <Leaf className="w-3 h-3 mr-1" />
                Veg
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section - Fixed Structure */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title - Fixed Height */}
          <div className="mb-2 h-12 flex items-start">
            <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
              {item.name}
            </h3>
          </div>
          
          {/* Description - Fixed Height */}
          <div className="mb-3 h-10 flex items-start">
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>
          
          {/* Price - Fixed Position */}
          <div className="mb-4 flex items-center justify-between">
            <span className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
              ₹{item.price.toLocaleString()}
            </span>
          </div>

          {/* Quantity Controls - Fixed at Bottom */}
          <div className="flex items-center justify-between mt-auto">
            {quantity === 0 ? (
              <Button
                onClick={handleAddClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-sm hover:shadow-lg"
                disabled={isAtMaxQuantity}
              >
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Button
                  onClick={handleDecreaseClick}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="font-bold text-gray-900 min-w-[2rem] text-center text-sm">
                  {quantity}
                </span>
                
                <Button
                  onClick={handleIncreaseClick}
                  className={`rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 ${
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
                  className="ml-auto bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
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
