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
  }, [sriKanyaMenu]);

  const handleAddToCart = (item: any) => {
    try {
      addToCart(item, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    try {
      removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    try {
      updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/" className="flex items-center space-x-1 sm:space-x-2 text-orange-600 hover:text-orange-700 transition-colors">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-xs sm:text-sm lg:text-base">Back to Home</span>
              </Link>
            </div>

            {/* Restaurant Name */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-orange-600" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Sri Kanya Family Restaurants</h1>
            </div>

            {/* Cart Icon */}
            <PremiumCartIcon />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 lg:space-x-4 mb-3 sm:mb-4 lg:mb-6">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-600" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Our Menu</h2>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-600" />
          </div>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg max-w-4xl mx-auto leading-relaxed px-3 lg:px-6">
            Discover our authentic Indian cuisine featuring signature biryanis, aromatic curries, and traditional favorites.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <ElegantCategoryTabs
            categories={menuCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6" role="list" aria-label="Menu items">
          {menuWithImages[activeCategory]?.map((item) => {
            const cartItem = state.items.find(cartItem => cartItem.id === item.id);
            const quantity = cartItem?.quantity || 0;

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
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="text-4xl sm:text-6xl lg:text-8xl mb-4 sm:mb-6">🍽️</div>
            <h3 className="font-playfair text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
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