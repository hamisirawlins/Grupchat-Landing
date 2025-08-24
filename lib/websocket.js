import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  // Connect to WebSocket server
  connect(userId) {
    if (this.socket && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      // Connect to backend WebSocket server
      this.socket = io('https://api.grupchat.info', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000
      });

      this.setupEventListeners(userId);
      
      console.log('WebSocket connecting...');
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  // Setup event listeners
  setupEventListeners(userId) {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Authenticate user with backend
      this.socket.emit('authenticate', userId);
      
      // Join notifications room
      this.socket.emit('join-notifications', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    // Reconnection events
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      
      // Re-authenticate and rejoin room
      this.socket.emit('authenticate', userId);
      this.socket.emit('join-notifications', userId);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`WebSocket reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.isConnected = false;
    });

    // Notification events
    this.socket.on('new-notification', (notification) => {
      console.log('New real-time notification received:', notification);
      
      // Emit custom event for components to listen to
      const event = new CustomEvent('new-notification', { 
        detail: notification 
      });
      window.dispatchEvent(event);
    });
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('WebSocket disconnected');
    }
  }

  // Check connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Send custom event to server
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }

  // Listen for custom events from server
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
