'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  ShoppingCart,
  ChefHat,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Settings,
  Bell,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';

interface DashboardProps {
  analytics: any;
  orders: any[];
  settings: any;
  notifications: any[];
  onRefresh: () => void;
  onOrderClick: (order: any) => void;
}

export default function AdvancedDashboard({ 
  analytics, 
  orders, 
  settings, 
  notifications, 
  onRefresh, 
  onOrderClick 
}: DashboardProps) {
  const [timeRange, setTimeRange] = useState('today');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    await onRefresh();
    setIsLoading(false);
  };

  // Calculate real-time metrics
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.timestamp || order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => 
    order.status === 'completed' || 
    order.status === 'delivered' || 
    order.status === 'served' || 
    order.status === 'ready'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600">
            Welcome back! Here&apos;s what&apos;s happening at {settings?.restaurant?.name || 'Sri Kanya Family Restaurant'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Today&apos;s Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">₹{todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-blue-700">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Today&apos;s Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{todayOrders.length}</div>
            <p className="text-xs text-green-700">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{pendingOrders}</div>
            <p className="text-xs text-orange-700">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {analytics?.customerSatisfaction ? analytics.customerSatisfaction.toFixed(1) : '0.0'}/5
            </div>
            <p className="text-xs text-purple-700">
              Based on {analytics?.recentOrders?.filter((order: any) => order.rating !== undefined)?.length || 0} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Revenue Trends</span>
              <Badge variant="secondary">+15% this week</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics?.revenueByDay?.slice(-7).map((day: any, index: number) => (
                <div key={day.date} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-8 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t"
                    style={{ height: `${(day.revenue / Math.max(...analytics.revenueByDay.map((d: any) => d.revenue))) * 200}px` }}
                  />
                  <span className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Today&apos;s revenue compared to yesterday&apos;s performance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Popular Items</span>
              <ChefHat className="h-4 w-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.popularItems?.slice(0, 5).map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.count} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <Badge variant="secondary">{completedOrders}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <Badge variant="secondary">{pendingOrders}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Cancelled</span>
                </div>
                <Badge variant="secondary">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.peakHours?.slice(0, 6).map((hour: any) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-sm">{hour.hour}:00</span>
                  <div className="flex items-center space-x-2">
                    {/* <Progress value={hour.orders} className="w-20" /> */}
                    <span className="text-xs text-gray-500">{hour.orders} orders</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Alerts</span>
              <Bell className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications?.slice(0, 4).map((notification: any) => (
                <div key={notification.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.priority === 'high' ? 'bg-red-500' : 
                    notification.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Orders</span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium">Order ID</th>
                  <th className="text-left py-2 text-sm font-medium">Table</th>
                  <th className="text-left py-2 text-sm font-medium">Items</th>
                  <th className="text-left py-2 text-sm font-medium">Amount</th>
                  <th className="text-left py-2 text-sm font-medium">Status</th>
                  <th className="text-left py-2 text-sm font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order: any) => (
                  <tr 
                    key={order._id || order.orderId} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => onOrderClick(order)}
                  >
                    <td className="py-3 text-sm">#{order.orderId?.slice(-6) || 'N/A'}</td>
                    <td className="py-3 text-sm">Table {order.tableNumber}</td>
                    <td className="py-3 text-sm">{order.items?.length || 0} items</td>
                    <td className="py-3 text-sm font-medium">₹{order.totalAmount || 0}</td>
                    <td className="py-3">
                      <Badge 
                        variant={order.status === 'completed' ? 'default' : 'secondary'}
                        className={order.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                      >
                        {order.status || 'completed'}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(order.timestamp || order.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Info */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{settings?.restaurant?.contact?.address}</p>
                  <p className="text-sm text-gray-500">Address</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{settings?.restaurant?.contact?.phone}</p>
                  <p className="text-sm text-gray-500">Phone</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{settings?.restaurant?.contact?.email}</p>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Operating Hours</h4>
                <div className="space-y-1 text-sm">
                  {settings?.operatingHours && Object.entries(settings.operatingHours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize">{day}</span>
                      <span>{hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 