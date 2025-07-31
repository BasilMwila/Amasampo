/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { apiService } from '../services/api';

interface Message {
  id: number;
  message_text: string;
  sender_id: number;
  receiver_id: number;
  sender_name?: string;
  receiver_name?: string;
  created_at: string;
  message_type: 'text' | 'image' | 'product';
  is_read: boolean;
}

interface ChatUser {
  id: number;
  name: string;
  shop_name?: string;
  avatar_url?: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      loadConversation();
    }
  }, [id]);

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
      
      const response = await apiService.request<{
        messages: Message[];
        other_user: ChatUser;
        pagination: any;
      }>(`/messages/conversation/${id}`);
      
      setMessages(response.messages || []);
      setOtherUser(response.other_user);
      
      console.log('✅ Loaded conversation:', {
        messagesCount: response.messages?.length || 0,
        otherUser: response.other_user?.name
      });
      
    } catch (error: any) {
      console.error('❌ Failed to load conversation:', error);
      
      // Show user-friendly error
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
      const response = await apiService.request<{
        message: string;
        data: Message;
      }>('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          recipient_id: otherUser.id,
          message_text: messageText,
          message_type: 'text'
        })
      });

      // Add the new message to the list
      setMessages(prevMessages => [...prevMessages, response.data]);

      console.log('✅ Message sent successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      
      // Restore the message text so user can try again
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusIcon = (message: Message) => {
    if (message.sender_id !== user?.id) return '';
    return message.is_read ? '✓✓' : '✓';
  };

  const handleCall = () => {
    Alert.alert(
      'Call Feature',
      'Voice calling feature will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const handleVideoCall = () => {
    Alert.alert(
      'Video Call Feature',
      'Video calling feature will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const handleMoreOptions = () => {
    Alert.alert(
      'More Options',
      'Choose an action',
      [
        { text: 'Block User', style: 'destructive' },
        { text: 'Report User', style: 'destructive' },
        { text: 'Clear Chat' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
          ]}>
            {item.message_text}
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
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {otherUser.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{otherUser.name}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: '#d1d5db' }]} />
                <Text style={styles.userStatus}>
                  Recently active
                </Text>
              </View>
              {otherUser.shop_name && (
                <Text style={styles.shopName}>🏪 {otherUser.shop_name}</Text>
              )}
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleCall}>
              <Text style={styles.headerButtonText}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleVideoCall}>
              <Text style={styles.headerButtonText}>📹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleMoreOptions}>
              <Text style={styles.headerButtonText}>⋮</Text>
            </TouchableOpacity>
          </View>
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
              <Text style={styles.emptyMessagesText}>
                Start a conversation with {otherUser.name}
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backIcon: {
    fontSize: 24,
    color: '#3b82f6',
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
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
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
    color: '#6b7280',
  },
  shopName: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 16,
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
  },
  emptyMessagesText: {
    fontSize: 16,
    color: '#6b7280',
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
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#1a1a1a',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#6b7280',
  },
  messageStatus: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageStatusRead: {
    color: '#10b981',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
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
    backgroundColor: '#3b82f6',
  },
  sendButtonInactive: {
    backgroundColor: '#d1d5db',
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
    color: '#6b7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
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