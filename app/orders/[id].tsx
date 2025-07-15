/* eslint-disable @typescript-eslint/no-unused-vars */
// File: app/orders/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../_layout';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderDetails {
  id: number;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  
  // Buyer/Seller info
  buyerId?: number;
  buyerName?: string;
  buyerPhone?: string;
  sellerId?: number;
  sellerName?: string;
  sellerPhone?: string;
  shopName?: string;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  
  // Delivery
  deliveryAddress: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  deliveryInstructions?: string;
  
  // Payment
  paymentMethod: {
    type: string;
    last4: string;
  };
  
  // Tracking
  trackingNumber?: string;
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

const mockOrder: OrderDetails = {
  id: 1005,
  orderNumber: 'ORD-2024-1005',
  status: 'preparing',
  orderDate: '2024-01-15T14:30:00Z',
  estimatedDelivery: '2024-01-16T16:00:00Z',
  
  buyerId: 3,
  buyerName: 'Bob Wilson',
  buyerPhone: '+1 (555) 123-4567',
  sellerId: 1,
  sellerName: 'John Smith',
  sellerPhone: '+1 (555) 987-6543',
  shopName: 'Smith Farm Market',
  
  items: [
    {
      id: 1,
      productId: 1,
      productName: 'Organic Apples',
      productImage: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
      quantity: 3,
      price: 2.99,
      subtotal: 8.97,
    },
    {
      id: 2,
      productId: 3,
      productName: 'Local Honey',
      productImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop',
      quantity: 1,
      price: 8.99,
      subtotal: 8.99,
    },
  ],
  
  subtotal: 17.96,
  deliveryFee: 2.50,
  serviceFee: 0.54,
  tax: 1.68,
  total: 22.68,
  
  deliveryAddress: {
    name: 'Home',
    address: '123 Main Street, Apt 4B',
    city: 'Downtown, NY 10001',
    phone: '+1 (555) 123-4567',
  },
  deliveryInstructions: 'Leave at front door if no answer. Ring doorbell twice.',
  
  paymentMethod: {
    type: 'Visa Credit Card',
    last4: '1234',
  },
  
  trackingNumber: 'TRK123456789',
  
  statusHistory: [
    {
      status: 'Order Placed',
      timestamp: '2024-01-15T14:30:00Z',
      note: 'Order received and confirmed',
    },
    {
      status: 'Payment Confirmed',
      timestamp: '2024-01-15T14:32:00Z',
      note: 'Payment processed successfully',
    },
    {
      status: 'Order Confirmed',
      timestamp: '2024-01-15T14:35:00Z',
      note: 'Seller confirmed the order',
    },
    {
      status: 'Preparing',
      timestamp: '2024-01-15T15:00:00Z',
      note: 'Items are being prepared for delivery',
    },
  ],
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [order] = useState<OrderDetails>(mockOrder);
  const { user } = useAuth();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'out_for_delivery': return '#06b6d4';
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
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleContactUser = () => {
    const contactId = user?.type === 'buyer' ? order.sellerId : order.buyerId;
    if (contactId) {
      router.push(`/chat/${contactId}` as any);
    }
  };

  const handleCallUser = () => {
    const phoneNumber = user?.type === 'buyer' ? order.sellerPhone : order.buyerPhone;
    Alert.alert(
      'Call User',
      `Call ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Feature Coming Soon', 'Phone calling will be available in a future update.') },
      ]
    );
  };

  const handleCancelOrder = () => {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      Alert.alert('Cannot Cancel', 'This order cannot be cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Order Cancelled', 'Your order has been cancelled. Refund will be processed within 3-5 business days.');
          },
        },
      ]
    );
  };

  const handleReorder = () => {
    Alert.alert(
      'Reorder Items',
      'Add these items to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: () => {
            Alert.alert('Added to Cart', 'Items have been added to your cart!');
          },
        },
      ]
    );
  };

  const handleLeaveReview = () => {
    router.push(`/reviews/write/${order.sellerId}` as any);
  };

  const OrderItemComponent = ({ item }: { item: OrderItem }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => router.push(`/product/${item.productId}` as any)}
    >
      <Image source={{ uri: item.productImage }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
      </View>
      <Text style={styles.itemSubtotal}>${item.subtotal.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const StatusHistoryItem = ({ item }: { item: typeof order.statusHistory[0] }) => (
    <View style={styles.statusItem}>
      <View style={styles.statusDot} />
      <View style={styles.statusContent}>
        <Text style={styles.statusTitle}>{item.status}</Text>
        <Text style={styles.statusTime}>{formatDateTime(item.timestamp)}</Text>
        {item.note && <Text style={styles.statusNote}>{item.note}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity onPress={handleContactUser}>
          <Text style={styles.contactButtonText}>💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatDateTime(order.orderDate)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusBadgeText}>{getStatusText(order.status)}</Text>
            </View>
          </View>

          {order.estimatedDelivery && (
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>
                {order.status === 'delivered' ? 'Delivered:' : 'Estimated Delivery:'}
              </Text>
              <Text style={styles.deliveryTime}>
                {formatDateTime(order.actualDelivery || order.estimatedDelivery)}
              </Text>
            </View>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {user?.type === 'buyer' ? 'Seller Information' : 'Buyer Information'}
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactDetails}>
              <Text style={styles.contactName}>
                {user?.type === 'buyer' ? order.sellerName : order.buyerName}
              </Text>
              {order.shopName && user?.type === 'buyer' && (
                <Text style={styles.shopName}>{order.shopName}</Text>
              )}
              <Text style={styles.contactPhone}>
                {user?.type === 'buyer' ? order.sellerPhone : order.buyerPhone}
              </Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactUser}>
                <Text style={styles.contactButtonText}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton} onPress={handleCallUser}>
                <Text style={styles.contactButtonText}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <FlatList
            data={order.items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <OrderItemComponent item={item} />}
            scrollEnabled={false}
          />
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.deliveryDetails}>
            <Text style={styles.addressName}>{order.deliveryAddress.name}</Text>
            <Text style={styles.addressText}>{order.deliveryAddress.address}</Text>
            <Text style={styles.addressText}>{order.deliveryAddress.city}</Text>
            <Text style={styles.addressPhone}>{order.deliveryAddress.phone}</Text>
            
            {order.deliveryInstructions && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsLabel}>Delivery Instructions:</Text>
                <Text style={styles.instructionsText}>{order.deliveryInstructions}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Subtotal</Text>
              <Text style={styles.paymentValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Delivery Fee</Text>
              <Text style={styles.paymentValue}>${order.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Fee</Text>
              <Text style={styles.paymentValue}>${order.serviceFee.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tax</Text>
              <Text style={styles.paymentValue}>${order.tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
            </View>
            
            <View style={styles.paymentMethodContainer}>
              <Text style={styles.paymentMethodLabel}>Payment Method:</Text>
              <Text style={styles.paymentMethodText}>
                {order.paymentMethod.type} •••• {order.paymentMethod.last4}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Tracking</Text>
          {order.trackingNumber && (
            <View style={styles.trackingContainer}>
              <Text style={styles.trackingLabel}>Tracking Number:</Text>
              <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
            </View>
          )}
          
          <View style={styles.statusHistory}>
            {order.statusHistory.map((item, index) => (
              <StatusHistoryItem key={index} item={item} />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {user?.type === 'buyer' && order.status === 'delivered' && (
            <TouchableOpacity style={styles.actionButton} onPress={handleLeaveReview}>
              <Text style={styles.actionButtonText}>Leave Review</Text>
            </TouchableOpacity>
          )}
          
          {user?.type === 'buyer' && order.status === 'delivered' && (
            <TouchableOpacity style={styles.actionButton} onPress={handleReorder}>
              <Text style={styles.actionButtonText}>Reorder</Text>
            </TouchableOpacity>
          )}
          
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelOrder}>
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  contactButton: {
    // Removed fontSize, as it should be on Text, not View
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  deliveryInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 16,
    color: '#1e40af',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 20,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  deliveryDetails: {
    gap: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
  },
  addressPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  instructionsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  instructionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#374151',
  },
  paymentDetails: {
    gap: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentValue: {
    fontSize: 14,
    color: '#374151',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  paymentMethodLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  trackingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  trackingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  statusHistory: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    marginRight: 12,
    marginTop: 4,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusNote: {
    fontSize: 14,
    color: '#374151',
  },
  actionButtons: {
    margin: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ffffff',
  },
});