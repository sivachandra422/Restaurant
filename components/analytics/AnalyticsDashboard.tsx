'use client';

import React, { useState } from 'react';
import { Printer, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export function AnalyticsDashboard() {
  const { analytics } = useAnalytics();
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handlePrintOrders = () => {
    setShowPrintModal(true);
    // Print functionality will be implemented here
    setTimeout(() => {
      window.print();
      setShowPrintModal(false);
    }, 100);
  };

  if (analytics.totalOrders === 0) {
    return null; // Don't show anything if no orders
  }

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
        <Button
          onClick={handlePrintOrders}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Orders
        </Button>
      </div>
      
      <div className="space-y-3">
        {analytics.recentOrders.slice(0, 5).map((order) => (
          <Card key={order.orderId} className="text-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order #{order.orderId.slice(-6)}</p>
                  <p className="text-gray-600">Table {order.tableNumber} • ₹{order.totalAmount}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(order.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {order.items.length} items
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Printing Orders...</h3>
            <p className="text-gray-600">Orders will be sent to your printer</p>
          </div>
        </div>
      )}
    </div>
  );
} 