'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Star,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeOrders } from '@/contexts/RealTimeOrderContext';

// Real analytics data interface
interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  popularItems: Array<{ name: string; count: number; revenue: number; avgRating: number }>;
  peakHours: Array<{ hour: string; orders: number; revenue: number }>;
  customerSatisfaction: number;
  customerReviewsCount: number;
  repeatCustomers: number;
  categoryPerformance: Array<{ category: string; orders: number; revenue: number; percentage: number }>;
  todayOrders: number;
  todayRevenue: number;
  orderStatusDistribution: Array<{ status: string; count: number }>;
  topCustomers: Array<{ name: string; orders: number; revenue: number; lastOrder: string }>;
  revenueTrends: Array<{ period: string; revenue: number; change: number }>;
  itemPerformance: Array<{ name: string; orders: number; revenue: number; avgRating: number }>;
  dataSource?: string;
  dataMessage?: string;
  trends?: {
    revenueChange: number;
    ordersChange: number;
    previousPeriodRevenue: number;
    previousPeriodCount: number;
  };
}

export default function ModernAnalytics() {
  const { toast } = useToast();
  const { orders: realTimeOrders, lastUpdate } = useRealTimeOrders();
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch real analytics data
  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch('/api/admin/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setAnalyticsData({
          ...result.data,
          dataSource: result.source,
          dataMessage: result.message
        });
        
        const sourceMessage = result.source === 'sample_data' 
          ? "Using sample data - Add real orders to see actual analytics"
          : result.source === 'real_orders'
          ? "Real-time analytics from your orders"
          : "Analytics loaded successfully";
          
        toast({
          title: "Analytics Updated",
          description: sourceMessage,
          variant: result.source === 'sample_data' ? "default" : "default"
        });
      } else {
        throw new Error(result.error || 'Failed to load analytics data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load analytics: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Load analytics on component mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh analytics every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => fetchAnalytics(true), 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchAnalytics]);

  // Real-time updates when orders change
  useEffect(() => {
    if (realTimeOrders && realTimeOrders.length > 0 && analyticsData) {
      // Update analytics in real-time when new orders come in
      const updateAnalytics = async () => {
        try {
          await fetchAnalytics(true);
        } catch (err) {
          console.log('Real-time analytics update failed, will retry on next interval');
        }
      };
      
      // Debounce real-time updates to avoid too frequent API calls
      const timeoutId = setTimeout(updateAnalytics, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [realTimeOrders, analyticsData, fetchAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  // Calculate trends based on real data
  const calculateTrends = () => {
    if (!analyticsData) return { revenue: { trend: 'up' as const, change: 0 }, orders: { trend: 'up' as const, change: 0 } };

    // Use real trend data from analytics API
    const revenueChange = analyticsData.trends?.revenueChange || 0;
    const ordersChange = analyticsData.trends?.ordersChange || 0;

    return {
      revenue: { trend: (revenueChange >= 0 ? 'up' : 'down') as 'up' | 'down', change: Math.abs(revenueChange) },
      orders: { trend: (ordersChange >= 0 ? 'up' : 'down') as 'up' | 'down', change: Math.abs(ordersChange) }
    };
  };

  const trends = calculateTrends();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchAnalytics()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Analytics data is not available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            {lastUpdate && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </div>
            )}
          </div>
          <p className="text-gray-600">
            Real-time insights into your restaurant performance
            {lastUpdate && (
              <span className="ml-2 text-sm text-gray-500">
                • Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
          {analyticsData?.dataSource && (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
              analyticsData.dataSource === 'sample_data' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                : analyticsData.dataSource === 'real_orders'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {analyticsData.dataSource === 'sample_data' && '⚠️ Sample Data'}
              {analyticsData.dataSource === 'real_orders' && '✅ Real Data'}
              {analyticsData.dataSource === 'mongodb' && '🗄️ Database Data'}
              <span className="ml-1">
                {analyticsData.dataSource === 'sample_data' 
                  ? 'Add real orders to see actual analytics'
                  : 'Live analytics from your restaurant'
                }
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {analyticsData?.dataSource === 'sample_data' && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch('/api/test/create-order', { method: 'POST' });
                  if (response.ok) {
                    toast({
                      title: "Test Order Created",
                      description: "A test order has been added. Refresh to see updated analytics.",
                    });
                    setTimeout(() => fetchAnalytics(true), 1000);
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to create test order",
                    variant: "destructive",
                  });
                }
              }}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Test Order
            </Button>
          )}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => fetchAnalytics(true)} 
            variant="outline" 
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(analyticsData.totalRevenue)}
            </div>
            <div className="flex items-center text-xs text-blue-700 mt-1">
              {getTrendIcon(trends.revenue.trend)}
              <span className={`ml-1 ${getTrendColor(trends.revenue.trend)}`}>
                {formatPercentage(trends.revenue.change)}
              </span>
              <span className="ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatNumber(analyticsData.totalOrders)}
            </div>
            <div className="flex items-center text-xs text-green-700 mt-1">
              {getTrendIcon(trends.orders.trend)}
              <span className={`ml-1 ${getTrendColor(trends.orders.trend)}`}>
                {formatPercentage(trends.orders.change)}
              </span>
              <span className="ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Avg Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(analyticsData.averageOrderValue)}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Per order average
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {analyticsData.customerSatisfaction.toFixed(1)}/5
            </div>
            <p className="text-xs text-orange-700 mt-1">
              {analyticsData.customerReviewsCount} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'performance', name: 'Performance', icon: Activity },
            { id: 'trends', name: 'Trends', icon: TrendingUp },
            { id: 'insights', name: 'Insights', icon: PieChart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Performing Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Top Performing Items</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.popularItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-orange-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.count} orders • {item.avgRating.toFixed(1)}★ rating
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</p>
                      <p className="text-sm text-gray-500">{item.count} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Peak Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {analyticsData.peakHours.map((hour, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-gray-900">{hour.hour}</div>
                    <div className="text-xs text-gray-500">{hour.orders} orders</div>
                    <div className="text-xs text-gray-500">{formatCurrency(hour.revenue)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-green-500" />
                <span>Category Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.categoryPerformance.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}></div>
                      <span className="font-medium text-gray-900">{category.category}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{category.orders} orders</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(category.revenue)}</span>
                      <Badge variant="secondary">{category.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <span>Order Status Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.orderStatusDistribution.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="capitalize font-medium text-gray-900">{status.status}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(status.count / analyticsData.totalOrders) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{status.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Revenue Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.revenueTrends.slice(0, 7).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{trend.period}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{formatCurrency(trend.revenue)}</span>
                      <Badge variant={trend.change >= 0 ? "default" : "destructive"}>
                        {trend.change >= 0 ? '+' : ''}{trend.change.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Top Customers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topCustomers.slice(0, 5).map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">Last order: {new Date(customer.lastOrder).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{customer.orders} orders</p>
                      <p className="text-sm text-gray-500">{formatCurrency(customer.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <span>Today&apos;s Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analyticsData.todayOrders}</div>
                  <div className="text-sm text-green-700">Orders Today</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(analyticsData.todayRevenue)}</div>
                  <div className="text-sm text-blue-700">Revenue Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
