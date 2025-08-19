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
import { generateFriendlyDescription } from '@/lib/friendlyDescriptions';
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
    : generateFriendlyDescription(item.description || item.name, language as any);
  
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
    <Card className="menu-card group overflow-hidden border-0 shadow-soft hover:shadow-glow bg-white transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl">
      <CardContent className="p-0">
        {/* Image Section */}
        <div ref={imageRef} className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          {/* Skeleton Loading Placeholder */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-neutral-400">
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
              quality={95}
              unoptimized={currentImageUrl.startsWith('https://res.cloudinary.com/')} // Keep Cloudinary handling
            />
          )}
          
          {/* Enhanced Loading States */}
          {!isInView && (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-neutral-400">
                  <ChefHat className="w-8 h-8 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          
          {/* Favorite Button with enhanced animation */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 left-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transform hover:rotate-12 z-10 shadow-md"
            style={{ zIndex: 10 }}
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-300 ${
                isItemFavorite(item.id) 
                  ? 'text-primary-500 fill-current scale-110' 
                  : 'text-neutral-600 hover:text-primary-500'
              }`}
            />
          </button>
          
          {/* Enhanced Badges with animations */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 max-w-[calc(100%-1.5rem)]">
            {/* Veg Badge - Always show if applicable */}
            {item.isVeg && (
              <Badge className="bg-food-veg text-white text-xs px-3 py-1.5 shadow-md transform transition-all duration-300 hover:scale-105 animate-fade-in rounded-full">
                {t('veg', language)}
              </Badge>
            )}
            
            {/* Signature Badge - Priority badge */}
            {item.isSignature && (
              <Badge className="bg-gradient-primary text-white text-xs px-3 py-1.5 shadow-md transform transition-all duration-300 hover:scale-105 animate-fade-in rounded-full">
                {t('signature', language)}
              </Badge>
            )}
            
            {/* Trending Badge - Only show if not signature and trending */}
            {item.trending && !item.isSignature && (
              <Badge className="pulse-glow bg-gradient-accent text-white text-xs px-3 py-1.5 shadow-md transform transition-all duration-300 hover:scale-105 animate-fade-in rounded-full">
                {t('trending', language)}
              </Badge>
            )}
          </div>

          {/* Enhanced Overlay on hover - removed Quick Add button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>

        {/* Content Section - Enhanced Layout */}
        <div className="p-4 sm:p-5">
          {/* Title and Description - Better Typography */}
          <div className="mb-4">
            <h3 className="font-bold text-base sm:text-lg text-neutral-900 mb-2 line-clamp-1 group-hover:text-primary-500 transition-colors duration-200 leading-tight">
              {localizedName}
            </h3>
            <div className="description-container">
              <p className="text-sm text-neutral-600 description-text leading-relaxed line-clamp-2">
                {localizedDescription}
              </p>
            </div>
          </div>

          {/* Enhanced Price and Time Section - Better Alignment */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl sm:text-2xl text-neutral-900 group-hover:text-primary-500 transition-colors duration-200">
                {t('currency', language)}{item.price}
              </span>
            </div>
            <WaitTimeIndicator item={item} />
          </div>

          {/* Enhanced Add to Cart Section - Better Spacing */}
          <div className="flex items-center justify-between">
            {quantity === 0 ? (
              <Button
                onClick={(e) => { handleAddClick(e); flyToCart(); }}
                className="w-full bg-gradient-primary hover:from-primary-600 hover:to-primary-700 text-white font-semibold ripple focus-ring transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl py-3 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('add_to_cart', language)}
              </Button>
            ) : (
              <div className="flex items-center space-x-3 w-full">
                {/* Labels / Badges left-aligned for consistent height */}
                <div className="hidden sm:flex items-center gap-2">
                  {item.isVeg && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-success-100 text-success-700 border border-success-200 font-medium">{t('veg', language)}</span>
                  )}
                  {item.isSignature && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-warning-100 text-warning-700 border border-warning-200 font-medium">{t('premium', language)}</span>
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
                  className="w-10 h-10 p-0 rounded-full ripple focus-ring transition-all duration-200 hover:bg-error-50 hover:border-error-300 hover:text-error-600 shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="flex-1 text-center font-bold text-neutral-900 text-xl">
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
                  className={`w-10 h-10 p-0 rounded-full ripple focus-ring transition-all duration-200 hover:bg-success-50 hover:border-success-300 hover:text-success-600 shadow-sm ${
                    isAtMaxQuantity ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isAtMaxQuantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
