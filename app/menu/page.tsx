'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChefHat, Sparkles, Crown, Search, Filter, SortAsc, Clock } from 'lucide-react';
import Head from 'next/head';
import { sriKanyaMenu, menuCategories } from '@/data/sriKanyaMenu';
import { PremiumMenuCard } from '@/components/menu/PremiumMenuCard';
import { ElegantCategoryTabs } from '@/components/menu/ElegantCategoryTabs';
import { PremiumCartIcon } from '@/components/cart/PremiumCartIcon';
import { ElegantCartDrawer } from '@/components/cart/ElegantCartDrawer';
import { ElegantCheckoutForm } from '@/components/checkout/ElegantCheckoutForm';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

import { OrderHistory } from '@/components/ui/OrderHistory';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { t } from '@/lib/translations';
import { getFoodImage } from '@/lib/imageMappings';
import { MenuItem } from '@/data/sriKanyaMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('biryanis');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterVeg, setFilterVeg] = useState('all');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const { state, addToCart, removeFromCart, updateQuantity, setTableNumber } = useCart();
  const { language } = useLanguage();

  useEffect(() => {
    const tableNumber = new URLSearchParams(window.location.search).get('table');
    console.log('Table number from URL:', tableNumber);
    
    if (tableNumber && !isNaN(parseInt(tableNumber))) {
      const parsedTableNumber = parseInt(tableNumber);
      console.log('Setting table number:', parsedTableNumber);
      
      // Only set table number if it's different from current
      if (state.tableNumber !== parsedTableNumber) {
        setTableNumber(parsedTableNumber);
      }
    } else if (state.tableNumber === null) {
      console.log('No valid table number found in URL, using default table 0');
      setTableNumber(0); // Set default table for QR access only if not already set
    }
  }, [setTableNumber, state.tableNumber]);

  const menuWithImages = useMemo(() => {
    return Object.keys(sriKanyaMenu).reduce((acc, category) => {
      acc[category] = sriKanyaMenu[category].map(item => ({
        ...item,
        image: getFoodImage(item.id),
      }));
      return acc;
    }, {} as { [key: string]: MenuItem[] });
  }, []);

  // Filter and sort menu items
  const filteredAndSortedItems = useMemo(() => {
    let items = menuWithImages[activeCategory] || [];

    // Filter by search query
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by dietary preference
    if (filterVeg === 'veg') {
      items = items.filter(item => item.isVeg);
    } else if (filterVeg === 'non-veg') {
      items = items.filter(item => !item.isVeg);
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return (b.isSignature ? 1 : 0) - (a.isSignature ? 1 : 0);
        default:
          return 0;
      }
    });

    return items;
  }, [menuWithImages, activeCategory, searchQuery, sortBy, filterVeg]);

  const handleAddToCart = (item: any) => {
    try {
      console.log('Adding to cart:', item.name, 'Table:', state.tableNumber);
      addToCart(item, 1);
      console.log('Cart after adding:', state.items.length, 'items, Total:', state.totalItems);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    try {
      console.log('Removing from cart:', itemId);
      removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    try {
      console.log('Updating quantity:', itemId, 'to', newQuantity);
      updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* SEO & Structured Data */}
      <Head>
        <title>Sri Kanya Restaurant Menu</title>
        <meta name="description" content="Browse the authentic Indian menu at Sri Kanya Restaurant. Signature biryanis, curries, fried rice, and more." />
        <meta property="og:title" content="Sri Kanya Restaurant Menu" />
        <meta property="og:description" content="Browse the authentic Indian menu at Sri Kanya Restaurant. Signature biryanis, curries, fried rice, and more." />
        <meta property="og:type" content="restaurant.menu" />
        <meta property="og:site_name" content="Sri Kanya Restaurant" />
        <meta property="og:locale" content="en_IN" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          name: 'Sri Kanya Restaurant',
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

      {/* Premium Header - Balanced Design */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24 lg:h-28">
            {/* Restaurant Name & Logo - Responsive Design */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 xl:space-x-5">
              <div className="relative">
                <ChefHat className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-orange-600" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-3xl xl:text-4xl font-bold text-gray-900">Sri Kanya Restaurant</h1>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <LanguageSwitcher />
              <Button
                onClick={() => setShowOrderHistory(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Orders</span>
              </Button>
              <div className="flex-shrink-0">
                <PremiumCartIcon />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Hero Section - Balanced with Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <Crown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-600" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Our Menu</h2>
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-600" />
          </div>
          <p className="text-gray-700 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4 lg:px-8">
            Discover our authentic Indian cuisine featuring signature biryanis, aromatic curries, and traditional favorites.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <ElegantCategoryTabs
            categories={menuCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('search', language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex gap-3 w-full sm:w-auto">
              {/* Dietary Filter */}
              <Select value={filterVeg} onValueChange={setFilterVeg}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('filter', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_items', language)}</SelectItem>
                  <SelectItem value="veg">{t('vegetarian', language)}</SelectItem>
                  <SelectItem value="non-veg">{t('non_vegetarian', language)}</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('sort', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t('name_az', language)}</SelectItem>
                  <SelectItem value="price-low">{t('price_low', language)}</SelectItem>
                  <SelectItem value="price-high">{t('price_high', language)}</SelectItem>
                  <SelectItem value="popularity">{t('popularity', language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8" role="list" aria-label="Menu items">
          {filteredAndSortedItems.map((item) => {
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
        {filteredAndSortedItems.length === 0 && (
          <div className="text-center py-16 sm:py-20 lg:py-24">
            <div className="text-6xl sm:text-8xl lg:text-9xl mb-6">🍽️</div>
            <h3 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-4">
              {searchQuery ? t('no_items_found', language) : t('coming_soon', language)}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl">
              {searchQuery 
                ? `${t('no_items_found', language)} "${searchQuery}". ${t('try_different_search', language)}`
                : t('preparing_special', language)
              }
            </p>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <ElegantCartDrawer />

      {/* Checkout Form */}
      <ElegantCheckoutForm />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      

      {/* Order History Modal */}
      {showOrderHistory && (
        <OrderHistory onClose={() => setShowOrderHistory(false)} />
      )}
    </div>
  );
}