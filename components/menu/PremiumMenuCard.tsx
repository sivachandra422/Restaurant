'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Star, Leaf, Zap, Heart, ChefHat } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MenuItem } from '@/data/sriKanyaMenu';
import { getFoodImage, getFallbackImage, getLocalFallbackImage } from '@/lib/imageMappings';
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
  
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [fallbackAttempt, setFallbackAttempt] = useState(0);
  
  // Get the proper image URL for this item with robust fallback system
  const primaryImageUrl = item.image || getFoodImage(item.id); // Use database image first
  const cloudinaryFallbackUrl = getFoodImage(item.id);
  const localFallbackUrl = getLocalFallbackImage(item.id);

  // Get item-specific limits
  const maxQuantity = getMaxQuantity(item);
  const isAtMaxQuantity = quantity >= maxQuantity;

  useEffect(() => {
    // Reset image state when item changes for consistent loading
    setImageError(false);
    setImageLoading(true);
    setFallbackAttempt(0);
    setCurrentImageUrl(primaryImageUrl);
    
    // Test image accessibility for debugging
    console.log(`Loading image for ${item.id}: ${primaryImageUrl}`);
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
    console.log(`Image failed to load for ${item.id}: ${currentImageUrl}`);
    
    if (fallbackAttempt === 0) {
      // First fallback: If we were using database image, try Cloudinary
      if (currentImageUrl.startsWith('/menu-images/')) {
        setFallbackAttempt(1);
        setCurrentImageUrl(cloudinaryFallbackUrl);
        console.log(`Trying Cloudinary for ${item.id}: ${cloudinaryFallbackUrl}`);
      } else {
        // If we were using Cloudinary, try local image
        setFallbackAttempt(1);
        setImageError(true);
        setCurrentImageUrl(localFallbackUrl);
        console.log(`Trying local fallback for ${item.id}: ${localFallbackUrl}`);
      }
    } else if (fallbackAttempt === 1) {
      // Second fallback: Try the opposite of what we tried first
      if (currentImageUrl.startsWith('https://res.cloudinary.com/')) {
        setFallbackAttempt(2);
        setImageError(true);
        setCurrentImageUrl(localFallbackUrl);
        console.log(`Trying local fallback for ${item.id}: ${localFallbackUrl}`);
      } else {
        setFallbackAttempt(2);
        setImageError(true);
        setCurrentImageUrl(cloudinaryFallbackUrl);
        console.log(`Trying Cloudinary fallback for ${item.id}: ${cloudinaryFallbackUrl}`);
      }
    } else {
      // Final fallback: Use a default image
      setImageError(true);
      setCurrentImageUrl('/menu-images/chicken_biryani.jpg');
      console.log(`Using default image for ${item.id}`);
    }
  };

  const handleImageLoad = () => {
    console.log(`Image loaded successfully for ${item.id}: ${currentImageUrl}`);
    setImageLoading(false);
  };

  return (
    <Card className="menu-card group overflow-hidden border-0 shadow-soft hover:shadow-glow bg-white">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {/* Loading Placeholder */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-pulse text-gray-400">
                <ChefHat className="w-8 h-8" />
              </div>
            </div>
          )}
          
          {/* Main Image */}
          <img
            src={currentImageUrl}
            alt={item.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-110'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 focus-ring"
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-200 ${
                isItemFavorite(item.id) 
                  ? 'text-red-500 fill-current' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 max-w-[calc(100%-1rem)]">
            {/* Veg Badge - Always show if applicable */}
            {item.isVeg && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-1 shadow-md">
                Veg
              </Badge>
            )}
            
            {/* Signature Badge - Priority badge */}
            {item.isSignature && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 shadow-md">
                Signature
              </Badge>
            )}
            
            {/* Trending Badge - Only show if not signature and trending */}
            {item.trending && !item.isSignature && (
              <Badge className="pulse-glow bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 shadow-md">
                Trending
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4">
          {/* Title and Description */}
          <div className="mb-3">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors duration-200">
              {item.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Price and Time */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg sm:text-xl text-gray-900">
                ₹{item.price}
              </span>
            </div>
            <WaitTimeIndicator item={item} />
          </div>

          {/* Add to Cart Section */}
          <div className="flex items-center justify-between">
            {quantity === 0 ? (
              <Button
                onClick={handleAddClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium ripple focus-ring transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center space-x-2 w-full">
                <Button
                  onClick={handleDecreaseClick}
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full ripple focus-ring"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <span className="flex-1 text-center font-semibold text-gray-900">
                  {quantity}
                </span>
                
                <Button
                  onClick={handleIncreaseClick}
                  variant="outline"
                  size="sm"
                  className={`w-8 h-8 p-0 rounded-full ripple focus-ring ${
                    isAtMaxQuantity ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isAtMaxQuantity}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
