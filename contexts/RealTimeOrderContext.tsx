'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface Order {
  _id: string;
  orderId: string;
  tableNumber: string;
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    isVeg: boolean;
    category: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
  timestamp: Date;
  createdAt: Date;
  lastUpdated: Date;
  estimatedTime?: number;
  notes?: string;
}

interface RealTimeOrderContextType {
  orders: Order[];
  isConnected: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => Promise<void>;
  createTestOrder: () => Promise<void>;
  lastUpdate: Date | null;
}

const RealTimeOrderContext = createContext<RealTimeOrderContextType | undefined>(undefined);

export function RealTimeOrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || data || []);
        setLastUpdate(new Date());
        setError(null);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    }
  }, []);

  // Initialize SSE connection
  const initializeSSE = useCallback(() => {
    try {
      // Close existing connection if any
      if (eventSource) {
        eventSource.close();
      }

      const sse = new EventSource('/api/admin/orders/realtime/stream');
      setEventSource(sse);

      sse.onopen = () => {
        console.log('SSE connection established');
        setIsConnected(true);
        setError(null);
      };

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE message received:', data);

          switch (data.type) {
            case 'connected':
              console.log('SSE connected:', data.message);
              break;
            
            case 'initial-orders':
              setOrders(data.orders || []);
              setLastUpdate(new Date());
              break;
            
            case 'new-order':
              setOrders(prev => [data.order, ...prev]);
              setLastUpdate(new Date());
              // Play notification sound for new orders
              playNotificationSound();
              break;
            
            case 'order-updated':
              setOrders(prev => 
                prev.map(order => 
                  order._id === data.order._id ? data.order : order
                )
              );
              setLastUpdate(new Date());
              break;
            
            case 'order-deleted':
              setOrders(prev => 
                prev.filter(order => order._id !== data.orderId)
              );
              setLastUpdate(new Date());
              break;
            
            case 'heartbeat':
              // Keep connection alive
              break;
            
            default:
              console.log('Unknown SSE message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      sse.onerror = (event) => {
        console.error('SSE connection error:', event);
        setIsConnected(false);
        setError('Connection lost. Trying to reconnect...');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!isConnected) {
            initializeSSE();
          }
        }, 5000);
      };

    } catch (err) {
      console.error('Error initializing SSE:', err);
      setError('Failed to establish real-time connection');
    }
  }, [eventSource, isConnected]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch(`/api/admin/orders/realtime/${orderId}`, {
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
      return result;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  }, []);

  // Update payment status
  const updatePaymentStatus = useCallback(async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    try {
      const response = await fetch(`/api/admin/orders/realtime/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      const result = await response.json();
      console.log('Payment status updated:', result);
      return result;
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  }, []);

  // Create test order
  const createTestOrder = useCallback(async () => {
    try {
      const response = await fetch('/api/test/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create test order');
      }

      const result = await response.json();
      console.log('Test order created:', result);
      return result;
    } catch (err) {
      console.error('Error creating test order:', err);
      throw err;
    }
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      console.log('Could not play notification sound:', err);
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchOrders();
    initializeSSE();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const value: RealTimeOrderContextType = {
    orders,
    isConnected,
    error,
    fetchOrders,
    updateOrderStatus,
    updatePaymentStatus,
    createTestOrder,
    lastUpdate
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