'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  StopCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Timer,
  MessageSquare,
  Eye,
  Edit,
  Users,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealTimeOrders } from '@/contexts/RealTimeOrderContext';

interface Order {
  _id: string;
  orderId: string;
  tableNumber: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  timestamp: Date;
  estimatedTime?: number;
  notes?: string;
  lastUpdated?: Date;
}

export default function RealTimeOrderManager() {
  const { 
    orders, 
    activeOrders, 
    pendingOrders, 
    preparingOrders, 
    readyOrders,
    isConnected, 
    lastUpdate, 
    updateOrderStatus, 
    bulkUpdateOrders,
    refreshOrders 
  } = useRealTimeOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      preparing: { color: 'bg-blue-100 text-blue-800', icon: Play },
      ready: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      served: { color: 'bg-gray-100 text-gray-800', icon: StopCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusActions = (order: Order) => {
    const actions = [];

    if (order.status === 'pending') {
      actions.push(
        <Button
          key="start-preparing"
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate(order.orderId, 'preparing')}
          disabled={updatingOrder === order.orderId}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Play className="w-3 h-3 mr-1" />
          Start Preparing
        </Button>
      );
    }

    if (order.status === 'preparing') {
      actions.push(
        <Button
          key="mark-ready"
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate(order.orderId, 'ready')}
          disabled={updatingOrder === order.orderId}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Mark Ready
        </Button>
      );
    }

    if (order.status === 'ready') {
      actions.push(
        <Button
          key="mark-served"
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate(order.orderId, 'served')}
          disabled={updatingOrder === order.orderId}
          className="text-gray-600 border-gray-200 hover:bg-gray-50"
        >
          <StopCircle className="w-3 h-3 mr-1" />
          Mark Served
        </Button>
      );
    }

    return actions;
  };

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.orderId} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Table {order.tableNumber}</span>
            <span className="text-sm text-gray-500">#{order.orderId.slice(-6)}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedOrder(order);
                setShowOrderDetails(true);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{order.items.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium text-green-600">₹{order.totalAmount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{formatTime(order.timestamp)}</span>
          </div>
          {order.estimatedTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Est. Time:</span>
              <span className="font-medium flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatDuration(order.estimatedTime)}
              </span>
            </div>
          )}
        </div>

        {order.notes && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <MessageSquare className="w-3 h-3" />
              Notes:
            </div>
            <p className="text-gray-700">{order.notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          {getStatusActions(order)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Order Management</h2>
          <p className="text-sm text-gray-600">
            Live order tracking and status management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>
          <Button onClick={refreshOrders} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={async () => {
              try {
                const response = await fetch('/api/test/create-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tableNumber: Math.floor(Math.random() * 10) + 1 })
                });
                if (response.ok) {
                  console.log('Test order created');
                }
              } catch (error) {
                console.error('Error creating test order:', error);
              }
            }} 
            variant="outline" 
            size="sm"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          >
            Create Test Order
          </Button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Preparing</p>
                <p className="text-2xl font-bold text-blue-600">{preparingOrders.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready</p>
                <p className="text-2xl font-bold text-green-600">{readyOrders.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Orders ({pendingOrders.length})
          </h3>
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <OrderCard key={order.orderId} order={order} />
            ))}
            {pendingOrders.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No pending orders
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Preparing Orders */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            Preparing ({preparingOrders.length})
          </h3>
          <div className="space-y-4">
            {preparingOrders.map(order => (
              <OrderCard key={order.orderId} order={order} />
            ))}
            {preparingOrders.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No orders being prepared
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Ready Orders */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Ready to Serve ({readyOrders.length})
          </h3>
          <div className="space-y-4">
            {readyOrders.map(order => (
              <OrderCard key={order.orderId} order={order} />
            ))}
            {readyOrders.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No orders ready
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Order Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOrderDetails(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">#{selectedOrder.orderId.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Table</p>
                  <p className="font-medium">{selectedOrder.tableNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-green-600">₹{selectedOrder.totalAmount}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="p-2 bg-gray-50 rounded">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {getStatusActions(selectedOrder)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 