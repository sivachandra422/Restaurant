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
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomerExperience } from '@/contexts/CustomerExperienceContext';
import { t } from '@/lib/translations';
import { WaitTimeIndicator } from '@/components/ui/WaitTimeIndicator';

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
  const { language } = useLanguage();
  const { isFavorite: isItemFavorite, addToFavorites, removeFromFavorites } = useCustomerExperience();
  
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [currentImageUrl, setCurrentImageUrl] = React.useState('');

  // Get the proper image URL for this item with consistent styling
  const primaryImageUrl = getFoodImage(item.id);
  const fallbackImageUrl = getFallbackImage(item.category);

  // Get item-specific limits
  const maxQuantity = getMaxQuantity(item);
  const isAtMaxQuantity = quantity >= maxQuantity;

  useEffect(() => {
    // Reset image state when item changes for consistent loading
    setImageError(false);
    setImageLoading(true);
    setCurrentImageUrl(primaryImageUrl);
  }, [item.id, primaryImageUrl]);

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
    if (isItemFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item.id);
    }
  };

  const handleImageError = () => {
    if (!imageError) {
      // Try fallback image with consistent styling
      setImageError(true);
      setCurrentImageUrl(fallbackImageUrl);
      setImageLoading(true);
    } else {
      // If fallback also fails, show placeholder
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Card className="group overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col animate-fadeInUp">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section - Responsive Height */}
        <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden flex-shrink-0">
          {/* Loading Placeholder with Consistent Styling */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl animate-bounce">🍽️</div>
            </div>
          )}
          
          {/* Main Image with Consistent Quality and Styling */}
          <Image
            src={currentImageUrl}
            alt={item.name}
            fill
            className={`object-cover transition-all duration-700 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            } group-hover:scale-110`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
            quality={90}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          
          {/* Overlay with Consistent Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 sm:top-3 sm:left-3 p-1.5 sm:p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
          >
            <Heart 
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${
                isItemFavorite(item.id) ? 'text-red-500 fill-red-500' : 'text-white'
              }`} 
            />
          </button>
          
          {/* Special Badges - Only Signature and Special with Consistent Styling */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1">
            {item.isSignature && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-medium text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-md animate-pulse">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                {t('signature', language)}
              </Badge>
            )}
            {item.isSpecial && (
              <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 font-medium text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-md animate-pulse">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                {t('special', language)}
              </Badge>
            )}
            {item.isVeg && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 font-medium text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-md">
                <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                {t('veg', language)}
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section - Responsive Structure */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          {/* Title - Responsive Height */}
          <div className="mb-2 h-10 sm:h-12 flex items-start">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
              {item.name}
            </h3>
          </div>
          
          {/* Description - Responsive Height */}
          <div className="mb-3 h-8 sm:h-10 flex items-start">
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>
          
          {/* Price and Wait Time - Responsive Styling */}
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <span className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
              ₹{item.price.toLocaleString()}
            </span>
            <WaitTimeIndicator item={item} showTrending={false} />
          </div>

          {/* Quantity Controls - Responsive at Bottom */}
          <div className="flex items-center justify-between mt-auto">
            {quantity === 0 ? (
                              <Button
                  onClick={handleAddClick}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-xs sm:text-sm hover:shadow-lg"
                  disabled={isAtMaxQuantity}
                >
                  {t('add_to_cart', language)}
                </Button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Button
                  onClick={handleDecreaseClick}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                
                <span className="font-bold text-gray-900 min-w-[1.5rem] sm:min-w-[2rem] text-center text-xs sm:text-sm">
                  {quantity}
                </span>
                
                <Button
                  onClick={handleIncreaseClick}
                  className={`rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 ${
                    isAtMaxQuantity
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  disabled={isAtMaxQuantity}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                
                                  <Button
                    onClick={handleRemoveClick}
                    className="ml-auto bg-red-500 hover:bg-red-600 text-white text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {t('remove', language)}
                  </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
