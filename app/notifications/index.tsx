/* eslint-disable @typescript-eslint/no-unused-vars */
// File: app/notifications/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../_layout';

interface Notification {
  id: number;
  type: 'order' | 'message' | 'review' | 'system' | 'promotion' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    orderId?: number;
    userId?: number;
    productId?: number;
    amount?: number;
  };
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'order',
    title: 'Order Confirmed',
    message: 'Your order #1005 has been confirmed by John Smith. Expected delivery: Today',
    timestamp: '2024-01-15T14:30:00Z',
    isRead: false,
    priority: 'high',
    actionUrl: '/orders/1005',
    metadata: { orderId: 1005, userId: 1 },
  },
  {
    id: 2,
    type: 'message',
    title: 'New Message',
    message: 'Mary Johnson sent you a message about your bread order',
    timestamp: '2024-01-15T13:45:00Z',
    isRead: false,
    priority: 'medium',
    actionUrl: '/chat/2',
    metadata: { userId: 2 },
  },
  {
    id: 3,
    type: 'review',
    title: 'New Review',
    message: 'Bob Wilson left a 5-star review for your Organic Apples',
    timestamp: '2024-01-15T12:20:00Z',
    isRead: true,
    priority: 'medium',
    actionUrl: '/reviews/1',
    metadata: { userId: 3, productId: 1 },
  },
  {
    id: 4,
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $14.95 from order #1004',
    timestamp: '2024-01-15T11:15:00Z',
    isRead: true,
    priority: 'high',
    actionUrl: '/orders/1004',
    metadata: { orderId: 1004, amount: 14.95 },
  },
  {
    id: 5,
    type: 'order',
    title: 'Order Ready for Pickup',
    message: 'Your order #1003 is ready for pickup at Smith Farm Market',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: true,
    priority: 'high',
    actionUrl: '/orders/1003',
    metadata: { orderId: 1003, userId: 1 },
  },
  {
    id: 6,
    type: 'promotion',
    title: 'Weekend Special',
    message: '20% off all organic fruits this weekend! Use code ORGANIC20',
    timestamp: '2024-01-14T09:00:00Z',
    isRead: true,
    priority: 'low',
  },
  {
    id: 7,
    type: 'system',
    title: 'Profile Updated',
    message: 'Your payment method has been successfully updated',
    timestamp: '2024-01-14T16:45:00Z',
    isRead: true,
    priority: 'low',
    actionUrl: '/payment/methods',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');
  const { user } = useAuth();
  const router = useRouter();

  const filteredNotifications = selectedTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string, priority: string) => {
    const baseIcons = {
      order: '📦',
      message: '💬',
      review: '⭐',
      system: '⚙️',
      promotion: '🎉',
      payment: '💰',
    };
    
    return baseIcons[type as keyof typeof baseIcons] || '📱';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification =>
      ({ ...notification, isRead: true })
    ));
  };

  const deleteNotification = (notificationId: number) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(notifications.filter(n => n.id !== notificationId));
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(notification)}
      onLongPress={() => {
        Alert.alert(
          'Notification Options',
          'Choose an action',
          [
            {
              text: notification.isRead ? 'Mark as Unread' : 'Mark as Read',
              onPress: () => {
                setNotifications(notifications.map(n =>
                  n.id === notification.id
                    ? { ...n, isRead: !n.isRead }
                    : n
                ));
              },
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteNotification(notification.id),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.notificationIcon}>
              {getNotificationIcon(notification.type, notification.priority)}
            </Text>
            {!notification.isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>
          
          <View style={styles.notificationInfo}>
            <Text style={[
              styles.notificationTitle,
              !notification.isRead && styles.unreadTitle,
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(notification.timestamp)}
            </Text>
          </View>

          <View style={styles.notificationActions}>
            <View style={[
              styles.priorityIndicator,
              { backgroundColor: getPriorityColor(notification.priority) }
            ]} />
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllReadButton}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'unread' && styles.activeTab]}
          onPress={() => setSelectedTab('unread')}
        >
          <Text style={[styles.tabText, selectedTab === 'unread' && styles.activeTabText]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NotificationCard notification={item} />}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>
            {selectedTab === 'unread' ? '✅' : '🔔'}
          </Text>
          <Text style={styles.emptyStateTitle}>
            {selectedTab === 'unread' ? 'All caught up!' : 'No notifications'}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {selectedTab === 'unread' 
              ? 'You have no unread notifications'
              : 'New notifications will appear here'
            }
          </Text>
        </View>
      )}

      {/* Notification Settings Quick Access */}
      {filteredNotifications.length > 0 && (
        <View style={styles.settingsHint}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/settings/notifications' as any)}
          >
            <Text style={styles.settingsButtonText}>
              ⚙️ Notification Settings
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  markAllReadButton: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 24,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  notificationActions: {
    alignItems: 'center',
    gap: 8,
  },
  priorityIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  settingsHint: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingsButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
});