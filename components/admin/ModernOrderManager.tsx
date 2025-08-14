'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Loader2,
  AlertCircle,
  DollarSign,
  Users,
  ShoppingCart,
  Calendar,
  Phone,
  MessageSquare,
  CreditCard,
  Wallet,
  X,
  Printer,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeOrders } from '@/contexts/RealTimeOrderContext';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  category: string;
  subtotal: number;
  specialInstructions?: string;
}

interface Order {
  _id: string;
  orderId: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'upi' | 'phonepe' | 'gpay' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  feedback?: string;
}

export default function ModernOrderManager() {
  const { toast } = useToast();
  const { orders: realTimeOrders, updateOrderStatus } = useRealTimeOrders();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean;
    order: Order | null;
    newStatus: Order['status'];
  }>({
    isOpen: false,
    order: null,
    newStatus: 'pending'
  });

  const [viewDialog, setViewDialog] = useState<{
    isOpen: boolean;
    order: Order | null;
  }>({
    isOpen: false,
    order: null
  });

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800', icon: Clock },
    ready: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const paymentStatusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  };

  const paymentMethodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800', icon: DollarSign },
    card: { label: 'Card', color: 'bg-blue-100 text-blue-800', icon: CreditCard },
    upi: { label: 'UPI', color: 'bg-purple-100 text-purple-800', icon: Wallet },
    phonepe: { label: 'PhonePe', color: 'bg-purple-100 text-purple-800', icon: Wallet },
    gpay: { label: 'Google Pay', color: 'bg-blue-100 text-blue-800', icon: Wallet },
    online: { label: 'Online', color: 'bg-orange-100 text-orange-800', icon: CreditCard }
  };

  // Load orders from API
  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      const ordersList = result.success && result.orders ? result.orders : result.orders || result;
      
      if (Array.isArray(ordersList)) {
        // Fix payment status for restaurant-specific payment methods
        const processedOrders = ordersList.map((order: any) => ({
          ...order,
          paymentStatus: order.paymentMethod === 'cash' || order.paymentMethod === 'phonepe' || order.paymentMethod === 'gpay' 
            ? 'paid' 
            : order.paymentStatus || 'pending'
        }));
        
        setOrders(processedOrders);
        setFilteredOrders(processedOrders);
      } else {
        throw new Error('Invalid orders data format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load orders: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Filter orders based on search and filters
  const filterOrders = useCallback(() => {
    let filtered = orders;

    // Search filter - improved search functionality
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => {
        // Search in customer name
        if (order.customerName && order.customerName.toLowerCase().includes(query)) return true;
        
        // Search in customer phone
        if (order.customerPhone && order.customerPhone.includes(query)) return true;
        
        // Search in order ID
        if (order.orderId.toLowerCase().includes(query)) return true;
        
        // Search in table number
        if (order.tableNumber.toLowerCase().includes(query)) return true;
        
        // Search in item names
        if (order.items.some(item => item.name.toLowerCase().includes(query))) return true;
        
        // Search in special instructions
        if (order.specialInstructions && order.specialInstructions.toLowerCase().includes(query)) return true;
        
        return false;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      // Update real-time context
      updateOrderStatus(orderId, newStatus);

      toast({
        title: "Status Updated",
        description: `Order ${orderId} status updated to ${newStatus}`,
      });

      setStatusDialog({ isOpen: false, order: null, newStatus: 'pending' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: "Error",
        description: `Failed to update status: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  // Print order
  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order #${order.orderId}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
              .order-info { margin-bottom: 20px; }
              .items { margin-bottom: 20px; }
              .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .total { border-top: 1px solid #000; padding-top: 10px; font-weight: bold; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Sri Kanya Family Restaurant</h1>
              <p>Order #${order.orderId}</p>
              <p>Table ${order.tableNumber}</p>
              <p>${new Date(order.timestamp).toLocaleString()}</p>
            </div>
            
            <div class="order-info">
              <p><strong>Customer:</strong> ${order.customerName || 'Walk-in Customer'}</p>
              ${order.customerPhone ? `<p><strong>Phone:</strong> ${order.customerPhone}</p>` : ''}
              ${order.specialInstructions ? `<p><strong>Special Instructions:</strong> ${order.specialInstructions}</p>` : ''}
            </div>
            
            <div class="items">
              <h3>Order Items:</h3>
              ${order.items.map(item => `
                <div class="item">
                  <span>${item.name} × ${item.quantity}</span>
                  <span>₹${item.subtotal}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
              <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing Sri Kanya Family Restaurant!</p>
              <p>Dharmavaram, Andhra Pradesh</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Share order
  const handleShareOrder = async (order: Order) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Order #${order.orderId}`,
          text: `Order #${order.orderId} from Sri Kanya Family Restaurant - Table ${order.tableNumber}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        const orderText = `Order #${order.orderId}\nTable: ${order.tableNumber}\nTotal: ₹${order.totalAmount}\nStatus: ${order.status}`;
        await navigator.clipboard.writeText(orderText);
        toast({
          title: "Order Details Copied",
          description: "Order details have been copied to clipboard",
        });
      }
    } catch (err) {
      toast({
        title: "Share Failed",
        description: "Failed to share order details",
        variant: "destructive",
      });
    }
  };

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filter orders when filters change
  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Orders</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={loadOrders} className="bg-orange-500 hover:bg-orange-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-900">₹{orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-200 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-900">{orders.filter(order => order.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Today&apos;s Orders</p>
                <p className="text-2xl font-bold text-purple-900">{orders.filter(order => {
                  const orderDate = new Date(order.createdAt || order.timestamp);
                  const today = new Date();
                  return orderDate.toDateString() === today.toDateString();
                }).length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search orders by customer, phone, order ID, table, items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => loadOrders()}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Display */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Orders Found</h3>
            <p className="text-slate-600 mb-4">
              {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No orders have been placed yet.'}
            </p>
            {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all') && (
              <Button onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPaymentFilter('all');
              }} variant="outline">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status]?.icon || Clock;
            const PaymentIcon = paymentMethodConfig[order.paymentMethod]?.icon || CreditCard;
            
            return (
              <Card key={order._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="font-mono">
                        #{order.orderId}
                      </Badge>
                      <Badge className={statusConfig[order.status]?.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[order.status]?.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Table {order.tableNumber}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.createdAt || order.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {order.customerName || 'Walk-in Customer'}
                      </span>
                    </div>
                    {order.customerPhone && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{order.customerPhone}</span>
                      </div>
                    )}
                    {order.specialInstructions && (
                      <div className="flex items-start space-x-2 text-sm text-slate-600">
                        <MessageSquare className="w-4 h-4 mt-0.5" />
                        <span className="italic">&ldquo;{order.specialInstructions}&rdquo;</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Order Items:</p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-slate-700 truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600 flex-shrink-0">
                            <span className="text-right min-w-[2rem]">×{item.quantity}</span>
                            <span className="text-right min-w-[3rem]">₹{item.subtotal}</span>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-slate-500 text-center">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <PaymentIcon className="w-4 h-4 text-slate-400" />
                      <Badge className={paymentStatusConfig[order.paymentStatus]?.color}>
                        {paymentStatusConfig[order.paymentStatus]?.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">₹{order.totalAmount}</p>
                      <p className="text-xs text-slate-500 capitalize">{order.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStatusDialog({
                        isOpen: true,
                        order,
                        newStatus: order.status
                      })}
                    >
                      Update Status
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setViewDialog({
                        isOpen: true,
                        order
                      })}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Status Update Dialog */}
      {statusDialog.isOpen && statusDialog.order && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
            <p className="text-slate-600 mb-4">
              Order #{statusDialog.order.orderId} - Table {statusDialog.order.tableNumber}
            </p>
            
            <Select 
              value={statusDialog.newStatus} 
              onValueChange={(value: Order['status']) => setStatusDialog(prev => ({ ...prev, newStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2 mt-6">
              <Button
                onClick={() => handleStatusUpdate(statusDialog.order!._id, statusDialog.newStatus)}
                disabled={statusDialog.newStatus === statusDialog.order.status}
                className="flex-1"
              >
                Update Status
              </Button>
              <Button
                variant="outline"
                onClick={() => setStatusDialog({ isOpen: false, order: null, newStatus: 'pending' })}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Dialog */}
      {viewDialog.isOpen && viewDialog.order && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewDialog({ isOpen: false, order: null })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">#{viewDialog.order.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Table</p>
                  <p className="font-semibold">{viewDialog.order.tableNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold">
                    {new Date(viewDialog.order.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={statusConfig[viewDialog.order.status]?.color}>
                    {statusConfig[viewDialog.order.status]?.label}
                  </Badge>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{viewDialog.order.customerName || 'Walk-in Customer'}</p>
                  </div>
                  {viewDialog.order.customerPhone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{viewDialog.order.customerPhone}</p>
                    </div>
                  )}
                  {viewDialog.order.specialInstructions && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Special Instructions</p>
                      <p className="font-medium italic">&ldquo;{viewDialog.order.specialInstructions}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-3">
                  {viewDialog.order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                          {item.specialInstructions && (
                            <p className="text-xs text-gray-500 italic">{item.specialInstructions}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">×{item.quantity}</p>
                        <p className="text-sm text-gray-600">₹{item.price} each</p>
                        <p className="font-semibold text-lg">₹{item.subtotal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Total */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <Badge className={paymentMethodConfig[viewDialog.order.paymentMethod]?.color}>
                      {paymentMethodConfig[viewDialog.order.paymentMethod]?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <Badge className={paymentStatusConfig[viewDialog.order.paymentStatus]?.color}>
                      {paymentStatusConfig[viewDialog.order.paymentStatus]?.label}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">₹{viewDialog.order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => viewDialog.order && handlePrintOrder(viewDialog.order)}
                  className="flex-1"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Order
                </Button>
                <Button
                  variant="outline"
                  onClick={() => viewDialog.order && handleShareOrder(viewDialog.order)}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={() => viewDialog.order && setStatusDialog({
                    isOpen: true,
                    order: viewDialog.order,
                    newStatus: viewDialog.order.status
                  })}
                  className="flex-1"
                >
                  Update Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
