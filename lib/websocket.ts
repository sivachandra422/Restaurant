import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';

export interface OrderUpdate {
  orderId: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  tableNumber: number;
  timestamp: Date;
  estimatedTime?: number;
}

export interface MenuUpdate {
  type: 'item_update' | 'availability_change' | 'price_change' | 'category_update';
  itemId?: string;
  data: any;
  timestamp: Date;
}

export interface NotificationData {
  type: 'new_order' | 'status_change' | 'system_alert' | 'customer_feedback';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  timestamp: Date;
}

class WebSocketManager {
  private io: SocketIOServer | null = null;
  private connectedClients = new Map<string, { type: 'admin' | 'customer'; tableNumber?: number }>();

  initialize(server: NetServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://your-domain.com'] 
          : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('WebSocket server initialized');
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle admin authentication
      socket.on('admin_auth', (data: { token: string }) => {
        // Verify admin token here
        this.connectedClients.set(socket.id, { type: 'admin' });
        socket.join('admin_room');
        console.log('Admin authenticated and joined admin room');
      });

      // Handle customer connection
      socket.on('customer_connect', (data: { tableNumber: number }) => {
        this.connectedClients.set(socket.id, { 
          type: 'customer', 
          tableNumber: data.tableNumber 
        });
        socket.join(`table_${data.tableNumber}`);
        socket.join('customer_room');
        console.log(`Customer from table ${data.tableNumber} connected`);
      });

      // Handle order status updates from admin
      socket.on('update_order_status', (data: OrderUpdate) => {
        this.broadcastOrderUpdate(data);
      });

      // Handle menu updates from admin
      socket.on('menu_update', (data: MenuUpdate) => {
        this.broadcastMenuUpdate(data);
      });

      // Handle notifications
      socket.on('send_notification', (data: NotificationData) => {
        this.broadcastNotification(data);
      });

      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Broadcast order updates to relevant clients
  broadcastOrderUpdate(orderUpdate: OrderUpdate) {
    if (!this.io) return;

    // Send to admin room
    this.io.to('admin_room').emit('order_status_update', orderUpdate);
    
    // Send to specific table
    this.io.to(`table_${orderUpdate.tableNumber}`).emit('order_status_update', orderUpdate);
    
    console.log(`Order update broadcasted: ${orderUpdate.orderId} - ${orderUpdate.status}`);
  }

  // Broadcast menu updates to all customers
  broadcastMenuUpdate(menuUpdate: MenuUpdate) {
    if (!this.io) return;

    this.io.to('customer_room').emit('menu_update', menuUpdate);
    console.log(`Menu update broadcasted: ${menuUpdate.type}`);
  }

  // Broadcast notifications
  broadcastNotification(notification: NotificationData) {
    if (!this.io) return;

    if (notification.type === 'new_order' || notification.type === 'status_change') {
      this.io.to('admin_room').emit('notification', notification);
    } else {
      this.io.to('customer_room').emit('notification', notification);
    }
    
    console.log(`Notification broadcasted: ${notification.title}`);
  }

  // Send notification to specific table
  sendToTable(tableNumber: number, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`table_${tableNumber}`).emit(event, data);
  }

  // Send notification to admin only
  sendToAdmin(event: string, data: any) {
    if (!this.io) return;
    this.io.to('admin_room').emit(event, data);
  }

  // Get connected clients info
  getConnectedClients() {
    return Array.from(this.connectedClients.entries()).map(([id, info]) => ({
      id,
      ...info
    }));
  }
}

export const webSocketManager = new WebSocketManager(); 