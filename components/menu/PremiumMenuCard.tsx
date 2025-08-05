'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { t, tWithParams } from '@/lib/translations';
import { getLocalizedText } from '@/data/sriKanyaMenu';
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
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Get localized text for the current language
  const localizedName = getLocalizedText(item, 'name', language);
  const localizedDescription = getLocalizedText(item, 'description', language);
  
  // Get the proper image URL for this item with robust fallback system
  const primaryImageUrl = item.image || getFoodImage(item.id); // Use database image first
  const cloudinaryFallbackUrl = getFoodImage(item.id);
  const localFallbackUrl = getLocalFallbackImage(item.id);

  // Get item-specific limits
  const maxQuantity = getMaxQuantity(item);
  const isAtMaxQuantity = quantity >= maxQuantity;

  // Preload images for first few items (improves perceived loading)
  const shouldPreload = item.id === 'chicken_dum_biryani_half' || 
                       item.id === 'chicken_biryani' || 
                       item.id === 'paneer_butter_masala' ||
                       item.id === 'chicken_curry';

  // Intersection Observer for true lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before item comes into view
        threshold: 0.1
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
    <Card className="menu-card group overflow-hidden border-0 shadow-soft hover:shadow-glow bg-white transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Image Section */}
        <div ref={imageRef} className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {/* Skeleton Loading Placeholder */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-400">
                  <ChefHat className="w-8 h-8 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          
          {/* Main Image - Only load when in view */}
          {isInView && (
            <Image
              src={currentImageUrl}
              alt={localizedName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-all duration-700 ${
                imageLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-110'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              priority={shouldPreload}
              loading={shouldPreload ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              unoptimized={currentImageUrl.startsWith('https://res.cloudinary.com/')} // Prevent server-side optimization for Cloudinary
            />
          )}
          
          {/* Enhanced Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          
          {/* Favorite Button with enhanced animation */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 focus-ring transform hover:rotate-12"
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-300 ${
                isItemFavorite(item.id) 
                  ? 'text-red-500 fill-current scale-110' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>
          
          {/* Enhanced Badges with animations */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 max-w-[calc(100%-1rem)]">
            {/* Veg Badge - Always show if applicable */}
            {item.isVeg && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-1 shadow-md transform transition-all duration-300 hover:scale-105 animate-fadeInUp">
                {t('veg', language)}
              </Badge>
            )}
            
            {/* Signature Badge - Priority badge */}
            {item.isSignature && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 shadow-md transform transition-all duration-300 hover:scale-105 animate-fadeInUp">
                {t('signature', language)}
              </Badge>
            )}
            
            {/* Trending Badge - Only show if not signature and trending */}
            {item.trending && !item.isSignature && (
              <Badge className="pulse-glow bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 shadow-md transform transition-all duration-300 hover:scale-105 animate-fadeInUp">
                {t('trending', language)}
              </Badge>
            )}
          </div>

          {/* Quick Add Button - Appears on hover */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              onClick={handleAddClick}
              className="w-full bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-white font-medium transition-all duration-200 transform hover:scale-105"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('quick_add', language)}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4">
          {/* Title and Description */}
          <div className="mb-3">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors duration-200">
              {localizedName}
            </h3>
            <div className="description-container">
              <p className="text-xs sm:text-sm text-gray-600 description-text">
                {localizedDescription}
              </p>
            </div>
          </div>

          {/* Enhanced Price and Time Section */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg sm:text-xl text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                {t('currency', language)}{item.price}
              </span>
              {item.isSignature && (
                <span className="text-xs text-orange-600 font-medium">⭐ {t('premium', language)}</span>
              )}
            </div>
            <WaitTimeIndicator item={item} />
          </div>

          {/* Enhanced Add to Cart Section */}
          <div className="flex items-center justify-between">
            {quantity === 0 ? (
              <Button
                onClick={handleAddClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium ripple focus-ring transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('add_to_cart', language)}
              </Button>
            ) : (
              <div className="flex items-center space-x-2 w-full">
                <Button
                  onClick={handleDecreaseClick}
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full ripple focus-ring transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <span className="flex-1 text-center font-semibold text-gray-900 text-lg">
                  {quantity}
                </span>
                
                <Button
                  onClick={handleIncreaseClick}
                  variant="outline"
                  size="sm"
                  className={`w-8 h-8 p-0 rounded-full ripple focus-ring transition-all duration-200 hover:bg-green-50 hover:border-green-300 hover:text-green-600 ${
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
