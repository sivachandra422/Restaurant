'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { OrderUpdate, NotificationData } from '@/lib/websocket';

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

interface RealTimeOrderContextType {
  orders: Order[];
  activeOrders: Order[];
  pendingOrders: Order[];
  preparingOrders: Order[];
  readyOrders: Order[];
  isConnected: boolean;
  lastUpdate: Date | null;
  updateOrderStatus: (orderId: string, status: Order['status'], estimatedTime?: number, notes?: string) => Promise<void>;
  bulkUpdateOrders: (updates: Array<{ orderId: string; status: Order['status']; estimatedTime?: number }>) => Promise<void>;
  refreshOrders: () => Promise<void>;
  connect: () => void;
  disconnect: () => void;
}

const RealTimeOrderContext = createContext<RealTimeOrderContextType | undefined>(undefined);

export function RealTimeOrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Filter orders by status
  const activeOrders = orders.filter(order => 
    ['pending', 'preparing', 'ready'].includes(order.status)
  );
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (socket?.connected) return;

    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Real-time order connection established');
      setIsConnected(true);
      
      // Authenticate as admin
      const adminToken = localStorage.getItem('admin-token');
      if (adminToken) {
        newSocket.emit('admin_auth', { token: adminToken });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Real-time order connection disconnected');
      setIsConnected(false);
    });

    newSocket.on('order_status_update', (orderUpdate: OrderUpdate) => {
      console.log('Received order status update:', orderUpdate);
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => 
          order.orderId === orderUpdate.orderId 
            ? { 
                ...order, 
                status: orderUpdate.status,
                estimatedTime: orderUpdate.estimatedTime,
                lastUpdated: orderUpdate.timestamp
              }
            : order
        );
        return updatedOrders;
      });
      setLastUpdate(new Date());
    });

    newSocket.on('notification', (notification: NotificationData) => {
      console.log('Received notification:', notification);
      // Handle notifications (could show toast, update UI, etc.)
      if (notification.type === 'new_order') {
        // Refresh orders when new order comes in
        refreshOrders();
      }
    });

    setSocket(newSocket);
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Fetch orders from API
  const refreshOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/orders/realtime');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (
    orderId: string, 
    status: Order['status'], 
    estimatedTime?: number,
    notes?: string
  ) => {
    try {
      const response = await fetch('/api/admin/orders/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, estimatedTime, notes })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Order status updated:', data);
        
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, status, estimatedTime, notes, lastUpdated: new Date() }
              : order
          )
        );
        
        setLastUpdate(new Date());
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }, []);

  // Bulk update orders
  const bulkUpdateOrders = useCallback(async (
    updates: Array<{ orderId: string; status: Order['status']; estimatedTime?: number }>
  ) => {
    try {
      const response = await fetch('/api/admin/orders/realtime', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Bulk orders updated:', data);
        
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => {
            const update = updates.find(u => u.orderId === order.orderId);
            return update 
              ? { ...order, status: update.status, estimatedTime: update.estimatedTime, lastUpdated: new Date() }
              : order;
          })
        );
        
        setLastUpdate(new Date());
      } else {
        throw new Error('Failed to bulk update orders');
      }
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      throw error;
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    refreshOrders();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, refreshOrders]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        refreshOrders();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, refreshOrders]);

  const value: RealTimeOrderContextType = {
    orders,
    activeOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    isConnected,
    lastUpdate,
    updateOrderStatus,
    bulkUpdateOrders,
    refreshOrders,
    connect,
    disconnect
  };

  return (
    <RealTimeOrderContext.Provider value={value}>
      {children}
    </RealTimeOrderContext.Provider>
  );
}

export function useRealTimeOrders() {
  const context = useContext(RealTimeOrderContext);
  if (context === undefined) {
    throw new Error('useRealTimeOrders must be used within a RealTimeOrderProvider');
  }
  return context;
} 