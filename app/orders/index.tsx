// File: app/orders/index.tsx
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

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  buyerId?: number;
  buyerName?: string;
  sellerId?: number;
  sellerName?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
  deliveryAddress?: string;
  notes?: string;
}

// Mock data for buyer orders
const mockBuyerOrders: Order[] = [
  {
    id: 1001,
    sellerId: 1,
    sellerName: 'John Smith',
    items: [
      { id: 1, productName: 'Organic Apples', quantity: 3, price: 2.99 },
      { id: 2, productName: 'Local Honey', quantity: 1, price: 8.99 },
    ],
    total: 17.96,
    status: 'delivered',
    orderDate: '2024-01-14T10:30:00Z',
    deliveryAddress: '123 Main St, Apt 4B',
  },
  {
    id: 1002,
    sellerId: 2,
    sellerName: 'Mary Johnson',
    items: [
      { id: 3, productName: 'Fresh Bread', quantity: 2, price: 3.50 },
    ],
    total: 7.00,
    status: 'preparing',
    orderDate: '2024-01-15T14:20:00Z',
    estimatedDelivery: '2024-01-16T10:00:00Z',
    deliveryAddress: '123 Main St, Apt 4B',
  },
];

// Mock data for seller orders
const mockSellerOrders: Order[] = [
  {
    id: 2001,
    buyerId: 3,
    buyerName: 'Bob Wilson',
    items: [
      { id: 1, productName: 'Organic Apples', quantity: 5, price: 2.99 },
    ],
    total: 14.95,
    status: 'confirmed',
    orderDate: '2024-01-15T09:15:00Z',
    deliveryAddress: '456 Oak Avenue',
    notes: 'Please call when you arrive',
  },
  {
    id: 2002,
    buyerId: 4,
    buyerName: 'Alice Brown',
    items: [
      { id: 2, productName: 'Local Honey', quantity: 2, price: 8.99 },
      { id: 1, productName: 'Organic Apples', quantity: 2, price: 2.99 },
    ],
    total: 23.96,
    status: 'ready',
    orderDate: '2024-01-14T16:45:00Z',
    deliveryAddress: '789 Pine Street',
  },
];

export default function OrdersScreen() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const router = useRouter();

  const orders = user?.type === 'buyer' ? mockBuyerOrders : mockSellerOrders;

  const activeOrders = orders.filter(order => 
    !['delivered', 'cancelled'].includes(order.status)
  );
  
  const completedOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const currentOrders = selectedTab === 'active' ? activeOrders : completedOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'delivered': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const handleUpdateOrderStatus = (orderId: number, newStatus: string) => {
    Alert.alert(
      'Update Order Status',
      `Change order status to ${getStatusText(newStatus)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            // Here you would update the order status via API
            Alert.alert('Success', 'Order status updated successfully');
          },
        },
      ]
    );
  };

  const handleContactUser = (order: Order) => {
    const contactId = user?.type === 'buyer' ? order.sellerId : order.buyerId;
    if (contactId) {
      router.push(`/chat/${contactId}` as any);
    }
  };

  const handleOrderDetails = (order: Order) => {
    router.push(`/orders/${order.id}` as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderDetails(order)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
        <Text style={styles.orderUser}>
          {user?.type === 'buyer' ? `Seller: ${order.sellerName}` : `Buyer: ${order.buyerName}`}
        </Text>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <Text key={item.id} style={styles.orderItem} numberOfLines={1}>
            {item.quantity}x {item.productName}
          </Text>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: ${order.total.toFixed(2)}</Text>
        
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleContactUser(order)}
          >
            <Text style={styles.actionButtonText}>💬</Text>
          </TouchableOpacity>
          
          {user?.type === 'seller' && !['delivered', 'cancelled'].includes(order.status) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.updateButton]}
              onPress={() => {
                const nextStatus = order.status === 'confirmed' ? 'preparing' : 
                                 order.status === 'preparing' ? 'ready' : 'delivered';
                handleUpdateOrderStatus(order.id, nextStatus);
              }}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {order.estimatedDelivery && (
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryText}>
            📅 Estimated delivery: {formatDate(order.estimatedDelivery)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {user?.type === 'buyer' ? 'My Orders' : 'Sales Orders'}
        </Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            Completed ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>
              {selectedTab === 'active' ? '📦' : '✅'}
            </Text>
            <Text style={styles.emptyStateTitle}>
              No {selectedTab} orders
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {selectedTab === 'active' 
                ? user?.type === 'buyer' 
                  ? 'Start shopping to place your first order'
                  : 'New orders will appear here'
                : user?.type === 'buyer'
                  ? 'Your completed orders will appear here'
                  : 'Completed sales will appear here'
              }
            </Text>
            {selectedTab === 'active' && user?.type === 'buyer' && (
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/(tabs)' as any)}
              >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {user?.type === 'seller' && (
        <View style={styles.sellerFooter}>
          <Text style={styles.sellerFooterText}>
            💡 Tip: Keep your customers updated by changing order status as you prepare their items
          </Text>
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
  spacer: {
    width: 60,
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
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  orderUser: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  updateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  deliveryInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  deliveryText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
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
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sellerFooter: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sellerFooterText: {
    fontSize: 12,
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 16,
  },
});