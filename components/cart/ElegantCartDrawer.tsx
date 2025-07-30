'use client';

import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumBadge } from '@/components/ui/PremiumBadge';

export function ElegantCartDrawer() {
  const { state, setCartOpen, setCheckoutOpen, updateQuantity, removeFromCart } = useCart();

  if (!state.isCartOpen) return null;

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setCartOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-white z-50 shadow-2xl transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">Your Order</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {state.totalItems} item{state.totalItems !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[60vh]">
          {state.items.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🛒</div>
              <p className="text-stone-500 text-sm sm:text-base">Your cart is empty</p>
            </div>
          ) : (
            state.items.map((item) => (
              <div key={item.id} className="bg-stone-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  {/* Item Image */}
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <h3 className="font-medium text-stone-900 truncate pr-2 text-sm sm:text-base">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-1 mb-2 sm:mb-3">
                      {item.isVeg && <PremiumBadge variant="veg">Veg</PremiumBadge>}
                      {item.isSignature && <PremiumBadge variant="signature">Signature</PremiumBadge>}
                    </div>

                    {/* Quantity Controls & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-white rounded-lg border border-stone-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 rounded-l-lg"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium min-w-[2rem] sm:min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 rounded-r-lg"
                          disabled={item.quantity >= 10}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-amber-600 text-sm sm:text-base">
                        ₹{item.subtotal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-stone-200 p-4 sm:p-6 bg-white">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <span className="text-base sm:text-lg font-medium text-stone-900">Total</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-600">
                ₹{state.totalAmount}
              </span>
            </div>
            <PremiumButton
              onClick={handleCheckout}
              className="w-full"
              size="lg"
            >
              Proceed to Checkout
            </PremiumButton>
          </div>
        )}
      </div>
    </>
  );
}