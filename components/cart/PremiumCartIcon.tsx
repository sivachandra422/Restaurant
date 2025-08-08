'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

export function PremiumCartIcon() {
  const { state, setCartOpen } = useCart();

  return (
    <button
      id="cart-button"
      onClick={() => setCartOpen(true)}
      className={cn(
        'relative p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200',
        'bg-white shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl border border-stone-200',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
        state.totalItems > 0 && 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
      )}
    >
      <ShoppingBag 
        className={cn(
          'w-4 h-4 sm:w-6 sm:h-6',
          state.totalItems > 0 ? 'text-amber-700' : 'text-stone-600'
        )} 
      />
      
      {state.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-pulse">
          {state.totalItems > 99 ? '99+' : state.totalItems}
        </span>
      )}
    </button>
  );
}