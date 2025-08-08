// app/services/socketService.ts - Real-time messaging service using Socket.IO
import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

export interface SocketMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  message_type: string;
  conversation_id?: number;
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
}

export interface MessageNotification {
  senderId: number;
  senderName: string;
  message: string;
  messageType: string;
  conversationId: number;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private messageCallbacks: ((message: SocketMessage) => void)[] = [];
  private notificationCallbacks: ((notification: MessageNotification) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private currentUserId: number | null = null;
  private currentChatRoom: string | null = null;

  constructor() {
    console.log('🔌 SocketService initialized');
  }

  // Connect to Socket.IO server
  async connect(): Promise<boolean> {
    try {
      if (this.isConnected && this.socket) {
        console.log('🔌 Already connected to socket server');
        return true;
      }

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.log('❌ No auth token found, cannot connect to socket');
        return false;
      }

      // Get base URL from API service
      const baseUrl = apiService.getBaseURL().replace('/api', '');
      console.log('🔌 Connecting to socket server:', baseUrl);

      this.socket = io(baseUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      // Set up event listeners
      this.setupEventListeners();

      return new Promise((resolve) => {
        if (!this.socket) {
          resolve(false);
          return;
        }

        const timeout = setTimeout(() => {
          console.log('❌ Socket connection timeout');
          resolve(false);
        }, 10000);

        this.socket.on('connected', (data) => {
          console.log('✅ Socket connected successfully:', data.user?.name);
          this.isConnected = true;
          this.currentUserId = data.user?.id;
          clearTimeout(timeout);
          
          // Notify connection callbacks
          this.connectionCallbacks.forEach(callback => callback(true));
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message);
          this.isConnected = false;
          clearTimeout(timeout);
          
          // Notify connection callbacks
          this.connectionCallbacks.forEach(callback => callback(false));
          resolve(false);
        });
      });
    } catch (error) {
      console.error('❌ Socket connection failed:', error);
      return false;
    }
  }

  // Disconnect from Socket.IO server
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting from socket server');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
      this.currentChatRoom = null;
      
      // Notify connection callbacks
      this.connectionCallbacks.forEach(callback => callback(false));
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
      
      // Notify connection callbacks
      this.connectionCallbacks.forEach(callback => callback(false));
    });

    // Handle new messages
    this.socket.on('new_message', (messageData: SocketMessage) => {
      console.log('📨 Received new message:', messageData);
      
      // Notify message callbacks
      this.messageCallbacks.forEach(callback => callback(messageData));
    });

    // Handle message notifications
    this.socket.on('new_message_notification', (notification: MessageNotification) => {
      console.log('🔔 Received message notification:', notification);
      
      // Notify notification callbacks
      this.notificationCallbacks.forEach(callback => callback(notification));
    });

    // Handle user typing
    this.socket.on('user_typing', (data: { userId: number; userName: string }) => {
      console.log(`⌨️ User ${data.userName} is typing`);
      // You can add typing indicator logic here
    });

    this.socket.on('user_stopped_typing', (data: { userId: number; userName: string }) => {
      console.log(`⌨️ User ${data.userName} stopped typing`);
      // You can add typing indicator logic here
    });

    // Handle connection errors
    this.socket.on('error', (error: { message: string }) => {
      console.error('❌ Socket error:', error.message);
    });
  }

  // Join a chat room
  joinChat(recipientId: number): void {
    if (!this.socket || !this.isConnected) {
      console.log('❌ Cannot join chat - socket not connected');
      return;
    }

    // Create chat room ID (consistent regardless of who joins first)
    const chatRoomId = [this.currentUserId, recipientId].sort().join('_');
    
    // Only join if not already in this room
    if (this.currentChatRoom === chatRoomId) {
      console.log('🏠 Already in chat room:', chatRoomId);
      return;
    }

    console.log('🏠 Joining chat room:', chatRoomId, 'with recipient:', recipientId);
    this.currentChatRoom = chatRoomId;
    this.socket.emit('join_chat', { recipientId });
  }

  // Leave current chat room
  leaveChat(): void {
    if (!this.socket || !this.currentChatRoom) return;

    console.log('🚪 Leaving chat room:', this.currentChatRoom);
    // Just reset the current room - server handles the actual leaving
    this.currentChatRoom = null;
  }

  // Send a message via socket
  sendMessage(recipientId: number, messageText: string, messageType: string = 'text', productId?: number): void {
    if (!this.socket || !this.isConnected) {
      console.log('❌ Cannot send message - socket not connected');
      return;
    }

    console.log('📤 Sending message via socket:', { recipientId, messageText, messageType });
    
    this.socket.emit('send_message', {
      recipientId,
      messageText,
      messageType,
      productId
    });
  }

  // Mark messages as read
  markMessagesRead(senderId: number): void {
    if (!this.socket || !this.isConnected) return;

    console.log('👁️ Marking messages as read from:', senderId);
    this.socket.emit('mark_messages_read', { senderId });
  }

  // Start typing indicator
  startTyping(recipientId: number): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing_start', { recipientId });
  }

  // Stop typing indicator
  stopTyping(recipientId: number): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing_stop', { recipientId });
  }

  // Subscribe to new messages
  onNewMessage(callback: (message: SocketMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to message notifications
  onMessageNotification(callback: (notification: MessageNotification) => void): () => void {
    this.notificationCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to connection status
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  // Check if connected
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get current user ID
  getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  // Get current chat room
  getCurrentChatRoom(): string | null {
    return this.currentChatRoom;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;