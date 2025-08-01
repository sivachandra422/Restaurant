'use client';

import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { X, User, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useCustomerExperience } from '@/contexts/CustomerExperienceContext';
import { PremiumButton } from '@/components/ui/PremiumButton';

interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  specialInstructions: string;
}

export function ElegantCheckoutForm() {
  const { state, setCheckoutOpen, clearCart } = useCart();
  const { addOrder, addRating } = useAnalytics();
  const { addToOrderHistory } = useCustomerExperience();
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    specialInstructions: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  if (!state.isCheckoutOpen) return null;

  // Simple phone validation (India mobile format)
  function validatePhone(phone: string) {
    return /^\+?91[\-\s]?\d{10}$/.test(phone) || /^\d{10}$/.test(phone);
  }

  // Validate order quantities
  function validateOrderQuantities() {
    for (const item of state.items) {
      if (item.maxQuantity && item.quantity > item.maxQuantity) {
        return `Quantity exceeds limit for ${item.name} (max: ${item.maxQuantity})`;
      }
    }
    return null;
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

    // Validate quantities
    const quantityError = validateOrderQuantities();
    if (quantityError) {
      setFormError(quantityError);
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      orderId: `SRK-${Date.now()}`,
      restaurantName: 'Sri Kanya Restaurant',
      tableNumber: state.tableNumber || 0,
      sessionId: state.sessionId || `table-${state.tableNumber}-${Date.now()}`,
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
        maxQuantity: item.maxQuantity,
        bulkPricing: item.bulkPricing,
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
      status: 'received' as const,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-api-key-123',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        // Add order to history
        addToOrderHistory({
          orderId: orderData.orderId,
          timestamp: orderData.timestamp,
          items: state.items,
          totalAmount: state.totalAmount,
          tableNumber: state.tableNumber || 0,
          status: 'pending',
        });

        // Add order to analytics with pending status
        addOrder({
          orderId: orderData.orderId,
          timestamp: orderData.timestamp,
          items: state.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: state.totalAmount,
          tableNumber: state.tableNumber || 0,
          customerName: formData.customerName,
          preparationTime: Math.max(15, Math.floor(Math.random() * 30) + 15), // Simulated prep time
          status: 'pending',
          paymentStatus: 'pending',
        });

        setOrderPlaced(true);
        setCurrentOrderId(orderData.orderId);
        clearCart();
        
        // Don't show feedback immediately - customer should receive order first
        // Feedback will be available in order history later
      } else {
        setApiError(result.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCheckoutOpen(false);
    setFormError(null);
    setApiError(null);
  };



  if (orderPlaced) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-4">
            Your order has been received and is being prepared.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800">
              <strong>Order ID:</strong> {currentOrderId}
            </p>
            <p className="text-sm text-green-800">
              <strong>Table:</strong> {state.tableNumber}
            </p>
            <p className="text-sm text-green-800">
              <strong>Estimated Time:</strong> 20-25 minutes
            </p>
          </div>
          <button
            onClick={handleClose}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Complete Your Order</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Messages */}
          {(formError || apiError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{formError || apiError}</p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.name} × {item.quantity}
                    </p>
                    {item.maxQuantity && item.quantity >= item.maxQuantity && (
                      <p className="text-xs text-red-600">
                        Max quantity reached ({item.maxQuantity})
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">₹{item.subtotal}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-lg text-gray-800">₹{state.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Your Name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                ref={phoneInputRef}
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Special Instructions (Optional)
              </label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                placeholder="Any special requests or dietary preferences..."
              />
            </div>
          </div>

          {/* Session Information */}
          {state.sessionId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Session Information</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Table:</strong> {state.tableNumber}</p>
                <p><strong>Session ID:</strong> {state.sessionId}</p>
                <p><strong>Items:</strong> {state.totalItems}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <PremiumButton
            type="submit"
            disabled={isSubmitting || state.items.length === 0}
            className="w-full py-3 text-lg font-semibold"
          >
            {isSubmitting ? 'Placing Order...' : `Place Order - ₹${state.totalAmount}`}
          </PremiumButton>
        </form>
      </div>
    </div>
  );
}