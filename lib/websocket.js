const { Server: SocketIOServer } = require('socket.io');

class WebSocketManager {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
  }

  initialize(server) {
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

  setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle admin authentication
      socket.on('admin_auth', (data) => {
        // Verify admin token here
        this.connectedClients.set(socket.id, { type: 'admin' });
        socket.join('admin_room');
        console.log('Admin authenticated and joined admin room');
      });

      // Handle customer connection
      socket.on('customer_connect', (data) => {
        this.connectedClients.set(socket.id, { 
          type: 'customer', 
          tableNumber: data.tableNumber 
        });
        socket.join(`table_${data.tableNumber}`);
        socket.join('customer_room');
        console.log(`Customer from table ${data.tableNumber} connected`);
      });

      // Handle order status updates from admin
      socket.on('update_order_status', (data) => {
        this.broadcastOrderUpdate(data);
      });

      // Handle menu updates from admin
      socket.on('menu_update', (data) => {
        this.broadcastMenuUpdate(data);
      });

      // Handle notifications
      socket.on('send_notification', (data) => {
        this.broadcastNotification(data);
      });

      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Broadcast order updates to relevant clients
  broadcastOrderUpdate(orderUpdate) {
    if (!this.io) return;

    // Send to admin room
    this.io.to('admin_room').emit('order_status_update', orderUpdate);
    
    // Send to specific table
    this.io.to(`table_${orderUpdate.tableNumber}`).emit('order_status_update', orderUpdate);
    
    console.log(`Order update broadcasted: ${orderUpdate.orderId} - ${orderUpdate.status}`);
  }

  // Broadcast menu updates to all customers
  broadcastMenuUpdate(menuUpdate) {
    if (!this.io) return;
    
    this.io.to('customer_room').emit('menu_update', menuUpdate);
    console.log(`Menu update broadcasted: ${menuUpdate.type}`);
  }

  // Broadcast notifications
  broadcastNotification(notification) {
    if (!this.io) return;

    if (notification.type === 'new_order') {
      // Send new order notifications to admin
      this.io.to('admin_room').emit('notification', notification);
    } else {
      // Send other notifications to all connected clients
      this.io.emit('notification', notification);
    }
    
    console.log(`Notification broadcasted: ${notification.title}`);
  }

  // Send message to specific table
  sendToTable(tableNumber, event, data) {
    if (!this.io) return;
    this.io.to(`table_${tableNumber}`).emit(event, data);
  }

  // Send message to admin
  sendToAdmin(event, data) {
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

// Create singleton instance
const webSocketManager = new WebSocketManager();

module.exports = { webSocketManager }; 