'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Truck, 
  XCircle, 
  Eye, 
  MoreVertical,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealTimeOrders } from '@/contexts/RealTimeOrderContext';

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  tableNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  estimatedTime?: number;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bgColor: 'bg-yellow-50',
    accentColor: 'text-yellow-600'
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50',
    accentColor: 'text-blue-600'
  },
  preparing: {
    label: 'Preparing',
    icon: ChefHat,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    bgColor: 'bg-orange-50',
    accentColor: 'text-orange-600'
  },
  ready: {
    label: 'Ready',
    icon: Truck,
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50',
    accentColor: 'text-green-600'
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bgColor: 'bg-emerald-50',
    accentColor: 'text-emerald-600'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    bgColor: 'bg-red-50',
    accentColor: 'text-red-600'
  }
};

const paymentStatusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' }
};

export default function ModernOrderManager() {
  const { orders, isConnected, error, fetchOrders, updateOrderStatus, lastUpdate } = useRealTimeOrders();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group orders by status
  const ordersByStatus = {
    pending: filteredOrders.filter(o => o.status === 'pending'),
    confirmed: filteredOrders.filter(o => o.status === 'confirmed'),
    preparing: filteredOrders.filter(o => o.status === 'preparing'),
    ready: filteredOrders.filter(o => o.status === 'ready'),
    delivered: filteredOrders.filter(o => o.status === 'delivered'),
    cancelled: filteredOrders.filter(o => o.status === 'cancelled')
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return [
          { label: 'Confirm', status: 'confirmed', color: 'bg-blue-500 hover:bg-blue-600' },
          { label: 'Cancel', status: 'cancelled', color: 'bg-red-500 hover:bg-red-600' }
        ];
      case 'confirmed':
        return [
          { label: 'Start Preparing', status: 'preparing', color: 'bg-orange-500 hover:bg-orange-600' }
        ];
      case 'preparing':
        return [
          { label: 'Mark Ready', status: 'ready', color: 'bg-green-500 hover:bg-green-600' }
        ];
      case 'ready':
        return [
          { label: 'Mark Delivered', status: 'delivered', color: 'bg-emerald-500 hover:bg-emerald-600' }
        ];
      default:
        return [];
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Management</h1>
          <p className="text-slate-600 mt-1">
            Manage and track all restaurant orders in real-time
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="hidden md:flex"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Orders</p>
                <p className="text-2xl font-bold text-orange-900">
                  {orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-900">
                  ₹{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Connection</p>
                <p className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search orders by customer, order ID, or table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedStatus('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            const paymentStatus = paymentStatusConfig[order.paymentStatus];
            const actions = getStatusActions(order);
            
            return (
              <Card key={order._id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        #{order.orderId.slice(-4)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{order.customerName}</h3>
                        <p className="text-sm text-slate-500">Table {order.tableNumber}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status Badge */}
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="font-medium">{status.label}</span>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Items ({order.items.length})</p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-slate-600">{item.quantity}x {item.name}</span>
                          <span className="font-medium">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-slate-400">+{order.items.length - 3} more items</p>
                      )}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">₹{order.totalAmount}</p>
                      <Badge className={`${paymentStatus.color} text-xs`}>
                        {paymentStatus.label}
                      </Badge>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{formatTime(order.createdAt)}</p>
                      {order.estimatedTime && (
                        <p>Est: {order.estimatedTime}min</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {actions.length > 0 && (
                    <div className="flex space-x-2 pt-3 border-t border-slate-100">
                      {actions.map((action) => (
                        <Button
                          key={action.status}
                          size="sm"
                          onClick={() => handleStatusUpdate(order._id, action.status as Order['status'])}
                          disabled={updatingOrder === order._id}
                          className={action.color}
                        >
                          {updatingOrder === order._id ? 'Updating...' : action.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* View Details Button */}
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Orders List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                const paymentStatus = paymentStatusConfig[order.paymentStatus];
                const actions = getStatusActions(order);
                
                return (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        #{order.orderId.slice(-4)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{order.customerName}</h4>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <span>Table {order.tableNumber}</span>
                          <span>•</span>
                          <span>{order.items.length} items</span>
                          <span>•</span>
                          <span>{formatTime(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">₹{order.totalAmount}</div>
                        <Badge className={`${paymentStatus.color} text-xs`}>
                          {paymentStatus.label}
                        </Badge>
                      </div>
                      
                      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="font-medium">{status.label}</span>
                      </div>
                      
                      {actions.length > 0 && (
                        <div className="flex space-x-2">
                          {actions.map((action) => (
                            <Button
                              key={action.status}
                              size="sm"
                              onClick={() => handleStatusUpdate(order._id, action.status as Order['status'])}
                              disabled={updatingOrder === order._id}
                              className={action.color}
                            >
                              {updatingOrder === order._id ? 'Updating...' : action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-500 mb-4">
              {searchQuery || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here when customers place them'
              }
            </p>
            {(searchQuery || selectedStatus !== 'all') && (
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
