'use client';

import React, { useState } from 'react';
import { Clock, Star, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerExperience } from '@/contexts/CustomerExperienceContext';
import { OrderFeedback } from '@/components/ui/OrderFeedback';

interface OrderHistoryProps {
  onClose: () => void;
}

export function OrderHistory({ onClose }: OrderHistoryProps) {
  const { orderHistory } = useCustomerExperience();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFeedbackSubmit = async (rating: number, feedback?: string) => {
    try {
      // Feedback will be handled by the OrderFeedback component
      setShowFeedback(false);
      setSelectedOrderId('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    setSelectedOrderId('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showFeedback) {
    return (
      <OrderFeedback
        orderId={selectedOrderId}
        onSubmit={handleFeedbackSubmit}
        onClose={handleFeedbackClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
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
          {orderHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
              <p className="text-gray-500">
                Your order history will appear here once you place your first order.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Recent Orders ({orderHistory.length})</h3>
              {orderHistory.map((order) => (
                <Card key={order.orderId} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-sm font-medium">
                          Order #{order.orderId.slice(-6)}
                        </CardTitle>
                        <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{order.totalAmount}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Order Items */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Items:</strong>
                        </p>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} × {item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            <strong>Table:</strong> {order.tableNumber}
                          </p>
                          <p className="text-gray-600">
                            <strong>Time:</strong> {new Date(order.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            <strong>Status:</strong> {order.status}
                          </p>
                          {order.rating && (
                            <p className="text-gray-600">
                              <strong>Rating:</strong> {order.rating}/5 ⭐
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {order.status === 'completed' && !order.rating && (
                          <Button
                            onClick={() => {
                              setSelectedOrderId(order.orderId);
                              setShowFeedback(true);
                            }}
                            size="sm"
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                          >
                            <Star className="w-4 h-4" />
                            Rate Order
                          </Button>
                        )}
                        {order.rating && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Rated {order.rating}/5</span>
                            {order.feedback && (
                              <Button
                                onClick={() => {
                                  // Show feedback details
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                View Feedback
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 