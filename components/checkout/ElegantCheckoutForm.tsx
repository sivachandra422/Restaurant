'use client';

import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { X, User, Phone, MessageSquare } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { PremiumButton } from '@/components/ui/PremiumButton';

interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  specialInstructions: string;
}

export function ElegantCheckoutForm() {
  const { state, setCheckoutOpen, clearCart } = useCart();
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    specialInstructions: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  if (!state.isCheckoutOpen) return null;

  // Simple phone validation (India mobile format)
  function validatePhone(phone: string) {
    return /^\+?91[\-\s]?\d{10}$/.test(phone) || /^\d{10}$/.test(phone);
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CheckoutFormData) => ({ ...prev, [name]: value }));
    setFormError(null);
    setApiError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setApiError(null);

    // Validation
    if (!formData.customerName.trim()) {
      setFormError('Please enter your name.');
      nameInputRef.current?.focus();
      return;
    }
    if (!formData.customerPhone.trim()) {
      setFormError('Please enter your phone number.');
      phoneInputRef.current?.focus();
      return;
    }
    if (!validatePhone(formData.customerPhone.trim())) {
      setFormError('Please enter a valid 10-digit Indian phone number.');
      phoneInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      orderId: `SRK-${Date.now()}`,
      restaurantName: 'Sri Kanya Family Restaurants',
      tableNumber: state.tableNumber || 0,
      timestamp: new Date().toISOString(),
      customer: {
        name: formData.customerName,
        phone: formData.customerPhone,
      },
      items: state.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.subtotal,
        category: item.category,
        isVeg: item.isVeg,
        isSignature: item.isSignature || false,
      })),
      orderSummary: {
        itemCount: state.totalItems,
        subtotal: state.totalAmount,
        tax: 0,
        serviceCharge: 0,
        discount: 0,
        grandTotal: state.totalAmount,
      },
      specialInstructions: formData.specialInstructions,
      orderType: 'dine-in',
      estimatedTime: '20-25 minutes',
      status: 'received',
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setOrderPlaced(true);
        setTimeout(() => {
          setOrderPlaced(false);
          setCheckoutOpen(false);
          clearCart();
          setFormData({
            customerName: '',
            customerPhone: '',
            specialInstructions: '',
          });
        }, 3000);
      } else {
        const data = await response.json();
        setApiError(data.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      setApiError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center" role="alert" aria-live="polite">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed!</h2>
            <p className="text-stone-600 mb-4">
              Your order has been received and will be prepared shortly.
            </p>
            <p className="text-sm text-stone-500">
              Estimated time: 20-25 minutes
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <h2 className="text-xl font-bold text-stone-900" id="checkout-title">Complete Your Order</h2>
            <button
              onClick={() => setCheckoutOpen(false)}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Close checkout dialog"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="p-6 bg-stone-50">
            <h3 className="font-medium text-stone-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {state.items.map((item: typeof state.items[number]) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.subtotal}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-300 mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-amber-600">₹{state.totalAmount}</span>
            </div>
            {state.tableNumber && (
              <div className="mt-2 text-sm text-stone-600">
                Table: {state.tableNumber}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
            {/* Error Messages */}
            {formError && (
              <div className="bg-red-100 text-red-700 rounded-lg px-4 py-2 mb-2" role="alert">{formError}</div>
            )}
            {apiError && (
              <div className="bg-red-100 text-red-700 rounded-lg px-4 py-2 mb-2" role="alert">{apiError}</div>
            )}
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="customerName">
                <User className="w-4 h-4 inline mr-2" />
                Your Name
              </label>
              <input
                type="text"
                name="customerName"
                id="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                placeholder="Enter your name"
                ref={nameInputRef}
                aria-required="true"
                aria-invalid={!!formError && formError.toLowerCase().includes('name')}
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="customerPhone">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="customerPhone"
                id="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                placeholder="+91-XXXXXXXXXX"
                ref={phoneInputRef}
                aria-required="true"
                aria-invalid={!!formError && formError.toLowerCase().includes('phone')}
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="specialInstructions">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Special Instructions (Optional)
              </label>
              <textarea
                name="specialInstructions"
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none"
                placeholder="Any special requests or dietary requirements..."
              />
            </div>

            {/* Submit Button */}
            <PremiumButton
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
              aria-disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </PremiumButton>
          </form>
        </div>
      </div>
    </>
  );
}