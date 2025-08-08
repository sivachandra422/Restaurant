'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChefHat, Sparkles, Crown, Search, Filter, SortAsc, Clock, RefreshCw, X, ShoppingBag, List } from 'lucide-react';
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
import AIChatbot from '@/components/ui/AIChatbot';
import Image from 'next/image';
import { t, tWithParams } from '@/lib/translations';

export default function MenuPage() {
  const searchParams = useSearchParams();
  const { addToCart, state, removeFromCart, updateQuantity, setTableNumber, setCartOpen } = useCart();
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

  // Refs for UI interactions
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const categoriesRef = useRef<HTMLDivElement | null>(null);

  // Persist user preferences for search, sort and category
  useEffect(() => {
    try {
      const saved = localStorage.getItem('menuPreferences');
      if (saved) {
        const { search, sort, category } = JSON.parse(saved);
        if (typeof search === 'string') setSearchQuery(search);
        if (typeof sort === 'string') setSortBy(sort);
        if (typeof category === 'string') setSelectedCategory(category);
      }
    } catch {}
  // run only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'menuPreferences',
        JSON.stringify({ search: searchQuery, sort: sortBy, category: selectedCategory })
      );
    } catch {}
  }, [searchQuery, sortBy, selectedCategory]);

  // Extract table number from URL and set it in cart context
  useEffect(() => {
    const tableParam = searchParams.get('table');
    console.log('Table param from URL:', tableParam);
    if (tableParam) {
      const tableNumber = parseInt(tableParam, 10);
      if (!isNaN(tableNumber) && tableNumber > 0) {
        console.log('Setting table number from URL:', tableNumber);
        setTableNumber(tableNumber);
      }
    }
  }, [searchParams, setTableNumber]);

  // Debug: Log current table number
  useEffect(() => {
    console.log('Current table number in state:', state.tableNumber);
  }, [state.tableNumber]);

  // Get visible menu items (filtered by disabled status)
  const allMenuItems = getVisibleItems();

  // Listen for menu updates from admin dashboard only
  useEffect(() => {
    const handleMenuUpdate = (event: CustomEvent) => {
      // Only refresh if the update comes from admin dashboard
      if (event.detail && event.detail.source === 'admin') {
        console.log('Admin dashboard change detected, refreshing menu...');
        setLastMenuUpdate(Date.now());
        setIsSyncing(true);
        refreshMenu().finally(() => setIsSyncing(false));
      }
    };

    window.addEventListener('menuUpdated', handleMenuUpdate as EventListener);
    
    return () => {
      window.removeEventListener('menuUpdated', handleMenuUpdate as EventListener);
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

        default:
          return 0;
      }
    });

    return items;
  }, [allMenuItems, selectedCategory, searchQuery, sortBy, getItemsByCategory]);

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18 lg:h-20">
            {/* Enhanced Logo and Restaurant Name */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-105 transform hover:rotate-3">
                <ChefHat className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900 truncate gradient-text leading-tight">
                  Sri Kanya Family Restaurant
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate flex items-center leading-tight">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                  {t('authentic_indian', language)}
                </p>
              </div>
            </div>

            {/* Enhanced Header Actions */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Enhanced Table number display */}
              {(state.tableNumber || searchParams.get('table')) && (
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-2 rounded-lg border border-orange-200 shadow-soft">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{t('table', language)} {state.tableNumber || searchParams.get('table')}</span>
                </div>
              )}
              
              {/* Enhanced Mobile table indicator */}
              {(state.tableNumber || searchParams.get('table')) && (
                <div className="sm:hidden w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-soft hover:shadow-glow transition-all duration-200 hover:scale-110">
                  <span className="text-xs font-bold text-white">{state.tableNumber || searchParams.get('table')}</span>
                </div>
              )}
              
              {/* Enhanced Real-time sync indicator */}
              {isSyncing && (
                <div className="hidden sm:flex items-center space-x-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{t('syncing', language)}</span>
                </div>
              )}
              
              <LanguageSwitcher />
              
              {/* Enhanced Order History Button */}
              <Button
                onClick={() => setShowOrderHistory(true)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-10 sm:w-auto p-0 sm:px-3 ripple focus-ring hover:bg-orange-50 transition-all duration-200 group"
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline text-xs ml-2">{t('orders', language)}</span>
              </Button>
              
              <PremiumCartIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white py-4 sm:py-8 lg:py-10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 animate-bounce" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-shadow">{t('our_menu', language)}</h2>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 animate-pulse" />
          </div>
          <p className="text-sm sm:text-base lg:text-lg opacity-95 max-w-3xl mx-auto leading-relaxed text-shadow">
            {t('discover_dishes', language)}
          </p>
          <p className="text-xs sm:text-sm lg:text-base opacity-90 max-w-2xl mx-auto mt-2 sm:mt-3 leading-relaxed text-shadow">
            {t('every_dish_story', language)}
          </p>
          
          {/* Enhanced Real-time indicator */}
          {isSyncing && (
            <div className="mt-4 sm:mt-6 flex items-center justify-center space-x-3 text-orange-100 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span className="text-sm sm:text-base">{t('updating_menu', language)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Enhanced Search with suggestions */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={t('search_placeholder', language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 sm:h-11 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Search suggestions */}
              {searchQuery && filteredItems.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 mb-2">{tWithParams('search_results', language, { count: filteredItems.length })}</p>
                    {filteredItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                        onClick={() => {
                          setSearchQuery(item.name);
                          // Scroll to the item
                          const element = document.getElementById(`menu-item-${item.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                      >
                        <div className="w-8 h-8 rounded overflow-hidden">
                          <Image
                            src={getFoodImage(item.id)}
                            alt={item.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">{t('currency', language)}{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Sort with better styling */}
            <div className="w-full sm:w-48 lg:w-56">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 sm:h-11 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('sort', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name" className="hover:bg-orange-50">
                    <div className="flex items-center">
                      <span>{t('name', language)}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="price-low" className="hover:bg-orange-50">
                    <div className="flex items-center">
                      <span>{t('price_low', language)}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="price-high" className="hover:bg-orange-50">
                    <div className="flex items-center">
                      <span>{t('price_high', language)}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick filters */}
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="h-10 sm:h-11 transition-all duration-200"
              >
                {t('all_items', language)}
              </Button>
              <Button
                variant={selectedCategory === 'biryanis' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('biryanis')}
                className="h-10 sm:h-11 transition-all duration-200"
              >
                {t('biryanis', language)}
              </Button>
              <Button
                variant={selectedCategory === 'vegCurries' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('vegCurries')}
                className="h-10 sm:h-11 transition-all duration-200"
              >
                {t('veg', language)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories (sticky under header) */}
      <div ref={categoriesRef} className="bg-white border-b sticky top-[56px] sm:top-[72px] z-40 backdrop-blur bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ElegantCategoryTabs
            categories={menuCategories}
            activeCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* Enhanced Menu Items Grid */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="relative">
                <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-4 text-orange-500 animate-spin" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200 to-transparent animate-pulse rounded-full"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">{t('loading_menu', language)}</h3>
              <p className="text-sm text-gray-500">{t('fetching_latest', language)}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="relative mb-6">
                <ChefHat className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto text-gray-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-red-100 rounded-full blur-xl opacity-50"></div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-3">{t('no_items_found', language)}</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                {t('try_different_search', language)}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {menuCategories.slice(0, 4).map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="transition-all duration-200 hover:bg-orange-50"
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Results summary */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {tWithParams('showing_items', language, { count: filteredItems.length, total: allMenuItems.length })}
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">
                      &ldquo;{searchQuery}&rdquo;
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{tWithParams('sort_by', language, { option: t(sortBy, language) })}</span>
                </div>
              </div>

              {/* Enhanced Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {filteredItems.map((item, index) => {
                  const cartItem = state.items.find(cartItem => cartItem.id === item.id);
                  const quantity = cartItem?.quantity || 0;

                  // Always use correct image from getFoodImage
                  const itemWithImage = {
                    ...item,
                    image: getFoodImage(item.id)
                  };

                  return (
                    <div
                      key={item.id}
                      id={`menu-item-${item.id}`}
                      className="animate-fadeInUp"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <PremiumMenuCard
                        item={itemWithImage}
                        quantity={quantity}
                        onAdd={() => addToCart(itemWithImage, 1)}
                        onRemove={() => removeFromCart(item.id)}
                        onUpdateQuantity={(newQuantity: number) => updateQuantity(item.id, newQuantity)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Load more indicator for large menus */}
              {filteredItems.length > 20 && (
                <div className="text-center mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {tWithParams('showing_items', language, { count: Math.min(filteredItems.length, 20), total: filteredItems.length })}
                  </p>
                </div>
              )}
            </>
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

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Floating Action Button (desktop/tablet only) */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-3">
          {/* Quick Cart Button */}
          {state.totalItems > 0 && (
            <Button
              onClick={() => setCartOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-bounce-in"
            >
              <div className="relative">
                <span className="text-white font-bold">{state.totalItems}</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </Button>
          )}
          
          {/* Quick Actions Button */}
          <div className="relative group">
            <Button
              onClick={() => setShowOrderHistory(true)}
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-orange-200 hover:border-orange-400"
            >
              <Clock className="w-5 h-5 text-orange-600" />
            </Button>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {t('order_history', language)}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex items-center justify-around h-14 px-2 pb-[calc(env(safe-area-inset-bottom,0px))]">
          {/* Search */}
          <button
            className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600"
            onClick={() => {
              searchInputRef.current?.focus();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Search</span>
          </button>

          {/* Categories */}
          <button
            className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600"
            onClick={() => {
              const el = categoriesRef.current;
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 60;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
          >
            <List className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Categories</span>
          </button>

          {/* Orders */}
          <button
            className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600"
            onClick={() => setShowOrderHistory(true)}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Orders</span>
          </button>

          {/* Cart */}
          <button
            className="relative flex flex-col items-center justify-center text-gray-600 hover:text-orange-600"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Cart</span>
            {state.totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {state.totalItems > 99 ? '99+' : state.totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}