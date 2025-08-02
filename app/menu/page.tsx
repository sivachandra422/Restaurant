'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChefHat, Sparkles, Crown, Search, Filter, SortAsc, Clock } from 'lucide-react';
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
import { PremiumCartIcon } from '@/components/cart/PremiumCartIcon';
import { ElegantCartDrawer } from '@/components/cart/ElegantCartDrawer';
import { ElegantCategoryTabs } from '@/components/menu/ElegantCategoryTabs';
import { PremiumMenuCard } from '@/components/menu/PremiumMenuCard';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { OrderHistory } from '@/components/ui/OrderHistory';
import { ElegantCheckoutForm } from '@/components/checkout/ElegantCheckoutForm';

export default function MenuPage() {
  const { addToCart, state, removeFromCart, updateQuantity } = useCart();
  const { isOnline } = useOffline();
  const { language } = useLanguage();
  const { orderHistory } = useCustomerExperience();
  const { getVisibleItems, getItemsByCategory, refreshMenu } = useMenu();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [lastMenuUpdate, setLastMenuUpdate] = useState(0);

  // Get visible menu items (filtered by disabled status)
  const allMenuItems = getVisibleItems();

  // Listen for menu updates from admin dashboard
  useEffect(() => {
    const handleMenuUpdate = () => {
      setLastMenuUpdate(Date.now());
      refreshMenu();
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
  }, [allMenuItems, selectedCategory, searchQuery, sortBy, getItemsByCategory, lastMenuUpdate]);

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
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
            {/* Logo and Restaurant Name */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Sri Kanya Restaurant</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Authentic Indian Cuisine</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <LanguageSwitcher />
              <Button
                onClick={() => setShowOrderHistory(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2"
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Orders</span>
              </Button>
              <PremiumCartIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-xl sm:text-2xl font-bold">Our Menu</h2>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-sm sm:text-lg opacity-90 max-w-2xl mx-auto">
            Discover our authentic Indian dishes, crafted with traditional recipes and fresh ingredients
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 sm:h-11"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 sm:h-11">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No items found</h3>
              <p className="text-gray-500 text-sm sm:text-base">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredItems.map((item) => {
                const cartItem = state.items.find(cartItem => cartItem.id === item.id);
                const quantity = cartItem?.quantity || 0;

                return (
                  <PremiumMenuCard
                    key={item.id}
                    item={item}
                    quantity={quantity}
                    onAdd={() => addToCart(item, 1)}
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