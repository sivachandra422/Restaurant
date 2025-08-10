'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeOrders } from '@/contexts/RealTimeOrderContext';
import { 
  RefreshCw, 
  Eye, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RealTimeOrderManager() {
  const { 
    orders, 
    isConnected, 
    error, 
    fetchOrders, 
    updateOrderStatus, 
    updatePaymentStatus, 
    lastUpdate 
  } = useRealTimeOrders();

  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  // removed test order creation UI
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const { toast } = useToast();
  const [mobileTab, setMobileTab] = useState<'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered'>(
    'pending'
  );

  // Filter orders by status (include 'confirmed' as a column in kitchen board)
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const confirmedOrders = orders.filter(order => order.status === 'confirmed');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');
  const deliveredOrders = orders.filter(order => order.status === 'delivered');

  // Calculate analytics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const activeOrders = orders.filter(order => ['pending', 'preparing', 'ready'].includes(order.status)).length;

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const result = await response.json();
      console.log('Order status updated:', result);
      
      // Trigger analytics update
      window.dispatchEvent(new CustomEvent('order-updated', { 
        detail: { order: result.order || result } 
      }));
      toast({ title: 'Order updated', description: `Status changed to ${status}` });
      
      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({ title: 'Failed to update order', variant: 'destructive' });
      throw error;
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handlePaymentUpdate = async (orderId: string, paymentStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const result = await updatePaymentStatus(orderId, paymentStatus as any);
      
      // Trigger analytics update
      window.dispatchEvent(new CustomEvent('order-updated', { 
        detail: { order: result.order || result } 
      }));
      
      return result;
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  // removed test order creation handler

  // Drag-and-drop helpers
  const getDropHandlers = (targetStatus: string) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverColumn(targetStatus);
    },
    onDragLeave: () => setDragOverColumn(prev => (prev === targetStatus ? null : prev)),
    onDrop: async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverColumn(null);
      const orderId = e.dataTransfer.getData('orderId');
      if (!orderId) return;
      await handleStatusUpdate(orderId, targetStatus);
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed', icon: CheckCircle },
      preparing: { color: 'bg-orange-100 text-orange-800', label: 'Preparing', icon: Clock },
      ready: { color: 'bg-green-100 text-green-800', label: 'Ready', icon: CheckCircle },
      delivered: { color: 'bg-gray-100 text-gray-800', label: 'Delivered', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Real-Time Order Management</h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Live order tracking and management
            {lastUpdate && (
              <span className="ml-2">
                • Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Refresh Button */}
          <Button 
            onClick={fetchOrders}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compact mobile summary */}
      <div className="sm:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <Badge className="bg-stone-100 text-stone-800">Total: {totalOrders}</Badge>
        <Badge className="bg-stone-100 text-stone-800">Active: {activeOrders}</Badge>
        <Badge className="bg-stone-100 text-stone-800">Revenue: ₹{totalRevenue.toFixed(0)}</Badge>
        <Badge className="bg-stone-100 text-stone-800">AOV: ₹{averageOrderValue.toFixed(0)}</Badge>
      </div>

      {/* Analytics Cards (hide on mobile) */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: segmented tabs for statuses */}
      <div className="lg:hidden">
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as any)}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Conf</TabsTrigger>
            <TabsTrigger value="preparing">Prep</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="delivered">Done</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span>Pending ({pendingOrders.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${dragOverColumn === 'pending' ? 'ring-2 ring-yellow-400 rounded-md' : ''}`} {...getDropHandlers('pending')}>
                {pendingOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending orders</p>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} onPaymentUpdate={handlePaymentUpdate} updatingOrder={updatingOrder} getStatusBadge={getStatusBadge} getPaymentStatusBadge={getPaymentStatusBadge} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="confirmed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span>Confirmed ({confirmedOrders.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${dragOverColumn === 'confirmed' ? 'ring-2 ring-blue-400 rounded-md' : ''}`} {...getDropHandlers('confirmed')}>
                {confirmedOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No confirmed orders</p>
                ) : (
                  <div className="space-y-3">
                    {confirmedOrders.map((order) => (
                      <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} onPaymentUpdate={handlePaymentUpdate} updatingOrder={updatingOrder} getStatusBadge={getStatusBadge} getPaymentStatusBadge={getPaymentStatusBadge} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preparing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span>Preparing ({preparingOrders.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${dragOverColumn === 'preparing' ? 'ring-2 ring-orange-400 rounded-md' : ''}`} {...getDropHandlers('preparing')}>
                {preparingOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No orders being prepared</p>
                ) : (
                  <div className="space-y-3">
                    {preparingOrders.map((order) => (
                      <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} onPaymentUpdate={handlePaymentUpdate} updatingOrder={updatingOrder} getStatusBadge={getStatusBadge} getPaymentStatusBadge={getPaymentStatusBadge} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ready">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Ready ({readyOrders.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${dragOverColumn === 'ready' ? 'ring-2 ring-green-400 rounded-md' : ''}`} {...getDropHandlers('ready')}>
                {readyOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No orders ready</p>
                ) : (
                  <div className="space-y-3">
                    {readyOrders.map((order) => (
                      <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} onPaymentUpdate={handlePaymentUpdate} updatingOrder={updatingOrder} getStatusBadge={getStatusBadge} getPaymentStatusBadge={getPaymentStatusBadge} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="delivered">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-gray-500" />
                  <span>Delivered ({deliveredOrders.slice(0, 5).length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${dragOverColumn === 'delivered' ? 'ring-2 ring-gray-400 rounded-md' : ''}`} {...getDropHandlers('delivered')}>
                {deliveredOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No delivered orders</p>
                ) : (
                  <div className="space-y-3">
                    {deliveredOrders.slice(0, 5).map((order) => (
                      <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} onPaymentUpdate={handlePaymentUpdate} updatingOrder={updatingOrder} getStatusBadge={getStatusBadge} getPaymentStatusBadge={getPaymentStatusBadge} showActions={false} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop/Tablet Kitchen Board */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span>Pending Orders ({pendingOrders.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent
            className={`${dragOverColumn === 'pending' ? 'ring-2 ring-yellow-400 rounded-md' : ''}`}
            {...getDropHandlers('pending')}
          >
            {pendingOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending orders</p>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onPaymentUpdate={handlePaymentUpdate}
                    updatingOrder={updatingOrder}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmed Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span>Confirmed Orders ({confirmedOrders.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent
            className={`${dragOverColumn === 'confirmed' ? 'ring-2 ring-blue-400 rounded-md' : ''}`}
            {...getDropHandlers('confirmed')}
          >
            {confirmedOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No confirmed orders</p>
            ) : (
              <div className="space-y-3">
                {confirmedOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onPaymentUpdate={handlePaymentUpdate}
                    updatingOrder={updatingOrder}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preparing Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>Preparing Orders ({preparingOrders.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent
            className={`${dragOverColumn === 'preparing' ? 'ring-2 ring-orange-400 rounded-md' : ''}`}
            {...getDropHandlers('preparing')}
          >
            {preparingOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders being prepared</p>
            ) : (
              <div className="space-y-3">
                {preparingOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onPaymentUpdate={handlePaymentUpdate}
                    updatingOrder={updatingOrder}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ready Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Ready Orders ({readyOrders.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent
            className={`${dragOverColumn === 'ready' ? 'ring-2 ring-green-400 rounded-md' : ''}`}
            {...getDropHandlers('ready')}
          >
            {readyOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders ready</p>
            ) : (
              <div className="space-y-3">
                {readyOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onPaymentUpdate={handlePaymentUpdate}
                    updatingOrder={updatingOrder}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Delivered Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-gray-500" />
              <span>Recent Delivered ({deliveredOrders.slice(0, 5).length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent
            className={`${dragOverColumn === 'delivered' ? 'ring-2 ring-gray-400 rounded-md' : ''}`}
            {...getDropHandlers('delivered')}
          >
            {deliveredOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No delivered orders</p>
            ) : (
              <div className="space-y-3">
                {deliveredOrders.slice(0, 5).map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onPaymentUpdate={handlePaymentUpdate}
                    updatingOrder={updatingOrder}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Order Card Component
function OrderCard({ 
  order, 
  onStatusUpdate, 
  onPaymentUpdate, 
  updatingOrder, 
  getStatusBadge, 
  getPaymentStatusBadge,
  showActions = true 
}: {
  order: any;
  onStatusUpdate: (orderId: string, status: string) => void;
  onPaymentUpdate: (orderId: string, paymentStatus: string) => void;
  updatingOrder: string | null;
  getStatusBadge: (status: string) => React.ReactNode;
  getPaymentStatusBadge: (status: string) => React.ReactNode;
  showActions?: boolean;
}) {
  const isUpdating = updatingOrder === order._id;

  return (
    <div
      className="border rounded-lg p-3 sm:p-4 bg-white hover:bg-gray-50 transition-colors"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('orderId', order._id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium">Order #{order.orderId?.slice(-6) || 'N/A'}</h4>
          <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">₹{order.totalAmount}</p>
          <div className="flex items-center space-x-2 mt-1">
            {getStatusBadge(order.status)}
            {getPaymentStatusBadge(order.paymentStatus)}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-3">
        <p className="text-sm font-medium mb-1">Items:</p>
        <div className="space-y-1">
          {order.items?.slice(0, 3).map((item: any, index: number) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          {order.items?.length > 3 && (
            <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {/* Simplified single primary action for small restaurants */}
            {order.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(order._id, 'preparing')}
                  disabled={isUpdating}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isUpdating ? 'Updating...' : 'Start'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onStatusUpdate(order._id, 'cancelled')}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </>
            )}
            {order.status === 'confirmed' && (
              <Button
                size="sm"
                onClick={() => onStatusUpdate(order._id, 'preparing')}
                disabled={isUpdating}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isUpdating ? 'Updating...' : 'Start Preparing'}
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button
                size="sm"
                onClick={() => onStatusUpdate(order._id, 'ready')}
                disabled={isUpdating}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {isUpdating ? 'Updating...' : 'Mark Ready'}
              </Button>
            )}
            {order.status === 'ready' && (
              <Button
                size="sm"
                onClick={() => onStatusUpdate(order._id, 'delivered')}
                disabled={isUpdating}
                className="bg-gray-500 hover:bg-gray-600"
              >
                {isUpdating ? 'Updating...' : 'Mark Delivered'}
              </Button>
            )}
          </div>
          
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 