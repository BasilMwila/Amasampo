// app/services/notificationService.ts - Push notification service
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';
import { socketService, type MessageNotification } from './socketService';

// Configure how notifications should be handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'message' | 'order' | 'product' | 'system';
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private permissionGranted: boolean = false;
  private pushToken: string | null = null;
  private notificationListeners: ((notification: any) => void)[] = [];

  constructor() {
    console.log('🔔 NotificationService initialized');
  }

  // Initialize push notifications
  async initialize(): Promise<boolean> {
    try {
      console.log('🔔 Initializing push notifications...');

      // Request permissions
      const permission = await this.requestPermissions();
      if (!permission) {
        console.log('⚠️ Notification permissions not granted');
        return false;
      }

      // Get push token
      const token = await this.getPushToken();
      if (!token) {
        console.log('⚠️ Failed to get push token');
        return false;
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      // Set up real-time notification handling
      this.setupSocketNotifications();

      console.log('✅ Push notifications initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('⚠️ Notification permission not granted');
        return false;
      }

      this.permissionGranted = true;
      console.log('✅ Notification permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get push notification token
  async getPushToken(): Promise<string | null> {
    try {
      if (!this.permissionGranted) {
        console.log('⚠️ Cannot get push token - permissions not granted');
        return null;
      }

      // Check if running in Expo Go - push notifications not supported in SDK 53+
      const isExpoGo = __DEV__ && !process.env.EXPO_DEVELOPMENT_CLIENT;
      
      if (isExpoGo) {
        console.log('⚠️ Push notifications not supported in Expo Go. Use a development build instead.');
        console.log('📖 See: https://docs.expo.dev/develop/development-builds/introduction/');
        return null;
      }

      // For development build or production
      let token;
      try {
        console.log('🔧 Attempting to get push token...');
        token = await Notifications.getExpoPushTokenAsync();
        console.log('✅ Got push token successfully');
      } catch (error: any) {
        console.error('❌ Failed to get push token:', error.message);
        return null;
      }

      this.pushToken = token.data;
      
      // Store token locally
      await AsyncStorage.setItem('push_token', token.data);
      
      // Send token to backend (if user is authenticated)
      try {
        await apiService.registerPushToken(token.data, 'mobile', 'default');
        console.log('✅ Push token registered with backend:', token.data);
      } catch (error) {
        console.warn('⚠️ Failed to send push token to backend:', error);
      }

      return token.data;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  }

  // Setup notification listeners
  private setupNotificationListeners(): void {
    // Handle notifications when app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
      
      // Notify listeners
      this.notificationListeners.forEach(callback => callback(notification));
    });

    // Handle notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      const data = response.notification.request.content.data;
      this.handleNotificationTap(data);
    });

    // Store listeners for cleanup
    // You might want to store these in class properties for cleanup
  }

  // Setup socket-based notifications
  private setupSocketNotifications(): void {
    // Listen for message notifications from socket
    socketService.onMessageNotification((notification: MessageNotification) => {
      // Only show notification if the app is backgrounded or user is not in the conversation
      const shouldShowNotification = true; // You can add logic here to check app state
      
      if (shouldShowNotification) {
        console.log('🔔 Showing notification for message:', notification.message);
        this.showLocalNotification({
          type: 'message',
          title: `New message from ${notification.senderName}`,
          body: notification.message,
          data: {
            senderId: notification.senderId,
            conversationId: notification.conversationId,
            type: 'message'
          }
        });
      } else {
        console.log('🔕 Skipping notification - user is in conversation');
      }
    });
  }

  // Show local notification
  async showLocalNotification(notificationData: NotificationData): Promise<void> {
    try {
      if (!this.permissionGranted) {
        console.log('⚠️ Cannot show notification - permissions not granted');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });

      console.log('🔔 Local notification sent:', notificationData.title);
    } catch (error) {
      console.error('❌ Error showing local notification:', error);
    }
  }

  // Handle notification tap
  private handleNotificationTap(data: any): void {
    try {
      console.log('👆 Handling notification tap:', data);

      // Navigate based on notification type
      switch (data?.type) {
        case 'message':
          // Navigate to chat screen
          if (data.senderId) {
            // You might need to import router here or pass it as dependency
            console.log(`Navigate to chat with user ${data.senderId}`);
            // router.push(`/chat/${data.senderId}`);
          }
          break;
        
        case 'order':
          // Navigate to order screen
          if (data.orderId) {
            console.log(`Navigate to order ${data.orderId}`);
            // router.push(`/orders/${data.orderId}`);
          }
          break;
        
        default:
          console.log('Unknown notification type:', data?.type);
      }
    } catch (error) {
      console.error('❌ Error handling notification tap:', error);
    }
  }

  // Subscribe to notification events
  onNotificationReceived(callback: (notification: any) => void): () => void {
    this.notificationListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationListeners.indexOf(callback);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  // Check if notifications are enabled
  isPermissionGranted(): boolean {
    return this.permissionGranted;
  }

  // Get stored push token
  getPushTokenSync(): string | null {
    return this.pushToken;
  }

  // Send message notification
  async notifyNewMessage(senderName: string, message: string, senderId: number): Promise<void> {
    await this.showLocalNotification({
      type: 'message',
      title: `New message from ${senderName}`,
      body: message,
      data: {
        senderId,
        type: 'message'
      }
    });
  }

  // Send order notification
  async notifyOrderUpdate(orderNumber: string, status: string, orderId: number): Promise<void> {
    await this.showLocalNotification({
      type: 'order',
      title: 'Order Status Update',
      body: `Order ${orderNumber} is now ${status}`,
      data: {
        orderId,
        type: 'order'
      }
    });
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('🗑️ All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  // Set badge count
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log(`🔢 Badge count set to ${count}`);
    } catch (error) {
      console.error('❌ Error setting badge count:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;