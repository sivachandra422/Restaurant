'use client';

import React, { useState } from 'react';
import { CreditCard, Cash, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/contexts/AnalyticsContext';

interface PaymentConfirmationProps {
  onClose: () => void;
}

export function PaymentConfirmation({ onClose }: PaymentConfirmationProps) {
  const { getPendingOrders, updateOrderStatus } = useAnalytics();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'phonepe'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingOrders = getPendingOrders();

  const handlePaymentConfirm = async () => {
    if (!selectedOrderId) return;
    
    setIsProcessing(true);
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update order status to paid
      updateOrderStatus(selectedOrderId, 'paid', 'paid', paymentMethod);
      
      setSelectedOrderId('');
      setPaymentMethod('cash');
    } catch (error) {
      console.error('Error confirming payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOrderCancel = async (orderId: string) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      updateOrderStatus(orderId, 'cancelled', 'failed');
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pendingOrders.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Pending Orders</h2>
          <p className="text-gray-600 mb-6">
            All orders have been processed or there are no pending payments.
          </p>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Payment Confirmation</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Orders */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pending Orders ({pendingOrders.length})</h3>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card 
                    key={order.orderId}
                    className={`cursor-pointer transition-all ${
                      selectedOrderId === order.orderId 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedOrderId(order.orderId)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Order #{order.orderId.slice(-6)}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          ₹{order.totalAmount}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Customer:</strong> {order.customerName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Table:</strong> {order.tableNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Items:</strong> {order.items.length}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              {selectedOrderId ? (
                <div className="space-y-6">
                                     {/* Payment Method Selection */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-3">
                       Payment Method
                     </label>
                     <div className="grid grid-cols-2 gap-3">
                       <Button
                         variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                         onClick={() => setPaymentMethod('cash')}
                         className="flex items-center gap-2"
                       >
                         <Cash className="w-4 h-4" />
                         Cash
                       </Button>
                       <Button
                         variant={paymentMethod === 'phonepe' ? 'default' : 'outline'}
                         onClick={() => setPaymentMethod('phonepe')}
                         className="flex items-center gap-2"
                       >
                         <Smartphone className="w-4 h-4" />
                         PhonePe QR
                       </Button>
                     </div>
                   </div>

                                     {/* Order Details */}
                   <div className="bg-gray-50 rounded-lg p-4">
                     <h4 className="font-medium mb-3">Order Summary</h4>
                     {pendingOrders.find(o => o.orderId === selectedOrderId) && (
                       <div className="space-y-2">
                         <div className="flex justify-between text-sm">
                           <span>Order ID:</span>
                           <span className="font-mono">#{selectedOrderId.slice(-6)}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                           <span>Customer:</span>
                           <span>{pendingOrders.find(o => o.orderId === selectedOrderId)?.customerName}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                           <span>Table:</span>
                           <span>{pendingOrders.find(o => o.orderId === selectedOrderId)?.tableNumber}</span>
                         </div>
                         <div className="flex justify-between text-sm font-medium">
                           <span>Total Amount:</span>
                           <span>₹{pendingOrders.find(o => o.orderId === selectedOrderId)?.totalAmount}</span>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Payment Instructions */}
                   {paymentMethod === 'phonepe' && (
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                       <h4 className="font-medium mb-2 text-blue-800">PhonePe Payment Instructions</h4>
                       <div className="space-y-2 text-sm text-blue-700">
                         <p>1. Ask customer to scan your PhonePe QR code</p>
                         <p>2. Enter amount: ₹{pendingOrders.find(o => o.orderId === selectedOrderId)?.totalAmount}</p>
                         <p>3. Verify payment received on your PhonePe app</p>
                         <p>4. Click "Confirm Payment" below</p>
                       </div>
                     </div>
                   )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleOrderCancel(selectedOrderId)}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                    <Button
                      onClick={handlePaymentConfirm}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Confirm Payment'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select an order to process payment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 