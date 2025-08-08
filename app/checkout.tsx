// app/checkout.tsx - Complete checkout screen with Lenco payment integration
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from './_layout';
import { COLORS, DEFAULT_IMAGES, ERROR_MESSAGES } from './constants/constants';
import { apiService, type CartItem } from './services/api';

interface CheckoutSummary {
  total_items: number;
  subtotal: string;
  estimated_delivery_fee: number;
  estimated_service_fee: string;
  estimated_total: string;
}

interface PaymentProvider {
  code: string;
  name: string;
  logo: string;
  country: string;
}

interface OrderData {
  id: number;
  order_number: string;
  total: string;
}

export default function CheckoutScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money');
  const [showPaymentWidget, setShowPaymentWidget] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadCheckoutData();
      loadPaymentProviders();
    }, [])
  );

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCart();
      setCartItems(response.cart_items || []);
      setSummary(response.summary || null);

      if (!response.cart_items || response.cart_items.length === 0) {
        Alert.alert(
          'Empty Cart',
          'Your cart is empty. Add items before checkout.',
          [{ text: 'OK', onPress: () => router.push('/(tabs)' as any) }]
        );
      }
    } catch (error: any) {
      console.error('Failed to load checkout data:', error);
      Alert.alert('Error', error.message || ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentProviders = async () => {
    try {
      console.log('🔄 Loading payment providers...');
      const response = await apiService.getPaymentProviders();
      console.log('📱 Payment providers response:', response);
      setProviders(response.providers || []);
      
      // Auto-select first provider
      if (response.providers && response.providers.length > 0) {
        setSelectedProvider(response.providers[0].code);
        console.log('✅ Auto-selected provider:', response.providers[0].code);
      }
    } catch (error: any) {
      console.error('❌ Failed to load payment providers:', error);
    }
  };

  const validateCheckoutForm = (): boolean => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Missing Information', 'Please enter your delivery address');
      return false;
    }

    if (paymentMethod === 'mobile_money') {
      if (!selectedProvider) {
        Alert.alert('Missing Information', 'Please select a mobile money provider');
        return false;
      }

      if (!phoneNumber.trim()) {
        Alert.alert('Missing Information', 'Please enter your mobile money phone number');
        return false;
      }

      // Basic phone validation
      const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
      if (!phoneRegex.test(phoneNumber)) {
        Alert.alert('Invalid Phone', 'Please enter a valid phone number');
        return false;
      }
    }

    return true;
  };

  const createOrder = async (): Promise<OrderData | null> => {
    try {
      console.log('Creating order...');
      
      const orderData = {
        delivery_address: deliveryAddress.trim(),
        payment_method: paymentMethod,
        phone_number: paymentMethod === 'mobile_money' ? phoneNumber.trim() : undefined,
        provider: paymentMethod === 'mobile_money' ? selectedProvider : undefined,
      };

      const response = await apiService.createOrder(orderData);
      console.log('✅ Order created:', response.data.order_number);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to create order:', error);
      throw error;
    }
  };

  const initializeMobileMoneyPayment = async (order: OrderData) => {
    try {
      console.log('🔄 Initializing mobile money payment...');
      
      const paymentData = {
        order_id: order.id,
        operator: selectedProvider,
        phone: phoneNumber.trim(),
        country: 'zm'
      };

      const response = await apiService.initializeMobileMoneyPayment(paymentData);
      console.log('✅ Mobile money payment initialized:', response.data.reference);
      
      return response;
    } catch (error: any) {
      console.error('❌ Mobile money payment initialization failed:', error);
      throw error;
    }
  };

  const generatePaymentWidgetHTML = (config: any): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lenco Payment</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8f9fa;
              }
              .container {
                  max-width: 400px;
                  margin: 0 auto;
                  background: white;
                  padding: 30px;
                  border-radius: 12px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              }
              .header {
                  text-align: center;
                  margin-bottom: 30px;
              }
              .amount {
                  font-size: 32px;
                  font-weight: bold;
                  color: #2c3e50;
              }
              .currency {
                  font-size: 18px;
                  color: #7f8c8d;
                  margin-left: 8px;
              }
              .pay-button {
                  width: 100%;
                  background-color: #3498db;
                  color: white;
                  border: none;
                  padding: 16px;
                  border-radius: 8px;
                  font-size: 18px;
                  font-weight: bold;
                  cursor: pointer;
                  margin-top: 20px;
                  transition: background-color 0.3s;
              }
              .pay-button:hover {
                  background-color: #2980b9;
              }
              .loading {
                  text-align: center;
                  color: #7f8c8d;
                  margin-top: 20px;
              }
          </style>
          <script src="https://pay.sandbox.lenco.co/js/v1/inline.js"></script>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>Complete Payment</h2>
                  <div class="amount">
                      ${config.currency === 'USD' ? '$' : config.currency === 'NGN' ? '₦' : ''}${config.amount}
                      <span class="currency">${config.currency}</span>
                  </div>
              </div>
              
              <button class="pay-button" onclick="initializePayment()">
                  Pay Now with Lenco
              </button>
              
              <div class="loading" id="loading" style="display: none;">
                  Processing payment...
              </div>
          </div>

          <script>
              function initializePayment() {
                  document.getElementById('loading').style.display = 'block';
                  
                  window.LencoPay.getPaid({
                      key: "${config.key}",
                      email: "${config.email}",
                      reference: "${config.reference}",
                      amount: ${config.amount},
                      currency: "${config.currency}",
                      label: "${config.label || 'Payment'}",
                      onSuccess: function(response) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'SUCCESS',
                              data: response
                          }));
                      },
                      onClose: function() {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'CLOSE'
                          }));
                      },
                      onError: function(error) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'ERROR',
                              data: error
                          }));
                      }
                  });
              }

              // Auto-initialize payment when page loads
              window.addEventListener('load', function() {
                  setTimeout(initializePayment, 1000);
              });
          </script>
      </body>
      </html>
    `;
  };

  const initializeCardPayment = async (order: OrderData) => {
    try {
      console.log('🔄 Initializing card payment...');
      
      const paymentData = {
        order_id: order.id,
        success_url: 'amasampo://payment-success',
        cancel_url: 'amasampo://payment-cancelled'
      };

      const response = await apiService.initializeCardPayment(paymentData);
      console.log('✅ Card payment initialized:', response.data);
      
      // Set payment config for widget
      setPaymentConfig(response.data.widget_config);
      setShowPaymentWidget(true);
      
      return response;
    } catch (error: any) {
      console.error('❌ Card payment initialization failed:', error);
      throw error;
    }
  };

  const handleSubmitOTP = async (collectionId: string) => {
    try {
      const otp = await new Promise<string>((resolve, reject) => {
        Alert.prompt(
          'Enter OTP',
          'Please enter the OTP sent to your mobile phone',
          [
            { text: 'Cancel', onPress: () => reject(new Error('OTP cancelled')), style: 'cancel' },
            { text: 'Submit', onPress: (otp) => resolve(otp || '') }
          ],
          'plain-text',
          '000000' // Pre-fill for sandbox
        );
      });

      if (!otp.trim()) {
        Alert.alert('Invalid OTP', 'Please enter a valid OTP');
        return;
      }

      console.log('🔄 Submitting OTP...');
      const response = await apiService.submitMobileMoneyOTP(collectionId, otp.trim());
      
      if (response.data.status === 'successful') {
        showPaymentSuccess();
      } else {
        Alert.alert('Payment Status', `Payment status: ${response.data.status}`);
      }
    } catch (error: any) {
      console.error('❌ OTP submission failed:', error);
      Alert.alert('OTP Error', error.message || 'Failed to submit OTP');
    }
  };

  const handlePaymentWidgetMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('💳 Payment widget message:', message);
      
      setShowPaymentWidget(false);
      setPaymentConfig(null);
      
      switch (message.type) {
        case 'SUCCESS':
          console.log('✅ Payment successful:', message.data);
          showPaymentSuccess();
          break;
          
        case 'CLOSE':
          console.log('❌ Payment cancelled by user');
          Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
          break;
          
        case 'ERROR':
          console.error('❌ Payment error:', message.data);
          Alert.alert('Payment Error', 'There was an error processing your payment. Please try again.');
          break;
      }
    } catch (error) {
      console.error('❌ Error parsing payment widget message:', error);
      setShowPaymentWidget(false);
    } finally {
      setProcessingPayment(false);
      setProcessingOrder(false);
    }
  };

  const showPaymentSuccess = () => {
    Alert.alert(
      'Payment Successful! 🎉',
      'Your order has been confirmed and the seller has been notified.',
      [
        { text: 'Continue Shopping', onPress: () => router.push('/(tabs)' as any) },
        { text: 'View Orders', onPress: () => router.push('/orders' as any) }
      ]
    );
    
    // Clear cart after successful order
    setCartItems([]);
    setSummary(null);
  };

  const handleProceedToPayment = async () => {
    if (!validateCheckoutForm()) return;
    if (!summary) return;

    setProcessingOrder(true);

    try {
      // Step 1: Create order
      const order = await createOrder();
      if (!order) throw new Error('Failed to create order');

      console.log('✅ Order created, proceeding to payment...');
      setProcessingPayment(true);

      // Step 2: Initialize payment based on method
      if (paymentMethod === 'mobile_money') {
        const paymentResponse = await initializeMobileMoneyPayment(order);
        
        // Handle different payment statuses
        switch (paymentResponse.data.status) {
          case 'otp-required':
            Alert.alert(
              'OTP Required',
              paymentResponse.data.instructions || 'An OTP has been sent to your phone.',
              [
                { 
                  text: 'Enter OTP', 
                  onPress: () => handleSubmitOTP(paymentResponse.data.collection_id)
                },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
            break;

          case 'pay-offline':
            Alert.alert(
              'Complete Payment',
              paymentResponse.data.instructions || 'Please check your phone and authorize the payment.',
              [
                { 
                  text: 'I\'ve Authorized', 
                  onPress: () => {
                    // You might want to implement polling here to check payment status
                    Alert.alert('Payment Processing', 'We\'ll notify you once payment is confirmed.');
                  }
                }
              ]
            );
            break;

          case 'successful':
            showPaymentSuccess();
            break;

          default:
            Alert.alert('Payment Status', `Payment status: ${paymentResponse.data.status}`);
        }

      } else if (paymentMethod === 'card') {
        console.log('🔄 Starting card payment flow...');
        await initializeCardPayment(order);
        // Widget will open automatically, payment processing continues in handlePaymentWidgetMessage
      }

    } catch (error: any) {
      console.error('❌ Checkout failed:', error);
      Alert.alert(
        'Checkout Failed',
        error.message || 'Failed to process your order. Please try again.'
      );
    } finally {
      setProcessingOrder(false);
      setProcessingPayment(false);
    }
  };

  const CartItemSummary = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.image_url || DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }} 
        style={styles.itemImage}
        defaultSource={{ uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }}
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>${(item.price || 0).toFixed(2)} × {item.quantity}</Text>
        <Text style={styles.itemTotal}>${((item.price || 0) * item.quantity).toFixed(2)}</Text>
      </View>
    </View>
  );

  const PaymentMethodSelector = () => {
    console.log('🔄 Rendering PaymentMethodSelector:', { 
      paymentMethod, 
      providersCount: providers.length, 
      selectedProvider 
    });
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
      
      <View style={styles.paymentMethods}>
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            paymentMethod === 'mobile_money' && styles.paymentMethodSelected
          ]}
          onPress={() => setPaymentMethod('mobile_money')}
        >
          <Text style={styles.paymentMethodIcon}>📱</Text>
          <Text style={[
            styles.paymentMethodText,
            paymentMethod === 'mobile_money' && styles.paymentMethodTextSelected
          ]}>
            Mobile Money
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            paymentMethod === 'card' && styles.paymentMethodSelected
          ]}
          onPress={() => setPaymentMethod('card')}
        >
          <Text style={styles.paymentMethodIcon}>💳</Text>
          <Text style={[
            styles.paymentMethodText,
            paymentMethod === 'card' && styles.paymentMethodTextSelected
          ]}>
            Card Payment
          </Text>
        </TouchableOpacity>
      </View>

      {paymentMethod === 'mobile_money' && (
        <>
          <Text style={styles.inputLabel}>Select Provider ({providers.length} available)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providersScroll}>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.code}
                style={[
                  styles.providerButton,
                  selectedProvider === provider.code && styles.providerButtonSelected
                ]}
                onPress={() => setSelectedProvider(provider.code)}
              >
                <Text style={styles.providerName}>{provider.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.inputLabel}>Mobile Money Phone Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Test: 0977433571 (Airtel) or 0961111111 (MTN)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!processingOrder}
          />
          <Text style={styles.testPhoneHint}>
            💡 Use test numbers: Airtel (0977433571) or MTN (0961111111) for successful sandbox payments
          </Text>
        </>
      )}
    </View>
    );
  };

  if (user?.user_type !== 'buyer') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Checkout is only available for buyers</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cartItems.map((item) => (
              <CartItemSummary key={item.product_id} item={item} />
            ))}
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full delivery address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!processingOrder}
            />
          </View>

          {/* Payment Method */}
          <PaymentMethodSelector />
        </ScrollView>

        {/* Order Total & Checkout Button */}
        {summary && (
          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal ({summary.total_items} items)</Text>
                <Text style={styles.totalValue}>${summary.subtotal}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery Fee</Text>
                <Text style={styles.totalValue}>${summary.estimated_delivery_fee.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Service Fee</Text>
                <Text style={styles.totalValue}>${summary.estimated_service_fee}</Text>
              </View>
              <View style={[styles.totalRow, styles.finalTotalRow]}>
                <Text style={styles.finalTotalLabel}>Total</Text>
                <Text style={styles.finalTotalAmount}>${summary.estimated_total}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutButton,
                (processingOrder || processingPayment) && styles.checkoutButtonDisabled
              ]}
              onPress={handleProceedToPayment}
              disabled={processingOrder || processingPayment}
            >
              {processingOrder || processingPayment ? (
                <View style={styles.checkoutButtonLoading}>
                  <ActivityIndicator size="small" color={COLORS.CARD} />
                  <Text style={styles.checkoutButtonText}>
                    {processingOrder ? 'Creating Order...' : 'Processing Payment...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.checkoutButtonText}>
                  Place Order - ${summary.estimated_total}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Payment Widget Modal */}
      <Modal
        visible={showPaymentWidget}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowPaymentWidget(false);
          setPaymentConfig(null);
          setProcessingPayment(false);
          setProcessingOrder(false);
        }}
      >
        <SafeAreaView style={styles.paymentModalContainer}>
          <View style={styles.paymentModalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowPaymentWidget(false);
                setPaymentConfig(null);
                setProcessingPayment(false);
                setProcessingOrder(false);
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.paymentModalTitle}>Secure Payment</Text>
            <View style={styles.closeButton} />
          </View>
          
          {paymentConfig && (
            <WebView
              source={{ html: generatePaymentWidgetHTML(paymentConfig) }}
              style={styles.paymentWebView}
              onMessage={handlePaymentWidgetMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              mixedContentMode="compatibility"
              onError={(error) => {
                console.error('❌ WebView error:', error);
                Alert.alert('Error', 'Failed to load payment interface.');
                setShowPaymentWidget(false);
              }}
              renderLoading={() => (
                <View style={styles.paymentLoadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                  <Text style={styles.paymentLoadingText}>Loading secure payment...</Text>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.CARD,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: COLORS.BORDER,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  textInput: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  paymentMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.CARD,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
  },
  paymentMethodSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: `${COLORS.PRIMARY}10`,
  },
  paymentMethodIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  paymentMethodTextSelected: {
    color: COLORS.PRIMARY,
  },
  providersScroll: {
    marginBottom: 16,
  },
  providerButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginRight: 12,
  },
  providerButtonSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: `${COLORS.PRIMARY}10`,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  footer: {
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  totalSection: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 8,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  finalTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  checkoutButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.CARD,
  },
  // Payment Modal Styles
  paymentModalContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  paymentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  paymentModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    width: 80,
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  paymentWebView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  paymentLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  paymentLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  testPhoneHint: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
    fontStyle: 'italic',
  },
});