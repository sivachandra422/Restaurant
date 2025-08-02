'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Filter, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Users, 
  DollarSign,
  FileText,
  PieChart,
  Activity,
  Clock,
  Star,
  ShoppingCart,
  ChefHat,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ReportsSectionProps {
  onGenerateReport: (type: string, filters: any) => Promise<any>;
  onExportReport: (type: string, format: string, filters: any) => void;
}

export default function ReportsSection({ onGenerateReport, onExportReport }: ReportsSectionProps) {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    status: 'all'
  });
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: TrendingUp, description: 'Revenue and order analytics' },
    { id: 'inventory', name: 'Inventory Report', icon: BarChart3, description: 'Item performance and usage' },
    { id: 'customer', name: 'Customer Report', icon: Users, description: 'Customer behavior and preferences' },
    { id: 'performance', name: 'Performance Report', icon: Activity, description: 'Business performance metrics' },
    { id: 'financial', name: 'Financial Report', icon: DollarSign, description: 'Financial analysis and trends' }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const data = await onGenerateReport(selectedReport, filters);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = (format: string) => {
    onExportReport(selectedReport, format, filters);
  };

  useEffect(() => {
    if (selectedReport) {
      handleGenerateReport();
    }
  }, [selectedReport, filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-600">Generate comprehensive reports and export data</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleGenerateReport} disabled={isGenerating} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {reportData && (
            <Button onClick={() => handleExportReport('csv')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card 
              key={report.id}
              className={`cursor-pointer transition-all ${
                selectedReport === report.id 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${
                    selectedReport === report.id ? 'text-orange-500' : 'text-gray-500'
                  }`} />
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
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
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Report Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                <option value="starters">Starters</option>
                <option value="mainCourse">Main Course</option>
                <option value="biryani">Biryani</option>
                <option value="breads">Breads</option>
                <option value="desserts">Desserts</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading report data...</p>
            </div>
          </CardContent>
        </Card>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Report Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{reportData.reportType?.charAt(0).toUpperCase() + reportData.reportType?.slice(1)} Report Summary</span>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => handleExportReport('csv')} size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button onClick={() => handleExportReport('pdf')} size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderReportSummary(reportData)}
            </CardContent>
          </Card>

          {/* Detailed Report */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDetailedReport(reportData)}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a report type and generate your report</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function renderReportSummary(reportData: any) {
  switch (reportData.reportType) {
    case 'sales':
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">₹{reportData.summary?.totalRevenue?.toLocaleString()}</p>
            <p className="text-sm text-blue-700">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <ShoppingCart className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{reportData.summary?.totalOrders}</p>
            <p className="text-sm text-green-700">Total Orders</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{reportData.summary?.uniqueCustomers}</p>
            <p className="text-sm text-orange-700">Unique Customers</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">₹{reportData.summary?.averageOrderValue?.toFixed(0)}</p>
            <p className="text-sm text-purple-700">Avg Order Value</p>
          </div>
        </div>
      );

    case 'inventory':
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <ChefHat className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{reportData.summary?.totalItems}</p>
            <p className="text-sm text-blue-700">Total Items</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{reportData.summary?.activeItems}</p>
            <p className="text-sm text-green-700">Active Items</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <EyeOff className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-900">{reportData.summary?.inactiveItems}</p>
            <p className="text-sm text-red-700">Inactive Items</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">₹{reportData.summary?.totalRevenue?.toLocaleString()}</p>
            <p className="text-sm text-purple-700">Total Revenue</p>
          </div>
        </div>
      );

    case 'customer':
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{reportData.summary?.totalCustomers}</p>
            <p className="text-sm text-blue-700">Total Customers</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Star className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{reportData.summary?.repeatCustomers}</p>
            <p className="text-sm text-green-700">Repeat Customers</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <ShoppingCart className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{reportData.summary?.averageOrdersPerCustomer?.toFixed(1)}</p>
            <p className="text-sm text-orange-700">Avg Orders/Customer</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">₹{reportData.summary?.averageRevenuePerCustomer?.toFixed(0)}</p>
            <p className="text-sm text-purple-700">Avg Revenue/Customer</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center p-8">
          <p className="text-gray-600">Report summary not available</p>
        </div>
      );
  }
}

function renderDetailedReport(reportData: any) {
  switch (reportData.reportType) {
    case 'sales':
      return (
        <div className="space-y-6">
          {/* Top Items */}
          <div>
            <h4 className="font-medium mb-3">Top Selling Items</h4>
            <div className="space-y-2">
              {reportData.topItems?.slice(0, 10).map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="font-medium mb-3">Sales by Category</h4>
            <div className="space-y-2">
              {reportData.categoryBreakdown?.map((category: any) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{category.category}</p>
                    <p className="text-sm text-gray-500">{category.quantity} items sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{category.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'inventory':
      return (
        <div className="space-y-6">
          {/* Top Performers */}
          <div>
            <h4 className="font-medium mb-3">Top Performing Items</h4>
            <div className="space-y-2">
              {reportData.performanceAnalysis?.topPerformers?.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs bg-green-100">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.usage} times ordered</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Performers */}
          <div>
            <h4 className="font-medium mb-3">Low Performing Items</h4>
            <div className="space-y-2">
              {reportData.performanceAnalysis?.lowPerformers?.slice(0, 5).map((item: any) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.usage} times ordered</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'customer':
      return (
        <div className="space-y-6">
          {/* Customer Segments */}
          <div>
            <h4 className="font-medium mb-3">Customer Segments</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-900">High Value Customers</h5>
                <p className="text-2xl font-bold text-green-900">{reportData.customerSegments?.highValue?.length || 0}</p>
                <p className="text-sm text-green-700">Revenue > ₹1000</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h5 className="font-medium text-orange-900">Medium Value Customers</h5>
                <p className="text-2xl font-bold text-orange-900">{reportData.customerSegments?.mediumValue?.length || 0}</p>
                <p className="text-sm text-orange-700">Revenue ₹500-1000</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900">Low Value Customers</h5>
                <p className="text-2xl font-bold text-blue-900">{reportData.customerSegments?.lowValue?.length || 0}</p>
                <p className="text-sm text-blue-700">Revenue < ₹500</p>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div>
            <h4 className="font-medium mb-3">Top Customers by Revenue</h4>
            <div className="space-y-2">
              {reportData.customers?.slice(0, 10).map((customer: any, index: number) => (
                <div key={customer.table} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">Table {customer.table}</p>
                      <p className="text-sm text-gray-500">{customer.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{customer.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center p-8">
          <p className="text-gray-600">Detailed report not available</p>
        </div>
      );
  }
} 