/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
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

interface Message {
  id: number;
  text: string;
  senderId: number;
  senderName: string;
  timestamp: string;
  type: 'text' | 'image' | 'product';
  status: 'sent' | 'delivered' | 'read';
}

interface ChatUser {
  id: number;
  name: string;
  isOnline: boolean;
  lastSeen?: string;
  shopName?: string;
  type: 'buyer' | 'seller';
}

const mockUsers: ChatUser[] = [
  { id: 1, name: 'John Smith', isOnline: true, shopName: 'Smith Farm Market', type: 'seller' },
  { id: 2, name: 'Mary Johnson', isOnline: false, lastSeen: '2 hours ago', shopName: "Mary's Bakery", type: 'seller' },
  { id: 3, name: 'Bob Wilson', isOnline: true, type: 'buyer' },
];

const mockMessages: Message[] = [
  {
    id: 1,
    text: 'Hi! I&apos;m interested in your organic apples. Are they still available?',
    senderId: 3,
    senderName: 'Bob Wilson',
    timestamp: '2024-01-15T10:30:00Z',
    type: 'text',
    status: 'read',
  },
  {
    id: 2,
    text: 'Hello! Yes, we have plenty of organic apples available. They&apos;re freshly picked this morning.',
    senderId: 1,
    senderName: 'John Smith',
    timestamp: '2024-01-15T10:32:00Z',
    type: 'text',
    status: 'read',
  },
  {
    id: 3,
    text: 'Great! How much for 5 pounds? And can I pick them up today?',
    senderId: 3,
    senderName: 'Bob Wilson',
    timestamp: '2024-01-15T10:35:00Z',
    type: 'text',
    status: 'read',
  },
  {
    id: 4,
    text: 'That would be $14.95 for 5 pounds. Yes, you can pick them up anytime between 9 AM and 6 PM. We&apos;re located at 123 Farm Road.',
    senderId: 1,
    senderName: 'John Smith',
    timestamp: '2024-01-15T10:38:00Z',
    type: 'text',
    status: 'read',
  },
  {
    id: 5,
    text: 'Perfect! I&apos;ll be there around 2 PM today. Should I bring cash or do you accept card?',
    senderId: 3,
    senderName: 'Bob Wilson',
    timestamp: '2024-01-15T10:40:00Z',
    type: 'text',
    status: 'delivered',
  },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Find the other user
    const foundUser = mockUsers.find(u => u.id === parseInt(id as string));
    setOtherUser(foundUser || null);

    // Filter messages for this conversation
    const conversationMessages = mockMessages.filter(
      msg => 
        (msg.senderId === user?.id && parseInt(id as string) === parseInt(id as string)) ||
        (msg.senderId === parseInt(id as string) && user?.id === user?.id)
    );
    setMessages(conversationMessages);
  }, [id, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !otherUser) return;

    const message: Message = {
      id: Date.now(),
      text: newMessage.trim(),
      senderId: user.id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent',
    };

    setMessages(prevMessages => [...prevMessages, message]);
    setNewMessage('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    // Simulate read receipt
    setTimeout(() => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 3000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
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
    const isMyMessage = item.senderId === user?.id;
    
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
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}>
              {formatTime(item.timestamp)}
            </Text>
            {isMyMessage && (
              <Text style={[
                styles.messageStatus,
                item.status === 'read' && styles.messageStatusRead,
              ]}>
                {getStatusIcon(item.status)}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

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
                <View style={[
                  styles.statusDot,
                  { backgroundColor: otherUser.isOnline ? '#10b981' : '#d1d5db' }
                ]} />
                <Text style={styles.userStatus}>
                  {otherUser.isOnline ? 'Online' : `Last seen ${otherUser.lastSeen || 'recently'}`}
                </Text>
              </View>
              {otherUser.shopName && (
                <Text style={styles.shopName}>🏪 {otherUser.shopName}</Text>
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
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>{otherUser.name} is typing...</Text>
          </View>
        )}

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
            />
            <TouchableOpacity style={styles.attachButton}>
              <Text style={styles.attachButtonText}>📎</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[
              styles.sendButton,
              newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
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
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
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