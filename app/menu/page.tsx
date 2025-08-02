'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChefHat, Sparkles, Crown, Search, Filter, SortAsc, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';
import { useOffline } from '@/contexts/OfflineContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomerExperience } from '@/contexts/CustomerExperienceContext';
import { useMenu } from '@/contexts/MenuContext';
import { menuCategories } from '@/data/sriKanyaMenu';
import { getFoodImage } from '@/lib/imageMappings';
import { PremiumCartIcon } from '@/components/cart/PremiumCartIcon';
import { ElegantCartDrawer } from '@/components/cart/ElegantCartDrawer';
import { ElegantCategoryTabs } from '@/components/menu/ElegantCategoryTabs';
import { PremiumMenuCard } from '@/components/menu/PremiumMenuCard';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { OrderHistory } from '@/components/ui/OrderHistory';
import { ElegantCheckoutForm } from '@/components/checkout/ElegantCheckoutForm';

export default function MenuPage() {
  const searchParams = useSearchParams();
  const { addToCart, state, removeFromCart, updateQuantity, setTableNumber } = useCart();
  const { isOnline } = useOffline();
  const { language } = useLanguage();
  const { orderHistory } = useCustomerExperience();
  const { getVisibleItems, getItemsByCategory, refreshMenu, loading } = useMenu();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [lastMenuUpdate, setLastMenuUpdate] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Extract table number from URL and set it in cart context
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const tableNumber = parseInt(tableParam, 10);
      if (!isNaN(tableNumber) && tableNumber > 0) {
        console.log('Setting table number from URL:', tableNumber);
        setTableNumber(tableNumber);
      }
    }
  }, [searchParams, setTableNumber]);

  // Get visible menu items (filtered by disabled status)
  const allMenuItems = getVisibleItems();

  // Listen for menu updates from admin dashboard
  useEffect(() => {
    const handleMenuUpdate = () => {
      setLastMenuUpdate(Date.now());
      setIsSyncing(true);
      refreshMenu().finally(() => setIsSyncing(false));
    };

    window.addEventListener('menuUpdated', handleMenuUpdate);
    
    return () => {
      window.removeEventListener('menuUpdated', handleMenuUpdate);
    };
  }, [refreshMenu]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let items = allMenuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      items = getItemsByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
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
          return (b.popularity || 0) - (a.popularity || 0);
        default:
          return 0;
      }
    });

    return items;
  }, [allMenuItems, selectedCategory, searchQuery, sortBy, getItemsByCategory]);

  // Extract table number from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table');
    if (tableNumber) {
      // Set table number in cart context
      const numericTable = parseInt(tableNumber);
      if (!isNaN(numericTable)) {
        // Update cart context with table number
        // This would need to be implemented in CartContext
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo and Restaurant Name */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-105">
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate gradient-text">
                  Sri Kanya Restaurant
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Authentic Indian Cuisine
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {state.tableNumber && (
                <div className="hidden sm:block text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200 shadow-soft">
                  Table {state.tableNumber}
                </div>
              )}
              {/* Mobile table indicator */}
              {state.tableNumber && (
                <div className="sm:hidden w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center shadow-soft hover:shadow-glow transition-all duration-200 hover:scale-110">
                  <span className="text-xs font-medium text-orange-700">{state.tableNumber}</span>
                </div>
              )}
              {/* Real-time sync indicator */}
              {isSyncing && (
                <div className="hidden sm:flex items-center space-x-1 text-xs text-orange-600">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
              <LanguageSwitcher />
              <Button
                onClick={() => setShowOrderHistory(true)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 ripple focus-ring hover:bg-orange-50 transition-all duration-200"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline text-xs ml-1">Orders</span>
              </Button>
              <PremiumCartIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Our Menu</h2>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
          <p className="text-xs sm:text-sm lg:text-base opacity-90 max-w-2xl mx-auto leading-relaxed">
            Discover our authentic Indian dishes, crafted with traditional recipes and fresh ingredients
          </p>
          {/* Real-time indicator */}
          {isSyncing && (
            <div className="mt-2 sm:mt-3 flex items-center justify-center space-x-2 text-orange-100">
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span className="text-xs sm:text-sm">Updating menu in real-time...</span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="w-full sm:w-40 lg:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 sm:h-10 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ElegantCategoryTabs
            categories={menuCategories}
            activeCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-orange-500 animate-spin" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">Loading menu...</h3>
              <p className="text-sm text-gray-500">Fetching latest menu items</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-600 mb-2">No items found</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {filteredItems.map((item) => {
                const cartItem = state.items.find(cartItem => cartItem.id === item.id);
                const quantity = cartItem?.quantity || 0;

                // Ensure item has proper image URL
                const itemWithImage = {
                  ...item,
                  image: item.image || getFoodImage(item.id)
                };

                return (
                  <PremiumMenuCard
                    key={item.id}
                    item={itemWithImage}
                    quantity={quantity}
                    onAdd={() => addToCart(itemWithImage, 1)}
                    onRemove={() => removeFromCart(item.id)}
                    onUpdateQuantity={(newQuantity: number) => updateQuantity(item.id, newQuantity)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

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