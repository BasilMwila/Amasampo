/* eslint-disable @typescript-eslint/no-unused-vars */
// File: app/checkout/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../_layout';

interface OrderItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  sellerId: number;
  sellerName: string;
}

interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  brand?: string;
  isDefault: boolean;
}

interface DeliveryAddress {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

const mockOrderItems: OrderItem[] = [
  {
    id: 1,
    productId: 1,
    name: 'Organic Apples',
    price: 2.99,
    quantity: 3,
    sellerId: 1,
    sellerName: 'John Smith',
  },
  {
    id: 2,
    productId: 2,
    name: 'Fresh Bread',
    price: 3.50,
    quantity: 2,
    sellerId: 2,
    sellerName: 'Mary Johnson',
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  { id: 1, type: 'credit', brand: 'Visa', last4: '1234', isDefault: true },
  { id: 2, type: 'bank', last4: '5678', isDefault: false },
];

const mockAddresses: DeliveryAddress[] = [
  {
    id: 1,
    name: 'Home',
    address: '123 Main Street, Apt 4B',
    city: 'Downtown',
    phone: '+1234567890',
    isDefault: true,
  },
  {
    id: 2,
    name: 'Work',
    address: '456 Business Ave',
    city: 'Business District',
    phone: '+1234567890',
    isDefault: false,
  },
];

export default function CheckoutScreen() {
  const [orderItems] = useState<OrderItem[]>(mockOrderItems);
  const [paymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [addresses] = useState<DeliveryAddress[]>(mockAddresses);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(
    mockPaymentMethods.find(pm => pm.isDefault) || null
  );
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(
    mockAddresses.find(addr => addr.isDefault) || null
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const getSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    return 2.50; // Fixed delivery fee
  };

  const getServiceFee = () => {
    return getSubtotal() * 0.03; // 3% service fee
  };

  const getTotalAmount = () => {
    return getSubtotal() + getDeliveryFee() + getServiceFee();
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Payment Required', 'Please select a payment method');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const order = {
        id: Date.now(),
        items: orderItems,
        subtotal: getSubtotal(),
        deliveryFee: getDeliveryFee(),
        serviceFee: getServiceFee(),
        total: getTotalAmount(),
        paymentMethod: selectedPaymentMethod,
        deliveryAddress: selectedAddress,
        deliveryInstructions,
        status: 'confirmed',
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      console.log('Order placed:', order);
      
      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Your order #${order.id} has been confirmed and will be delivered within 24 hours.`,
        [
          {
            text: 'View Orders',
            onPress: () => router.replace('/orders' as any),
          },
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const OrderItemComponent = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.sellerName}>by {item.sellerName}</Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  const PaymentMethodComponent = ({ method }: { method: PaymentMethod }) => (
    <TouchableOpacity
      style={[
        styles.paymentMethod,
        selectedPaymentMethod?.id === method.id && styles.selectedPaymentMethod,
      ]}
      onPress={() => setSelectedPaymentMethod(method)}
    >
      <View style={styles.paymentMethodInfo}>
        <Text style={styles.paymentMethodIcon}>
          {method.type === 'credit' ? '💳' : '🏦'}
        </Text>
        <View style={styles.paymentMethodDetails}>
          <Text style={styles.paymentMethodText}>
            {method.brand ? `${method.brand} ` : ''}
            {method.type === 'credit' ? 'Credit Card' : 'Bank Account'}
          </Text>
          <Text style={styles.paymentMethodNumber}>•••• {method.last4}</Text>
        </View>
      </View>
      <View style={[
        styles.radioButton,
        selectedPaymentMethod?.id === method.id && styles.radioButtonSelected,
      ]} />
    </TouchableOpacity>
  );

  const AddressComponent = ({ address }: { address: DeliveryAddress }) => (
    <TouchableOpacity
      style={[
        styles.address,
        selectedAddress?.id === address.id && styles.selectedAddress,
      ]}
      onPress={() => setSelectedAddress(address)}
    >
      <View style={styles.addressInfo}>
        <Text style={styles.addressName}>{address.name}</Text>
        <Text style={styles.addressText}>{address.address}</Text>
        <Text style={styles.addressCity}>{address.city}</Text>
        <Text style={styles.addressPhone}>{address.phone}</Text>
      </View>
      <View style={[
        styles.radioButton,
        selectedAddress?.id === address.id && styles.radioButtonSelected,
      ]} />
    </TouchableOpacity>
  );

  if (user?.type !== 'buyer') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Checkout is only available for buyers</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <FlatList
            data={orderItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <OrderItemComponent item={item} />}
            scrollEnabled={false}
          />
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.map((address) => (
            <AddressComponent key={address.id} address={address} />
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions (Optional)</Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Add special delivery instructions..."
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <PaymentMethodComponent key={method.id} method={method} />
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>${getSubtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>${getDeliveryFee().toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Fee</Text>
              <Text style={styles.priceValue}>${getServiceFee().toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${getTotalAmount().toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerTotalLabel}>Total: ${getTotalAmount().toFixed(2)}</Text>
          <Text style={styles.estimatedDelivery}>Estimated delivery: 24 hours</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.placeOrderButtonText}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  address: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedAddress: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 12,
    color: '#6b7280',
  },
  paymentMethod: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPaymentMethod: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  paymentMethodNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginLeft: 12,
  },
  radioButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 16,
    color: '#374151',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
  },
  totalContainer: {
    marginBottom: 16,
  },
  footerTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  estimatedDelivery: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  placeOrderButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    textAlign: 'center',
  },
});