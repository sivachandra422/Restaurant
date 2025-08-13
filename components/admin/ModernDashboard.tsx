'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Target,
  Utensils,
  BarChart3,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardMetric {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  table: string;
  amount: number;
  status: string;
  time: string;
  items: number;
}

interface TopItem {
  name: string;
  orders: number;
  revenue: number;
  trend: number;
}

export default function ModernDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with real API calls
  const metrics: DashboardMetric[] = [
    {
      title: 'Total Revenue',
      value: '₹12,950',
      change: 12.5,
      changeType: 'increase',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      description: 'All time revenue'
    },
    {
      title: 'Total Orders',
      value: '22',
      change: 8.2,
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      description: 'All time orders'
    },
    {
      title: 'Unique Customers',
      value: '21',
      change: -2.1,
      changeType: 'decrease',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      description: 'Total customers'
    },
    {
      title: 'Avg Order Value',
      value: '₹589',
      change: 15.3,
      changeType: 'increase',
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      description: 'Per order average'
    }
  ];

  const recentOrders: RecentOrder[] = [
    {
      id: '077205',
      customer: 'Rahul Kumar',
      table: 'Table 3',
      amount: 600,
      status: 'delivered',
      time: '2 min ago',
      items: 4
    },
    {
      id: '022028',
      customer: 'Priya Sharma',
      table: 'Table 7',
      amount: 450,
      status: 'preparing',
      time: '5 min ago',
      items: 3
    },
    {
      id: '493597',
      customer: 'Amit Patel',
      table: 'Table 2',
      amount: 780,
      status: 'ready',
      time: '8 min ago',
      items: 2
    }
  ];

  const topItems: TopItem[] = [
    { name: 'Chicken 555', orders: 7, revenue: 1540, trend: 12.5 },
    { name: 'Chicken 65', orders: 5, revenue: 1000, trend: 8.2 },
    { name: 'Mughlai Biryani', orders: 4, revenue: 800, trend: 15.3 },
    { name: 'Paneer Butter Masala', orders: 3, revenue: 600, trend: -2.1 }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    
    // Update time every minute
    const timeTimer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(timeTimer);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'ready': return '🚀';
      case 'preparing': return '👨‍🍳';
      case 'pending': return '⏳';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
            <p className="text-orange-100 text-lg">
              Here&apos;s what&apos;s happening at Sri Kanya Family Restaurant today
            </p>
            <div className="flex items-center space-x-4 mt-4 text-orange-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Activity className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.title}
                </CardTitle>
                <div className={`w-10 h-10 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {metric.value}
                </div>
                <div className="flex items-center space-x-2">
                  {metric.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {metric.change}%
                  </span>
                  <span className="text-sm text-slate-500">
                    {metric.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                  <span>Recent Orders</span>
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Live Updates
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        #{order.id.slice(-4)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{order.customer}</h4>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <span>{order.table}</span>
                          <span>•</span>
                          <span>{order.items} items</span>
                          <span>•</span>
                          <span>{order.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">₹{order.amount}</div>
                      <Badge className={`${getStatusColor(order.status)} text-xs`}>
                        {getStatusIcon(order.status)} {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Items */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>Top Selling Items</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-slate-500">{item.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">₹{item.revenue}</div>
                      <div className={`text-xs ${
                        item.trend > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {item.trend > 0 ? '+' : ''}{item.trend}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <Button variant="outline" className="w-full">
                  View Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
              <ShoppingCart className="w-6 h-6" />
              <span className="text-sm">New Order</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
              <Utensils className="w-6 h-6" />
              <span className="text-sm">Add Menu Item</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              <Settings className="w-6 h-6" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
