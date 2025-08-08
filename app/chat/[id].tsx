/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../_layout';
import { COLORS, DEFAULT_IMAGES } from '../constants/constants';
import { apiService, type ChatUser, type Message } from '../services/api';
import { socketService, type SocketMessage } from '../services/socketService';

// Enhanced Message interface with product data
interface EnhancedMessage extends Message {
  product_data?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    seller_name?: string;
    category_name?: string;
    is_active: boolean;
    quantity: number;
  };
  text_content?: string;
}

// Product Card Component for Chat
const ProductChatCard = ({ product, onPress }: { 
  product: any; 
  onPress: () => void; 
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSource = () => {
    if (!product.image_url || imageError) {
      return { uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER };
    }
    return { uri: product.image_url };
  };

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <View style={styles.productCardHeader}>
        <Text style={styles.productCardLabel}>🏷️ Product Reference</Text>
        <View style={[
          styles.productStatus, 
          product.is_active ? styles.productActive : styles.productInactive
        ]}>
          <Text style={[
            styles.productStatusText,
            product.is_active ? styles.productActiveText : styles.productInactiveText
          ]}>
            {product.is_active ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
      
      <View style={styles.productCardContent}>
        <Image 
          source={getImageSource()}
          style={styles.productCardImage}
          onError={handleImageError}
          resizeMode="cover"
        />
        
        <View style={styles.productCardInfo}>
          <Text style={styles.productCardName} numberOfLines={2}>
            {product.name}
          </Text>
          
          <Text style={styles.productCardPrice}>
            ${product.price?.toFixed(2) || '0.00'}
          </Text>
          
          {product.quantity !== undefined && (
            <Text style={styles.productCardQuantity}>
              {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
            </Text>
          )}
          
          {product.category_name && (
            <Text style={styles.productCardCategory}>
              📂 {product.category_name}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.productCardFooter}>
        <Text style={styles.productCardAction}>
          👆 Tap to view product details
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (id) {
      loadConversation();
      
      // Initialize real-time messaging and store cleanup function
      const initMessaging = async () => {
        cleanup = await initializeRealTimeMessaging();
      };
      initMessaging();
    }
    
    return () => {
      // Cleanup socket connections and event listeners
      socketService.leaveChat();
      if (cleanup) {
        cleanup();
      }
    };
  }, [id]);
  
  // Initialize real-time messaging
  const initializeRealTimeMessaging = async (): Promise<(() => void) | undefined> => {
    try {
      // Connect to socket if not already connected
      const connected = await socketService.connect();
      setIsSocketConnected(connected);
      
      if (connected && id) {
        // Join the chat room
        socketService.joinChat(Number(id));
        
        // Subscribe to new messages
        const unsubscribeMessages = socketService.onNewMessage((socketMessage: SocketMessage) => {
          console.log('📨 Received real-time message:', socketMessage);
          
          // Convert socket message to enhanced message format
          const enhancedMessage: EnhancedMessage = {
            id: socketMessage.id,
            sender_id: socketMessage.sender_id,
            receiver_id: socketMessage.receiver_id,
            message_text: socketMessage.message_text,
            message_type: socketMessage.message_type,
            is_read: false,
            created_at: socketMessage.created_at,
            updated_at: socketMessage.created_at,
            conversation_id: socketMessage.conversation_id,
            sender_name: socketMessage.sender_name
          };
          
          // Add message to the list if it's not already there
          setMessages(prevMessages => {
            const exists = prevMessages.some(msg => msg.id === socketMessage.id);
            if (exists) return prevMessages;
            
            return [...prevMessages, enhancedMessage];
          });
        });
        
        // Subscribe to connection changes
        const unsubscribeConnection = socketService.onConnectionChange((connected) => {
          setIsSocketConnected(connected);
        });
        
        // Return cleanup function
        return () => {
          unsubscribeMessages();
          unsubscribeConnection();
        };
      }
    } catch (error) {
      console.error('❌ Failed to initialize real-time messaging:', error);
    }
    
    return undefined;
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.getConversationMessages(Number(id));
      
      setMessages(response.messages || []);
      setOtherUser(response.other_user);
      
      console.log('✅ Loaded conversation:', {
        messagesCount: response.messages?.length || 0,
        otherUser: response.other_user?.name
      });
      
    } catch (error: any) {
      console.error('❌ Failed to load conversation:', error);
      
      Alert.alert(
        'Error',
        'Failed to load conversation. Please try again.',
        [
          { text: 'Go Back', onPress: () => router.back() },
          { text: 'Retry', onPress: loadConversation }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !otherUser || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Try to send via socket first (real-time)
      if (isSocketConnected) {
        console.log('📤 Sending message via socket');
        socketService.sendMessage(otherUser.id, messageText, 'text');
      } else {
        // Fallback to HTTP only when socket is not connected
        console.log('📤 Sending message via HTTP (socket not connected)');
        const response = await apiService.sendConversationMessage(
          otherUser.id, 
          messageText, 
          'text'
        );
        
        // Add message to list since no real-time update
        setMessages(prevMessages => [...prevMessages, response.data]);
      }

      console.log('✅ Message sent successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      
      setNewMessage(messageText);
      
      Alert.alert(
        'Error',
        'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  const handleProductPress = (productId: number) => {
    router.push(`/products/${productId}` as any);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusIcon = (message: EnhancedMessage) => {
    if (message.sender_id !== user?.id) return '';
    return message.is_read ? '✓✓' : '✓';
  };

  const renderMessage = ({ item }: { item: EnhancedMessage }) => {
    const isMyMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}>
        {/* Product Reference Message */}
        {item.message_type === 'product_reference' && item.product_data && (
          <View style={[
            styles.productMessageBubble,
            isMyMessage ? styles.myProductMessageBubble : styles.otherProductMessageBubble,
          ]}>
            <ProductChatCard 
              product={item.product_data} 
              onPress={() => handleProductPress(item.product_data!.id)}
            />
            
            {/* Text content if available */}
            {item.text_content && (
              <View style={styles.productMessageText}>
                <Text style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.otherMessageText,
                ]}>
                  {item.text_content}
                </Text>
              </View>
            )}
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
              ]}>
                {formatTime(item.created_at)}
              </Text>
              {isMyMessage && (
                <Text style={[
                  styles.messageStatus,
                  item.is_read && styles.messageStatusRead,
                ]}>
                  {getStatusIcon(item)}
                </Text>
              )}
            </View>
          </View>
        )}
        
        {/* Regular Text Message */}
        {item.message_type !== 'product_reference' && (
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}>
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}>
              {item.message_text || item.message || ''}
            </Text>
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
              ]}>
                {formatTime(item.created_at)}
              </Text>
              {isMyMessage && (
                <Text style={[
                  styles.messageStatus,
                  item.is_read && styles.messageStatusRead,
                ]}>
                  {getStatusIcon(item)}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!otherUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          {/* Connection status indicator */}
          <View style={[styles.connectionStatus, isSocketConnected ? styles.connected : styles.disconnected]}>
            <View style={[styles.connectionDot, { backgroundColor: isSocketConnected ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.statusText}>
              {isSocketConnected ? 'Real-time' : 'Offline'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {otherUser.name.split(' ').map((n: string) => n[0]).join('')}
              </Text>
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{otherUser.name}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.userStatus}>Active</Text>
              </View>
              {otherUser.shop_name && (
                <Text style={styles.shopName}>🏪 {otherUser.shop_name}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => {
              Alert.alert(
                'Chat Options',
                'Choose an action',
                [
                  { text: 'View Profile', onPress: () => router.push(`/users/${otherUser.id}` as any) },
                  { text: 'Block User', style: 'destructive' },
                  { text: 'Report User', style: 'destructive' },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <Text style={styles.headerButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesIcon}>💬</Text>
              <Text style={styles.emptyMessagesText}>
                Start a conversation with {otherUser.name}
              </Text>
              <Text style={styles.emptyMessagesSubtext}>
                Send a message or share a product to get started
              </Text>
            </View>
          }
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              editable={!sending}
            />
            <TouchableOpacity style={styles.attachButton}>
              <Text style={styles.attachButtonText}>📎</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (newMessage.trim() && !sending) ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.sendButtonText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.PRIMARY,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.CARD,
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  userStatus: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  shopName: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    marginTop: 2,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 16,
  },
  connectionStatus: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  connected: {
    borderColor: '#10B981',
  },
  disconnected: {
    borderColor: '#EF4444',
  },
  connectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyMessagesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyMessagesText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.CARD,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Product message styles
  productMessageBubble: {
    maxWidth: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  myProductMessageBubble: {
    backgroundColor: COLORS.CARD,
    borderBottomRightRadius: 4,
  },
  otherProductMessageBubble: {
    backgroundColor: COLORS.CARD,
    borderBottomLeftRadius: 4,
  },
  productCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  productCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  productStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  productActive: {
    backgroundColor: '#10B981',
  },
  productInactive: {
    backgroundColor: '#EF4444',
  },
  productStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  productActiveText: {
    color: '#ffffff',
  },
  productInactiveText: {
    color: '#ffffff',
  },
  productCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  productCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND,
    marginRight: 12,
  },
  productCardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  productCardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 2,
  },
  productCardQuantity: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  productCardCategory: {
    fontSize: 11,
    color: COLORS.TEXT_MUTED,
  },
  productCardFooter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  productCardAction: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    textAlign: 'center',
    fontWeight: '500',
  },
  productMessageText: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: COLORS.TEXT_PRIMARY,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: COLORS.TEXT_SECONDARY,
  },
  messageStatus: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageStatusRead: {
    color: '#10B981',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 36,
    textAlignVertical: 'center',
    color: COLORS.TEXT_PRIMARY,
  },
  attachButton: {
    marginLeft: 8,
    padding: 4,
  },
  attachButtonText: {
    fontSize: 18,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.TEXT_MUTED,
  },
  sendButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});