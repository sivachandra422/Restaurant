'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  Activity,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/contexts/AnalyticsContext';

interface ReportsSectionProps {
  onGenerateReport: (type: string, filters: any) => void;
  onExportReport: (type: string, format: string, filters: any) => void;
}

export default function ReportsSection({ onGenerateReport, onExportReport }: ReportsSectionProps) {
  const { analytics, isRealTimeConnected, lastRealTimeUpdate } = useAnalytics();
  const [selectedReport, setSelectedReport] = useState<string>('sales');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    status: 'all'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: TrendingUp, description: 'Revenue and order analytics' },
    { id: 'inventory', name: 'Inventory Report', icon: BarChart3, description: 'Item performance and usage' },
    { id: 'customer', name: 'Customer Report', icon: Users, description: 'Customer behavior and preferences' },
    { id: 'performance', name: 'Performance Report', icon: Activity, description: 'Business performance metrics' },
    { id: 'financial', name: 'Financial Report', icon: DollarSign, description: 'Financial analysis and trends' },
    { id: 'operational', name: 'Operational Report', icon: Calendar, description: 'Daily operations and efficiency' }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await onGenerateReport(selectedReport, filters);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = (format: string) => {
    onExportReport(selectedReport, format, filters);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports and export data</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2">
            {isRealTimeConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
            {lastRealTimeUpdate && (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{formatTime(lastRealTimeUpdate)}</span>
              </div>
            )}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleGenerateReport} disabled={isGenerating}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => handleExportReport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card 
              key={report.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedReport === report.id 
                  ? 'ring-2 ring-orange-500 bg-orange-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{report.name}</h3>
                <p className="text-xs text-gray-500">{report.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                <option value="biryani">Biryani</option>
                <option value="curry">Curry</option>
                <option value="rice">Rice</option>
                <option value="bread">Bread</option>
                <option value="drinks">Drinks</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Report Summary */}
      {selectedReport === 'sales' && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.totalRevenue || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.totalOrders || 0}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.orderStatusDistribution?.filter(s => s.status === 'completed').length || 0}
                </div>
                <div className="text-sm text-gray-600">Unique Customers</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.averageOrderValue || 0)}
                </div>
                <div className="text-sm text-gray-600">Avg Order Value</div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => handleExportReport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis - Top Selling Items */}
      {selectedReport === 'sales' && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
            <p className="text-sm text-gray-600">Top Selling Items</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularItems?.slice(0, 10).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm text-gray-500">({item.count} orders)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(item.revenue || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Updates Notification */}
      {analytics.newOrdersCount && analytics.newOrdersCount > 0 && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">
              {analytics.newOrdersCount} new order{analytics.newOrdersCount > 1 ? 's' : ''} received!
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 