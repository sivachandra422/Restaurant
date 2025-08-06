'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Activity, Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react';

export default function RealTimeTest() {
  const { analytics, isRealTimeConnected, lastRealTimeUpdate, connectRealTime, disconnectRealTime, refreshAnalytics } = useAnalytics();
  const [isTesting, setIsTesting] = useState(false);

  const testRealTimeUpdate = async () => {
    setIsTesting(true);
    try {
      // Create a real test order instead of mock analytics
      const response = await fetch('/api/test/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Test order created:', result);
        
        // Refresh analytics to show real data
        await refreshAnalytics();
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('new-order', {
          detail: { order: result.order }
        }));
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
            className="bg-black hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Creating...' : 'Simulate New Order'}
          </Button>
          
          <Button 
            onClick={refreshAnalytics}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Analytics
          </Button>
        </div>

        {/* Real Analytics Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">₹{analytics.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">₹{analytics.averageOrderValue.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Avg Order Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{analytics.todayOrders}</div>
            <div className="text-sm text-gray-600">Today&apos;s Orders</div>
          </div>
        </div>

        {/* Popular Items */}
        {analytics.popularItems.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Top Selling Items:</h4>
            <div className="space-y-1">
              {analytics.popularItems.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-medium">{item.count} orders</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 