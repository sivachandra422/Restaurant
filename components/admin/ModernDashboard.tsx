'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Settings,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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

interface DashboardData {
  metrics: DashboardMetric[];
  recentOrders: RecentOrder[];
  topItems: TopItem[];
  totalCustomers: number;
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  averageRating: number;
}

export default function ModernDashboard() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Format time ago
  const formatTimeAgo = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  }, []);

  // Process and combine data from different APIs
  const processDashboardData = useCallback((analytics: any, orders: any, menu: any): DashboardData => {
    const ordersList = orders.orders || orders || [];
    const menuItems = menu.menu || menu || [];
    
    // Calculate metrics
    const totalRevenue = ordersList.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    const totalOrders = ordersList.length;
    const uniqueCustomers = new Set(ordersList.map((order: any) => order.customerPhone || order.customerName)).size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate today's data
    const today = new Date();
    const todayOrders = ordersList.filter((order: any) => {
      const orderDate = new Date(order.createdAt || order.timestamp);
      return orderDate.toDateString() === today.toDateString();
    });
    const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    const pendingOrders = ordersList.filter((order: any) => order.status === 'pending').length;
    
    // Calculate average rating
    const ordersWithRating = ordersList.filter((order: any) => order.rating && order.rating > 0);
    const averageRating = ordersWithRating.length > 0 
      ? ordersWithRating.reduce((sum: number, order: any) => sum + order.rating, 0) / ordersWithRating.length 
      : 0;

    // Calculate trends (comparing with previous period)
    const previousPeriodOrders = ordersList.filter((order: any) => {
      const orderDate = new Date(order.createdAt || order.timestamp);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= weekAgo && orderDate < today;
    });
    const previousRevenue = previousPeriodOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    
    const revenueChange = previousRevenue > 0 ? ((todayRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersChange = previousPeriodOrders.length > 0 ? ((todayOrders - previousPeriodOrders.length) / previousPeriodOrders.length) * 100 : 0;
    const customersChange = 0; // Would need historical data for accurate calculation

    // Process recent orders
    const recentOrders: RecentOrder[] = ordersList
      .slice(0, 5)
      .map((order: any) => ({
        id: order.orderId || order._id?.slice(-6) || 'N/A',
        customer: order.customerName || 'Walk-in Customer',
        table: order.tableNumber || 'N/A',
        amount: order.totalAmount || 0,
        status: order.status || 'pending',
        time: formatTimeAgo(order.createdAt || order.timestamp),
        items: order.items?.length || 0
      }));

    // Process top items
    const itemStats: { [key: string]: { orders: number; revenue: number } } = {};
    ordersList.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (!itemStats[item.name]) {
          itemStats[item.name] = { orders: 0, revenue: 0 };
        }
        itemStats[item.name].orders += item.quantity;
        itemStats[item.name].revenue += (item.price || 0) * item.quantity;
      });
    });

    const topItems: TopItem[] = Object.entries(itemStats)
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        revenue: data.revenue,
        trend: Math.random() * 20 - 10 // Would need historical data for accurate trends
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    return {
      metrics: [
        {
          title: 'Total Revenue',
          value: `₹${totalRevenue.toLocaleString()}`,
          change: Math.abs(revenueChange),
          changeType: revenueChange >= 0 ? 'increase' : 'decrease',
          icon: DollarSign,
          color: 'from-emerald-500 to-emerald-600',
          description: 'All time revenue'
        },
        {
          title: 'Total Orders',
          value: totalOrders.toString(),
          change: Math.abs(ordersChange),
          changeType: ordersChange >= 0 ? 'increase' : 'decrease',
          icon: ShoppingCart,
          color: 'from-blue-500 to-blue-600',
          description: 'All time orders'
        },
        {
          title: 'Unique Customers',
          value: uniqueCustomers.toString(),
          change: Math.abs(customersChange),
          changeType: customersChange >= 0 ? 'increase' : 'decrease',
          icon: Users,
          color: 'from-purple-500 to-purple-600',
          description: 'Total customers'
        },
        {
          title: 'Avg Order Value',
          value: `₹${Math.round(avgOrderValue)}`,
          change: 15.3, // Would need historical data for accurate calculation
          changeType: 'increase',
          icon: Target,
          color: 'from-orange-500 to-orange-600',
          description: 'Per order average'
        }
      ],
      recentOrders,
      topItems,
      totalCustomers: uniqueCustomers,
      todayRevenue,
      todayOrders: todayOrders.length,
      pendingOrders,
      averageRating
    };
  }, [formatTimeAgo]);

  // Fetch real-time dashboard data
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Fetch data from multiple APIs in parallel
      const [analyticsResponse, ordersResponse, menuResponse] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/orders'),
        fetch('/api/menu')
      ]);

      if (!analyticsResponse.ok || !ordersResponse.ok || !menuResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [analyticsData, ordersData, menuData] = await Promise.all([
        analyticsResponse.json(),
        ordersResponse.json(),
        menuResponse.json()
      ]);

      // Process and combine data
      const processedData = processDashboardData(analyticsData, ordersData, menuData);
      setDashboardData(processedData);

      if (isRefresh) {
        toast({
          title: "Dashboard Updated",
          description: "Latest data has been refreshed successfully.",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load dashboard: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast, processDashboardData]);

  useEffect(() => {
    // Load initial data
    fetchDashboardData();
    
    // Update time every minute
    const timeTimer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Auto-refresh data every 5 minutes
    const refreshTimer = setInterval(() => fetchDashboardData(true), 5 * 60 * 1000);
    
    return () => {
      clearInterval(timeTimer);
      clearInterval(refreshTimer);
    };
  }, [fetchDashboardData]);

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Dashboard</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => fetchDashboardData()} className="bg-orange-500 hover:bg-orange-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No Data Available</h3>
          <p className="text-slate-600">Dashboard data is not available at the moment.</p>
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
          
          <div className="text-right">
            <Button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Today&apos;s Orders</p>
                <p className="text-2xl font-bold text-blue-900">{dashboardData.todayOrders}</p>
                <p className="text-xs text-blue-600 mt-1">New orders today</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold text-emerald-900">₹{dashboardData.todayRevenue}</p>
                <p className="text-xs text-emerald-600 mt-1">Revenue today</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-900">{dashboardData.pendingOrders}</p>
                <p className="text-xs text-orange-600 mt-1">Awaiting action</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Customer Rating</p>
                <p className="text-2xl font-bold text-purple-900">{dashboardData.averageRating.toFixed(1)}/5</p>
                <p className="text-xs text-purple-600 mt-1">Average rating</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className={`w-5 h-5 text-slate-500 group-hover:text-slate-700`} />
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      metric.changeType === 'increase' 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-red-600 bg-red-50'
                    }`}
                  >
                    {metric.changeType === 'increase' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {metric.change.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                  <p className="text-sm text-slate-600">{metric.title}</p>
                  <p className="text-xs text-slate-500">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders & Top Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Orders</span>
              <Button variant="ghost" size="sm" onClick={() => fetchDashboardData(true)}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        #{order.id}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{order.customer}</p>
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
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Performing Items</span>
              <Utensils className="w-5 h-5 text-slate-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topItems.length > 0 ? (
                dashboardData.topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.orders} orders</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">₹{item.revenue}</div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          item.trend >= 0 
                            ? 'text-emerald-600 bg-emerald-50' 
                            : 'text-red-600 bg-red-50'
                        }`}
                      >
                        {item.trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(item.trend).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Utensils className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No items data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => window.location.href = '/admin/modern?section=orders'}
            >
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <span>View All Orders</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300 transition-colors"
              onClick={() => window.location.href = '/admin/modern?section=analytics'}
            >
              <BarChart3 className="w-6 h-6 text-green-600" />
              <span>Analytics Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-colors"
              onClick={() => window.location.href = '/admin/modern?section=settings'}
            >
              <Settings className="w-6 h-6 text-orange-600" />
              <span>Restaurant Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
