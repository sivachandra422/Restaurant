'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Activity, 
  DollarSign, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  FileText,
  PieChart,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface ReportData {
  summary?: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    uniqueCustomers: number;
  };
  dailyRevenue?: Array<{ date: string; revenue: number }>;
  topSellingItems?: Array<{
    name: string;
    count: number;
    revenue: number;
    averagePrice: number;
  }>;
  hourlyDistribution?: Array<{ hour: number; orders: number; revenue: number }>;
  categoryBreakdown?: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  customerAnalysis?: Array<{
    customerId: string;
    orderCount: number;
    totalSpent: number;
    averageOrderValue: number;
    customerType: string;
  }>;
  statusDistribution?: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  busiestTables?: Array<{ table: string; orders: number }>;
  monthlyRevenue?: Array<{ month: string; revenue: number }>;
}

export default function ReportsSection() {
  const [activeReport, setActiveReport] = useState('sales');
  const [reportData, setReportData] = useState<ReportData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    status: 'all'
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: TrendingUp, description: 'Revenue and order analytics' },
    { id: 'inventory', name: 'Inventory Report', icon: BarChart3, description: 'Item performance and usage' },
    { id: 'customer', name: 'Customer Report', icon: Users, description: 'Customer behavior and preferences' },
    { id: 'performance', name: 'Performance Report', icon: Activity, description: 'Business performance metrics' },
    { id: 'financial', name: 'Financial Report', icon: DollarSign, description: 'Financial analysis and trends' },
    { id: 'operational', name: 'Operational Report', icon: Calendar, description: 'Daily operations and efficiency' }
  ];

  const generateReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: activeReport,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.status !== 'all' && { status: filters.status })
      });

      const response = await fetch(`/api/admin/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data.report);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeReport, filters]);

  const exportReport = useCallback(async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        type: activeReport,
        format,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.status !== 'all' && { status: filters.status })
      });

      const response = await fetch(`/api/admin/reports/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  }, [activeReport, filters]);

  useEffect(() => {
    generateReport();
  }, [activeReport, filters, generateReport]);

  const renderReportContent = () => {
    switch (activeReport) {
      case 'sales':
        return <SalesReportContent data={reportData} />;
      case 'inventory':
        return <InventoryReportContent data={reportData} />;
      case 'customer':
        return <CustomerReportContent data={reportData} />;
      case 'performance':
        return <PerformanceReportContent data={reportData} />;
      case 'financial':
        return <FinancialReportContent data={reportData} />;
      case 'operational':
        return <OperationalReportContent data={reportData} />;
      default:
        return <SalesReportContent data={reportData} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-600">Generate comprehensive reports and export data</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Live
          </Badge>
          <Button onClick={generateReport} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => exportReport('csv')} variant="outline" size="sm">
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
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeReport === report.id 
                  ? 'ring-2 ring-orange-500 border-orange-200' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setActiveReport(report.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className="w-6 h-6 text-gray-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{report.name}</h3>
                    <p className="text-xs text-gray-500">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                <option value="biryani">Biryani</option>
                <option value="curries">Curries</option>
                <option value="fried_rice">Fried Rice</option>
                <option value="noodles">Noodles</option>
                <option value="starters">Starters</option>
                <option value="breads">Breads</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Generating report...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          renderReportContent()
        )}
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-sm text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleString()}
        </div>
      )}
    </div>
  );
}

// Sales Report Content
function SalesReportContent({ data }: { data: ReportData }) {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.summary?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary?.uniqueCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">Total customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.summary?.averageOrderValue?.toFixed(0) || 0}</div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      {data.topSellingItems && data.topSellingItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topSellingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.count} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">₹{item.averagePrice.toFixed(0)} avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {data.categoryBreakdown && data.categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{category.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// Inventory Report Content
function InventoryReportContent({ data }: { data: ReportData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Inventory performance data will be displayed here based on actual order data.</p>
      </CardContent>
    </Card>
  );
}

// Customer Report Content
function CustomerReportContent({ data }: { data: ReportData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Customer behavior and preferences data will be displayed here based on actual order data.</p>
      </CardContent>
    </Card>
  );
}

// Performance Report Content
function PerformanceReportContent({ data }: { data: ReportData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Performance metrics and KPIs will be displayed here based on actual order data.</p>
      </CardContent>
    </Card>
  );
}

// Financial Report Content
function FinancialReportContent({ data }: { data: ReportData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Financial trends and analysis will be displayed here based on actual order data.</p>
      </CardContent>
    </Card>
  );
}

// Operational Report Content
function OperationalReportContent({ data }: { data: ReportData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Efficiency</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Daily operations and efficiency metrics will be displayed here based on actual order data.</p>
      </CardContent>
    </Card>
  );
} 