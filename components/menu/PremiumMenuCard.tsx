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
import { transliterateFriendly } from '@/lib/friendlyTransliteration';
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
  const { isFavorite: isItemFavorite, addToFavorites, removeFromFavorites, favorites } = useCustomerExperience();
  
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [fallbackAttempt, setFallbackAttempt] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const currentQuantityRef = useRef<number>(quantity);
  
  // Modern phonetic rendering: use English source and render in script for hi/te
  const localizedName = language === 'en' 
    ? item.name 
    : transliterateFriendly(item.name, language as any);
  const localizedDescription = language === 'en'
    ? item.description
    : transliterateFriendly(item.description, language as any);
  
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
  }, [item.id, primaryImageUrl]);

  // Keep a live ref of quantity for long-press acceleration
  useEffect(() => {
    currentQuantityRef.current = quantity;
  }, [quantity]);

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

  // Long-press acceleration for +/-
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speedRef = useRef<number>(250);

  const startPress = (type: 'inc' | 'dec') => {
    const step = () => {
      let current = currentQuantityRef.current;
      if (type === 'inc') {
        const next = Math.min(current + 1, maxQuantity);
        if (next !== current) {
          onUpdateQuantity(next);
          currentQuantityRef.current = next;
        }
      } else {
        const next = Math.max(current - 1, 0);
        if (next !== current) {
          if (next === 0) {
            onRemove();
          } else {
            onUpdateQuantity(next);
          }
          currentQuantityRef.current = next;
        }
      }
      speedRef.current = Math.max(60, speedRef.current * 0.85);
      pressTimerRef.current = setTimeout(step, speedRef.current);
    };
    pressTimerRef.current = setTimeout(step, speedRef.current);
  };

  const endPress = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = null;
    speedRef.current = 250;
  };

  // Fly-to-cart animation
  const flyToCart = () => {
    try {
      const card = imageRef.current;
      const cartBtn = document.getElementById('cart-button');
      if (!card || !cartBtn) return;
      const img = card.querySelector('img');
      if (!img) return;

      const clone = (img as HTMLImageElement).cloneNode(true) as HTMLImageElement;
      const imgRect = (img as HTMLElement).getBoundingClientRect();
      const cartRect = cartBtn.getBoundingClientRect();
      Object.assign(clone.style, {
        position: 'fixed',
        left: `${imgRect.left}px`,
        top: `${imgRect.top}px`,
        width: `${imgRect.width}px`,
        height: `${imgRect.height}px`,
        borderRadius: '12px',
        zIndex: '9999',
        transition: 'all 700ms cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
      } as CSSStyleDeclaration);
      document.body.appendChild(clone);
      requestAnimationFrame(() => {
        Object.assign(clone.style, {
          left: `${cartRect.left + cartRect.width / 2 - imgRect.width * 0.15}px`,
          top: `${cartRect.top + cartRect.height / 2 - imgRect.height * 0.15}px`,
          width: `${imgRect.width * 0.3}px`,
          height: `${imgRect.height * 0.3}px`,
          opacity: '0.6',
          transform: 'rotate(10deg)',
          borderRadius: '50%',
        } as CSSStyleDeclaration);
      });
      setTimeout(() => {
        clone.remove();
        try {
          cartBtn.animate(
            [
              { transform: 'scale(1)' },
              { transform: 'scale(1.15)' },
              { transform: 'scale(1)' },
            ],
            { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
          );
        } catch {}
      }, 720);
    } catch {}
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Favorite button clicked for item:', item.id);
    console.log('Current favorites:', favorites);
    console.log('Is currently favorite:', isItemFavorite(item.id));
    
    if (isItemFavorite(item.id)) {
      console.log('Removing from favorites');
      removeFromFavorites(item.id);
    } else {
      console.log('Adding to favorites');
      addToFavorites(item.id);
    }
  };

  const handleImageError = () => {
    
    if (fallbackAttempt === 0) {
      // First fallback: If we were using database image, try Cloudinary
      if (currentImageUrl.startsWith('/menu-images/')) {
        setFallbackAttempt(1);
        setCurrentImageUrl(cloudinaryFallbackUrl);
      } else {
        // If we were using Cloudinary, try local image
        setFallbackAttempt(1);
        setImageError(true);
        setCurrentImageUrl(localFallbackUrl);
      }
    } else if (fallbackAttempt === 1) {
      // Second fallback: Try the opposite of what we tried first
      if (currentImageUrl.startsWith('https://res.cloudinary.com/')) {
        setFallbackAttempt(2);
        setImageError(true);
        setCurrentImageUrl(localFallbackUrl);
      } else {
        setFallbackAttempt(2);
        setImageError(true);
        setCurrentImageUrl(cloudinaryFallbackUrl);
      }
    } else {
      // Final fallback: Use a default image
      setImageError(true);
      setCurrentImageUrl('/menu-images/chicken_biryani.jpg');
    }
  };

  const handleImageLoad = () => {
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
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 25vw"
              className={`object-cover transition-all duration-700 ${
                imageLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-110'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              priority={shouldPreload}
              loading={shouldPreload ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              unoptimized={currentImageUrl.startsWith('https://res.cloudinary.com/')} // Keep Cloudinary handling
            />
          )}
          
          {/* Favorite Button with enhanced animation */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:rotate-12 z-10 shadow-md"
            style={{ zIndex: 10 }}
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

          {/* Enhanced Overlay on hover - removed Quick Add button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
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
            </div>
            <WaitTimeIndicator item={item} />
          </div>

          {/* Enhanced Add to Cart Section */}
          <div className="flex items-center justify-between">
            {quantity === 0 ? (
              <Button
                onClick={(e) => { handleAddClick(e); flyToCart(); }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium ripple focus-ring transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('add_to_cart', language)}
              </Button>
            ) : (
              <div className="flex items-center space-x-2 w-full">
                {/* Labels / Badges left-aligned for consistent height */}
                <div className="hidden sm:flex items-center gap-1">
                  {item.isVeg && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">{t('veg', language)}</span>
                  )}
                  {item.isSignature && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{t('premium', language)}</span>
                  )}
                </div>
                <Button
                  onClick={handleDecreaseClick}
                  onMouseDown={() => startPress('dec')}
                  onMouseUp={endPress}
                  onMouseLeave={endPress}
                  onTouchStart={() => startPress('dec')}
                  onTouchEnd={endPress}
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
                  onMouseDown={() => startPress('inc')}
                  onMouseUp={endPress}
                  onMouseLeave={endPress}
                  onTouchStart={() => startPress('inc')}
                  onTouchEnd={endPress}
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
