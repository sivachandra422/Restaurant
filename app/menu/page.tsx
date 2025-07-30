'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ChefHat, Sparkles, Crown } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';
import { sriKanyaMenu, menuCategories } from '@/data/sriKanyaMenu';
import { PremiumMenuCard } from '@/components/menu/PremiumMenuCard';
import { ElegantCategoryTabs } from '@/components/menu/ElegantCategoryTabs';
import { PremiumCartIcon } from '@/components/cart/PremiumCartIcon';
import { ElegantCartDrawer } from '@/components/cart/ElegantCartDrawer';
import { ElegantCheckoutForm } from '@/components/checkout/ElegantCheckoutForm';
import { useCart } from '@/contexts/CartContext';
import { getFoodImage } from '@/lib/imageMappings';
import { MenuItem } from '@/data/sriKanyaMenu';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('biryanis');
  const { state, addToCart, removeFromCart, updateQuantity, setTableNumber } = useCart();

  useEffect(() => {
    const tableNumber = new URLSearchParams(window.location.search).get('table');
    if (tableNumber && !isNaN(parseInt(tableNumber))) {
      setTableNumber(parseInt(tableNumber));
    }
  }, [setTableNumber]);

  const menuWithImages = useMemo(() => {
    return Object.keys(sriKanyaMenu).reduce((acc, category) => {
      acc[category] = sriKanyaMenu[category].map(item => ({
        ...item,
        image: getFoodImage(item.id),
      }));
      return acc;
    }, {} as { [key: string]: MenuItem[] });
  }, []);

  // Debug logging
  console.log('MenuPage - Cart State:', state);
  console.log('MenuPage - Cart Functions:', { addToCart, removeFromCart, updateQuantity });

  const handleAddToCart = (item: any) => {
    console.log('Adding to cart:', item);
    try {
      addToCart(item, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    console.log('Removing from cart:', itemId);
    try {
      removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    console.log('Updating quantity:', itemId, newQuantity);
    try {
      updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      {/* SEO & Structured Data */}
      <Head>
        <title>Sri Kanya Family Restaurants Menu</title>
        <meta name="description" content="Browse the authentic Indian menu at Sri Kanya Family Restaurants. Signature biryanis, curries, fried rice, and more." />
        <meta property="og:title" content="Sri Kanya Family Restaurants Menu" />
        <meta property="og:description" content="Browse the authentic Indian menu at Sri Kanya Family Restaurants. Signature biryanis, curries, fried rice, and more." />
        <meta property="og:type" content="restaurant.menu" />
        <meta property="og:site_name" content="Sri Kanya Family Restaurants" />
        <meta property="og:locale" content="en_IN" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          name: 'Sri Kanya Family Restaurants',
          servesCuisine: 'Indian',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '123 Culinary Street, Food District, City 560001',
            addressCountry: 'IN',
          },
          url: 'https://srikanya.com',
          hasMenu: 'https://srikanya.com/menu',
        }) }} />
      </Head>

      {/* Skip to Content Link for Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-white text-black px-4 py-2 rounded z-50">Skip to main content</a>

      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 relative">
            {/* Back Button */}
            <Link
              href="/"
              className="p-2 sm:p-3 rounded-full hover:bg-orange-100 transition-colors duration-200 z-10"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </Link>

            {/* Premium Logo Design */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Premium Logo Icon */}
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <ChefHat className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                  </div>
                </div>
                
                {/* Brand Text */}
                <div className="text-center">
                  <h1 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-wide">
                    SRI KANYA
                  </h1>
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-0.5 sm:mt-1">
                    <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                    <p className="text-xs sm:text-xs md:text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Family Restaurant
                    </p>
                    <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                  </div>
                  <p className="text-xs text-orange-600 font-semibold mt-0.5 sm:mt-1">
                    Authentic Indian Cuisine
                  </p>
                </div>
              </div>
            </div>

            {/* Cart Icon */}
            <PremiumCartIcon />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8" id="main-content">
        {/* Category Tabs - Professional Centering */}
        <div className="mb-4 sm:mb-8">
          <div className="flex justify-center">
            <div className="w-full max-w-7xl px-2 sm:px-4">
              <ElegantCategoryTabs
                categories={menuCategories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
          </div>
        </div>

        {/* Category Header */}
        <div className="mb-8 sm:mb-12 text-center">
          {menuCategories.map((category) => {
            if (category.id === activeCategory) {
              return (
                <div key={category.id}>
                  <div className="flex items-center justify-center space-x-3 sm:space-x-6 mb-4 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl sm:text-4xl">{category.icon}</span>
                    </div>
                    <div className="text-center">
                      <h2 className="font-playfair text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-1 sm:mb-2">
                        {category.name}
                      </h2>
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                        <div className="w-6 sm:w-12 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                        <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500" />
                        <div className="w-6 sm:w-12 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium px-2">
                    {category.description}
                  </p>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6" role="list" aria-label="Menu items">
          {menuWithImages[activeCategory]?.map((item) => {
            const cartItem = state.items.find(cartItem => cartItem.id === item.id);
            const quantity = cartItem?.quantity || 0;

            console.log(`Item ${item.name}: quantity = ${quantity}`);

            return (
              <PremiumMenuCard 
                key={item.id} 
                item={item}
                quantity={quantity}
                onAdd={() => handleAddToCart(item)}
                onRemove={() => handleRemoveFromCart(item.id)}
                onUpdateQuantity={(newQuantity: number) => handleUpdateQuantity(item.id, newQuantity)}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {(!menuWithImages[activeCategory] || menuWithImages[activeCategory].length === 0) && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🍽️</div>
            <h3 className="font-playfair text-3xl font-semibold text-gray-800 mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-600 text-lg">
              We&apos;re preparing something special for this category.
            </p>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <ElegantCartDrawer />

      {/* Checkout Form */}
      <ElegantCheckoutForm />
    </div>
  );
}