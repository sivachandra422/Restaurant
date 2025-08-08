'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  tableNumber: string;
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cash' | 'card' | 'upi' | 'online';
  estimatedTime?: number;
  notes?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface RealTimeOrderContextType {
  orders: Order[];
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  fetchOrders: () => Promise<void>;
  initializeSSE: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<any>;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => Promise<any>;
  createTestOrder: () => Promise<void>;
}

const RealTimeOrderContext = createContext<RealTimeOrderContextType | undefined>(undefined);

export function RealTimeOrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || data || [];
        setOrders(orders);
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
    // Skip during build time
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Skipping SSE connection during build time');
      return;
    }

    if (eventSourceRef.current) {
      console.log('SSE connection already exists, closing...');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }

    try {
      const sse = new EventSource('/api/admin/orders/realtime/stream');
      eventSourceRef.current = sse;

      sse.onopen = () => {
        console.log('SSE connection established');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0; // reset backoff on success
        // Start heartbeat watchdog
        if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = setTimeout(() => {
          console.warn('SSE heartbeat timeout. Reconnecting...');
          try { sse.close(); } catch {}
          eventSourceRef.current = null;
          initializeSSE();
        }, 35000); // expect heartbeat within 35s
      };

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE message received:', data);

          // Reset heartbeat watchdog on any message
          if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
          heartbeatTimeoutRef.current = setTimeout(() => {
            console.warn('SSE heartbeat timeout. Reconnecting...');
            try { sse.close(); } catch {}
            eventSourceRef.current = null;
            initializeSSE();
          }, 35000);

          switch (data.type) {
            case 'connected':
              console.log('SSE connected:', data.message);
              break;
            
            case 'initial-orders':
              setOrders(data.orders || []);
              setLastUpdate(new Date());
              break;
            
            case 'new-order':
              setOrders(prev => {
                // Check if order already exists to avoid duplicates
                const exists = prev.some(order => order._id === data.order._id || order.orderId === data.order.orderId);
                if (exists) return prev;
                return [data.order, ...prev];
              });
              setLastUpdate(new Date());
              // Play notification sound for new orders
              playNotificationSound();
              // Dispatch custom event for other components
              window.dispatchEvent(new CustomEvent('new-order', { detail: { order: data.order } }));
              break;
            
            case 'order-updated':
              setOrders(prev => 
                prev.map(order => 
                  (order._id === data.order._id || order.orderId === data.order.orderId) ? data.order : order
                )
              );
              setLastUpdate(new Date());
              // Dispatch custom event for other components
              window.dispatchEvent(new CustomEvent('order-updated', { detail: { order: data.order } }));
              break;
            
            case 'feedback-submitted':
              setOrders(prev => 
                prev.map(order => 
                  (order._id === data.order._id || order.orderId === data.order.orderId) ? data.order : order
                )
              );
              setLastUpdate(new Date());
              // Dispatch custom event for feedback updates
              window.dispatchEvent(new CustomEvent('feedback-submitted', { 
                detail: { order: data.order, rating: data.rating, feedback: data.feedback } 
              }));
              break;
            
            case 'order-deleted':
              setOrders(prev => 
                prev.filter(order => order._id !== data.orderId && order.orderId !== data.orderId)
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

      sse.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        setError('SSE connection lost');
        
        // Close the connection
        sse.close();
        eventSourceRef.current = null;
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
          heartbeatTimeoutRef.current = null;
        }
        
        // Exponential backoff with jitter
        const attempt = Math.min(reconnectAttemptsRef.current + 1, 8);
        reconnectAttemptsRef.current = attempt;
        const base = Math.pow(2, attempt) * 500; // 1s, 2s, 4s... up to ~128s
        const jitter = Math.floor(Math.random() * 300);
        const delay = Math.min(30000, base + jitter); // cap at 30s
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (navigator.onLine) {
            console.log(`Reconnecting SSE (attempt ${attempt})...`);
            initializeSSE();
          } else {
            console.log('Offline. Waiting for network to reconnect.');
          }
        }, delay);
      };

    } catch (error) {
      console.error('Error initializing SSE:', error);
      setError('Failed to initialize SSE connection');
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
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
      window.dispatchEvent(new CustomEvent('order-updated'));
      
      return result;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  }, []);

  // Update payment status
  const updatePaymentStatus = useCallback(async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
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
      
      // Trigger analytics update
      window.dispatchEvent(new CustomEvent('order-updated'));
      
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
      });

      if (!response.ok) {
        throw new Error('Failed to create test order');
      }

      const result = await response.json();
      console.log('Test order created:', result);
      
      // Trigger analytics update
      window.dispatchEvent(new CustomEvent('new-order'));
      
      return result;
    } catch (err) {
      console.error('Error creating test order:', err);
      throw err;
    }
  }, []);

  // Play notification sound for new orders
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
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  // Initialize SSE connection on mount
  useEffect(() => {
    let isActive = true;
    
    const setupConnection = () => {
      if (!isActive) return;
      initializeSSE();
    };
    
    setupConnection();
    
    const handleOnline = () => {
      if (!eventSourceRef.current) {
        console.log('Network online. Restoring SSE connection.');
        initializeSSE();
      }
    };
    window.addEventListener('online', handleOnline);
    
    // Cleanup on unmount
    return () => {
      isActive = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      window.removeEventListener('online', handleOnline);
    };
  }, [initializeSSE]);

  // Fetch initial orders
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const value: RealTimeOrderContextType = {
    orders,
    isConnected,
    error,
    lastUpdate,
    fetchOrders,
    initializeSSE,
    updateOrderStatus,
    updatePaymentStatus,
    createTestOrder,
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