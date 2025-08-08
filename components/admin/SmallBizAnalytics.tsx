'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ShoppingCart, DollarSign, Star, Clock } from 'lucide-react';

export default function SmallBizAnalytics({
  analytics,
  orders,
  onRefresh,
}: {
  analytics: any;
  orders: any[];
  onRefresh: () => void;
}) {
  const { todayOrders, todayRevenue, avgRating } = useMemo(() => {
    const today = new Date().toDateString();
    const todaysOrders = (orders || []).filter((o) => new Date(o.createdAt || o.timestamp).toDateString() === today);
    const todayRevenue = todaysOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const rated = (orders || []).filter((o) => typeof o.rating === 'number');
    const avgRating = rated.length > 0 ? rated.reduce((s, o) => s + (o.rating || 0), 0) / rated.length : 0;
    return { todayOrders: todaysOrders.length, todayRevenue, avgRating };
  }, [orders]);

  const popularItems = analytics?.popularItems || [];
  const revenueByDay = analytics?.revenueByDay || [];

  return (
    <div className="space-y-4">
      {/* KPI Row - mobile first */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-1 text-blue-900">
              <DollarSign className="w-4 h-4" /> Today Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold text-blue-900">₹{todayRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-1 text-green-900">
              <ShoppingCart className="w-4 h-4" /> Today Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold text-green-900">{todayOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hidden sm:block">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-1 text-purple-900">
              <Star className="w-4 h-4" /> Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-purple-900">{(analytics?.customerSatisfaction || avgRating).toFixed(1)}/5</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 hidden sm:block">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-1 text-stone-900">
              <Clock className="w-4 h-4" /> All Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-stone-900">{orders?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Items */}
      {popularItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {popularItems.slice(0, 5).map((item: any, index: number) => (
                <div key={item.name || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs text-gray-600">₹{(item.revenue || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue last 7 days (simple bars) */}
      {revenueByDay.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Last 7 Days Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="h-28 flex items-end justify-between gap-1">
              {revenueByDay.slice(-7).map((d: any) => {
                const max = Math.max(...revenueByDay.map((x: any) => x.revenue || 1));
                const h = Math.max(4, Math.round(((d.revenue || 0) / max) * 100));
                return (
                  <div key={d.date} className="flex flex-col items-center gap-1">
                    <div className="w-6 bg-orange-400/80 rounded-t" style={{ height: `${h}%` }} />
                    <span className="text-[10px] text-gray-500">
                      {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Analytics
        </Button>
      </div>
    </div>
  );
}


