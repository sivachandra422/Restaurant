'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Activity, Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react';

export default function RealTimeTest() {
  const { analytics, isRealTimeConnected, lastRealTimeUpdate, connectRealTime, disconnectRealTime } = useAnalytics();
  const [isTesting, setIsTesting] = useState(false);

  const testRealTimeUpdate = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/admin/analytics/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'newOrder',
          data: { orderId: `TEST-${Date.now()}` }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Test analytics update:', result);
      }
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Real-Time Analytics Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRealTimeConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}
            {lastRealTimeUpdate && (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Last update: {formatTime(lastRealTimeUpdate)}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={connectRealTime}
              disabled={isRealTimeConnected}
            >
              Connect
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={disconnectRealTime}
              disabled={!isRealTimeConnected}
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={testRealTimeUpdate} 
            disabled={isTesting || !isRealTimeConnected}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testing...' : 'Simulate New Order'}
          </Button>
        </div>

        {/* Current Analytics Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ₹{analytics.totalRevenue?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analytics.totalOrders || 0}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ₹{analytics.averageOrderValue?.toFixed(0) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Order Value</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analytics.todayOrders || 0}
            </div>
            <div className="text-sm text-gray-600">Today&apos;s Orders</div>
          </div>
        </div>

        {/* New Orders Notification */}
        {analytics.newOrdersCount && analytics.newOrdersCount > 0 && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">
                {analytics.newOrdersCount} new order{analytics.newOrdersCount > 1 ? 's' : ''} received!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 