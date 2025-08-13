'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Mock data for analytics (replace with real API calls)
const mockAnalytics = {
  revenue: {
    current: 125000,
    previous: 98000,
    change: 27.6,
    trend: 'up'
  },
  orders: {
    current: 342,
    previous: 298,
    change: 14.8,
    trend: 'up'
  },
  customers: {
    current: 156,
    previous: 142,
    change: 9.9,
    trend: 'up'
  },
  avgOrderValue: {
    current: 365.5,
    previous: 328.9,
    change: 11.1,
    trend: 'up'
  }
};

const mockTopItems = [
  { name: 'Chicken Dum Biryani', orders: 89, revenue: 19580, growth: 12.5 },
  { name: 'Chicken 555', orders: 76, revenue: 16720, growth: 8.3 },
  { name: 'Mughlai Biryani', orders: 65, revenue: 19500, growth: 15.2 },
  { name: 'Paneer Butter Masala', orders: 58, revenue: 12760, growth: 6.7 },
  { name: 'Chicken Fried Rice', orders: 52, revenue: 9360, growth: 4.2 }
];

const mockHourlyData = [
  { hour: '10:00', orders: 12, revenue: 4200 },
  { hour: '11:00', orders: 18, revenue: 6300 },
  { hour: '12:00', orders: 45, revenue: 15750 },
  { hour: '13:00', orders: 38, revenue: 13300 },
  { hour: '14:00', orders: 25, revenue: 8750 },
  { hour: '15:00', orders: 15, revenue: 5250 },
  { hour: '16:00', orders: 22, revenue: 7700 },
  { hour: '17:00', orders: 35, revenue: 12250 },
  { hour: '18:00', orders: 52, revenue: 18200 },
  { hour: '19:00', orders: 48, revenue: 16800 },
  { hour: '20:00', orders: 41, revenue: 14350 },
  { hour: '21:00', orders: 28, revenue: 9800 }
];

const mockCategoryPerformance = [
  { category: 'Biryani', orders: 234, revenue: 46800, percentage: 35 },
  { category: 'Starters', orders: 189, revenue: 28350, percentage: 28 },
  { category: 'Main Course', orders: 156, revenue: 23400, percentage: 23 },
  { category: 'Rice & Noodles', orders: 98, revenue: 14700, percentage: 14 }
];

export default function ModernAnalytics() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Analytics Updated",
      description: "Latest data has been refreshed successfully!",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your analytics report is being prepared for download.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Comprehensive insights into your restaurant&apos;s performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={handleExport} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(mockAnalytics.revenue.current)}
                </p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(mockAnalytics.revenue.trend)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(mockAnalytics.revenue.trend)}`}>
                    +{mockAnalytics.revenue.change}%
                  </span>
                  <span className="text-xs text-blue-600 ml-2">vs last period</span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Orders</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatNumber(mockAnalytics.orders.current)}
                </p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(mockAnalytics.orders.trend)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(mockAnalytics.orders.trend)}`}>
                    +{mockAnalytics.orders.change}%
                  </span>
                  <span className="text-xs text-emerald-600 ml-2">vs last period</span>
                </div>
              </div>
              <ShoppingCart className="w-12 h-12 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">New Customers</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatNumber(mockAnalytics.customers.current)}
                </p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(mockAnalytics.customers.trend)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(mockAnalytics.customers.trend)}`}>
                    +{mockAnalytics.customers.change}%
                  </span>
                  <span className="text-xs text-orange-600 ml-2">vs last period</span>
                </div>
              </div>
              <Users className="w-12 h-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(mockAnalytics.avgOrderValue.current)}
                </p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(mockAnalytics.avgOrderValue.trend)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(mockAnalytics.avgOrderValue.trend)}`}>
                    +{mockAnalytics.avgOrderValue.change}%
                  </span>
                  <span className="text-xs text-purple-600 ml-2">vs last period</span>
                </div>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
        {['overview', 'performance', 'trends', 'insights'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Top Performing Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-600">{item.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(item.revenue)}</p>
                      <p className="text-sm text-green-600">+{item.growth}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-500" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCategoryPerformance.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{category.category}</span>
                      <span className="text-sm text-slate-600">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{category.orders} orders</span>
                      <span>{formatCurrency(category.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Hourly Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Hourly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end justify-between space-x-2">
                {mockHourlyData.map((data, index) => (
                  <div key={data.hour} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                         style={{ height: `${(data.orders / 60) * 200}px` }}>
                    </div>
                    <div className="text-xs text-slate-600 mt-2 text-center">
                      <div className="font-medium">{data.hour}</div>
                      <div>{data.orders} orders</div>
                      <div className="text-blue-600">{formatCurrency(data.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-900">Peak Hours</h3>
                <p className="text-2xl font-bold text-green-900">12:00 - 14:00</p>
                <p className="text-sm text-green-700 mt-2">Lunch rush period</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-orange-900">Best Day</h3>
                <p className="text-2xl font-bold text-orange-900">Saturday</p>
                <p className="text-sm text-orange-700 mt-2">Highest revenue day</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-purple-900">Customer Rating</h3>
                <p className="text-2xl font-bold text-purple-900">4.8/5.0</p>
                <p className="text-sm text-purple-700 mt-2">Excellent satisfaction</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>Advanced trend charts coming soon...</p>
                  <p className="text-sm">Real-time data visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Key Insights</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Biryani category drives 35% of total revenue
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Peak ordering time is 12:00-14:00 (lunch rush)
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Saturday is your highest performing day
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Customer satisfaction rating is excellent at 4.8/5.0
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">🚀 Recommendations</h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Increase biryani inventory during lunch hours
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Promote weekend specials for Saturday boost
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Consider expanding starter menu options
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Launch loyalty program to retain customers
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
