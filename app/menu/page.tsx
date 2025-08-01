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

export default function MenuPage() {
  const { addToCart, state, removeFromCart, updateQuantity } = useCart();
  const { isOnline } = useOffline();
  const { language } = useLanguage();
  const { orderHistory } = useCustomerExperience();
  const { getVisibleItems, getItemsByCategory } = useMenu();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  // Get visible menu items (filtered by disabled status)
  const allMenuItems = getVisibleItems();

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Restaurant Name */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sri Kanya Restaurant</h1>
                <p className="text-sm text-gray-600">Authentic Indian Cuisine</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
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
              <PremiumCartIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Our Menu</h2>
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Discover our authentic Indian dishes, crafted with traditional recipes and fresh ingredients
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {/* Cart Drawer */}
      <ElegantCartDrawer />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Order History Modal */}
      {showOrderHistory && (
        <OrderHistory onClose={() => setShowOrderHistory(false)} />
      )}
    </div>
  );
}