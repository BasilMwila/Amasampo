// app/(tabs)/messages.tsx - Updated with real API integration
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../_layout';
import { COLORS, DEFAULT_IMAGES } from '../constants/constants';
import { apiService } from '../services/api';
import { socketService, type MessageNotification } from '../services/socketService';

interface Conversation {
  other_user: {
    id: number;
    name: string;
    shop_name?: string;
    avatar_url?: string;
  };
  last_message: {
    text: string;
    type: string;
    time: string;
    sender_id: number;
  };
  unread_count: number;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Load conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
      initializeRealTimeUpdates();
    }, [])
  );
  
  // Initialize real-time updates for message notifications
  const initializeRealTimeUpdates = async () => {
    try {
      // Connect to socket if not already connected
      const connected = await socketService.connect();
      setIsSocketConnected(connected);
      
      if (connected) {
        console.log('✅ Messages screen connected to socket');
        
        // Subscribe to message notifications to update conversation list
        const unsubscribeNotifications = socketService.onMessageNotification((notification: MessageNotification) => {
          console.log('🔔 Messages screen received notification:', notification.senderName);
          
          // Refresh conversations to show new message
          loadConversations(true);
        });
        
        // Subscribe to connection changes
        const unsubscribeConnection = socketService.onConnectionChange((connected) => {
          setIsSocketConnected(connected);
        });
        
        // Return cleanup function
        return () => {
          unsubscribeNotifications();
          unsubscribeConnection();
        };
      }
    } catch (error) {
      console.error('❌ Failed to initialize real-time updates:', error);
    }
  };

  const loadConversations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiService.getConversations();
      setConversations(response.conversations || []);
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      // Don't show error for empty conversations
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    router.push(`/chat/${conversation.other_user.id}` as any);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (timeString: string) => {
    const messageTime = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return `${days}d ago`;
      } else {
        return messageTime.toLocaleDateString();
      }
    }
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  };

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(conversation)}
    >
      <View style={styles.avatarContainer}>
        {conversation.other_user.avatar_url ? (
          <Image
            source={{ uri: conversation.other_user.avatar_url }}
            style={styles.avatar}
            defaultSource={{ uri: DEFAULT_IMAGES.USER_AVATAR }}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {getInitials(conversation.other_user.name)}
            </Text>
          </View>
        )}
        {/* Online indicator could be added here if you implement real-time status */}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{conversation.other_user.name}</Text>
            {conversation.other_user.shop_name && (
              <Text style={styles.shopName}>{conversation.other_user.shop_name}</Text>
            )}
          </View>
          <Text style={styles.timestamp}>
            {formatMessageTime(conversation.last_message.time)}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              conversation.unread_count > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {conversation.last_message.sender_id === user?.id && 'You: '}
            {conversation.last_message.text}
          </Text>
          {conversation.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateTitle}>No messages yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Start a conversation by messaging a seller from their product page
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push('/(tabs)' as any)}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      <Text style={styles.loadingText}>Loading conversations...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.subtitle}>
            {getTotalUnreadCount() > 0 
              ? `${getTotalUnreadCount()} unread message${getTotalUnreadCount() > 1 ? 's' : ''}`
              : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`
            }
          </Text>
          {/* Real-time connection indicator */}
          <View style={[styles.connectionIndicator, isSocketConnected ? styles.connectedIndicator : styles.disconnectedIndicator]}>
            <View style={[styles.connectionDot, { backgroundColor: isSocketConnected ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.connectionText}>
              {isSocketConnected ? 'Real-time updates' : 'Offline mode'}
            </Text>
          </View>
        </View>
        
        {/* You could add a compose button here */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadConversations(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
          ) : (
            <Text style={styles.refreshIcon}>🔄</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.other_user.id.toString()}
          renderItem={({ item }) => <ConversationItem conversation={item} />}
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadConversations(true)}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
          ListEmptyComponent={<EmptyState />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.CARD,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  connectedIndicator: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  disconnectedIndicator: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  connectionText: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BORDER,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.CARD,
    fontSize: 16,
    fontWeight: '600',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  shopName: {
    fontSize: 12,
    color: COLORS.TEXT_MUTED,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  unreadBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: COLORS.CARD,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: COLORS.CARD,
    fontSize: 14,
    fontWeight: '600',
  },
});