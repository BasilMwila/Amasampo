import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../_layout';

interface PaymentMethod {
  id: number;
  type: 'credit' | 'debit' | 'bank' | 'paypal' | 'apple_pay' | 'google_pay';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  accountName?: string;
  email?: string;
  isDefault: boolean;
  isActive: boolean;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    type: 'credit',
    brand: 'Visa',
    last4: '1234',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
    isActive: true,
  },
  {
    id: 2,
    type: 'bank',
    accountName: 'Checking Account',
    last4: '5678',
    isDefault: false,
    isActive: true,
  },
  {
    id: 3,
    type: 'paypal',
    email: 'user@example.com',
    last4: '',
    isDefault: false,
    isActive: true,
  },
];

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLencoTest, setShowLencoTest] = useState(false);
  const [testAmount, setTestAmount] = useState('10.00');
  const { user } = useAuth();
  const router = useRouter();

  const handleSetDefault = (id: number) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const handleDelete = (id: number) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault) {
      Alert.alert('Error', 'Cannot delete default payment method. Set another method as default first.');
      return;
    }

    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(methods => methods.filter(m => m.id !== id));
            Alert.alert('Success', 'Payment method removed');
          },
        },
      ]
    );
  };

  const generateLencoTestHTML = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lenco Payment Test</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8f9fa;
                  line-height: 1.6;
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
                  margin-bottom: 20px;
              }
              .sandbox-notice {
                  background-color: #fff3cd;
                  border: 1px solid #ffeaa7;
                  color: #856404;
                  padding: 12px;
                  border-radius: 8px;
                  margin-bottom: 20px;
                  font-size: 14px;
              }
              .amount {
                  font-size: 28px;
                  font-weight: bold;
                  color: #2c3e50;
                  margin: 10px 0;
              }
              .test-button {
                  width: 100%;
                  color: white;
                  border: none;
                  padding: 16px;
                  border-radius: 8px;
                  font-size: 16px;
                  font-weight: bold;
                  cursor: pointer;
                  margin: 10px 0;
                  transition: opacity 0.3s;
              }
              .test-button:hover {
                  opacity: 0.8;
              }
              .card-button {
                  background-color: #3498db;
              }
              .mobile-button {
                  background-color: #27ae60;
              }
              .test-info {
                  background-color: #e8f4fd;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 15px 0;
                  font-size: 14px;
                  color: #0c5460;
              }
              .credentials {
                  background-color: #f8f9fa;
                  padding: 15px;
                  border-radius: 8px;
                  margin-bottom: 20px;
                  font-family: monospace;
                  font-size: 12px;
                  color: #495057;
              }
              .loading {
                  text-align: center;
                  color: #6c757d;
                  margin-top: 20px;
                  display: none;
              }
          </style>
          <script src="https://pay.sandbox.lenco.co/js/v1/inline.js"></script>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>🧪 Lenco Payment Test</h2>
                  <div class="amount">$${testAmount} USD</div>
              </div>

              <div class="sandbox-notice">
                  <strong>⚠️ SANDBOX MODE</strong><br>
                  This is a test environment. No real money will be charged.
              </div>

              <div class="credentials">
                  <strong>Sandbox Credentials:</strong><br>
                  Public Key: pub-88dd921c0ecd73590459a1dd5a9343c77db0f3c344f222b9<br>
                  API Key: 993bed87f9d5925...<br>
                  Base URL: https://sandbox.lenco.co/access/v2/
              </div>

              <div class="test-info">
                  <strong>💳 Test Card Numbers:</strong><br>
                  • Success: <strong>4242424242424242</strong><br>
                  • Declined: <strong>4000000000000002</strong><br>
                  • CVC: Any 3 digits<br>
                  • Expiry: Any future date<br><br>
                  
                  <strong>📱 MTN Test Numbers:</strong><br>
                  • Success: <strong>0961111111</strong><br>
                  • Not enough funds: <strong>0962222222</strong><br>
                  • Limit exceeded: <strong>0963333333</strong><br>
                  • Unauthorized: <strong>0964444444</strong><br>
                  • Timeout: <strong>0966666666</strong><br><br>
                  
                  <strong>📱 Airtel Test Numbers:</strong><br>
                  • Success: <strong>0971111111</strong><br>
                  • Incorrect PIN: <strong>0972222222</strong><br>
                  • Invalid amount: <strong>0973333333</strong><br>
                  • Not enough funds: <strong>0975555555</strong><br>
                  • Timeout: <strong>0977777777</strong>
              </div>
              
              <button class="test-button card-button" onclick="testCardPayment()">
                  💳 Test Card Payment
              </button>
              
              <button class="test-button mobile-button" onclick="testMobileMoneyPayment()">
                  📱 Test Mobile Money
              </button>

              <div class="loading" id="loading">
                  Processing payment...
              </div>
          </div>

          <script>
              function showLoading() {
                  document.getElementById('loading').style.display = 'block';
              }

              function testCardPayment() {
                  showLoading();
                  const reference = 'TEST_CARD_' + Date.now();
                  
                  window.LencoPay.getPaid({
                      key: "pub-88dd921c0ecd73590459a1dd5a9343c77db0f3c344f222b9",
                      email: "${user?.email || 'test@amasampo.com'}",
                      reference: reference,
                      amount: ${parseFloat(testAmount)},
                      currency: "USD",
                      label: "Amasampo Test Payment - Card",
                      channels: ["card"],
                      bearer: "customer",
                      onSuccess: function(response) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'SUCCESS',
                              method: 'card',
                              data: response
                          }));
                      },
                      onClose: function() {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'CLOSE',
                              method: 'card'
                          }));
                      },
                      onError: function(error) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'ERROR',
                              method: 'card',
                              data: error
                          }));
                      }
                  });
              }

              function testMobileMoneyPayment() {
                  showLoading();
                  const reference = 'TEST_MM_' + Date.now();
                  
                  window.LencoPay.getPaid({
                      key: "pub-88dd921c0ecd73590459a1dd5a9343c77db0f3c344f222b9",
                      email: "${user?.email || 'test@amasampo.com'}",
                      reference: reference,
                      amount: ${parseFloat(testAmount)},
                      currency: "NGN", 
                      label: "Amasampo Test Payment - Mobile Money",
                      channels: ["mobile_money"],
                      bearer: "customer",
                      onSuccess: function(response) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'SUCCESS',
                              method: 'mobile_money',
                              data: response
                          }));
                      },
                      onClose: function() {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'CLOSE',
                              method: 'mobile_money'
                          }));
                      },
                      onError: function(error) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'ERROR',
                              method: 'mobile_money', 
                              data: error
                          }));
                      }
                  });
              }
          </script>
      </body>
      </html>
    `;
  };

  const handleLencoTestMessage = (message: any) => {
    try {
      const data = JSON.parse(message.nativeEvent.data);
      console.log('🧪 Lenco test result:', data);

      setShowLencoTest(false);

      switch (data.type) {
        case 'SUCCESS':
          Alert.alert(
            '✅ Payment Test Successful!',
            `Method: ${data.method}\nReference: ${data.data.reference}\n\nThis was a sandbox test. No real money was charged.`,
            [
              { text: 'Great!', onPress: () => console.log('Test completed successfully') }
            ]
          );
          break;

        case 'CLOSE':
          Alert.alert('Test Cancelled', `${data.method} payment test was cancelled.`);
          break;

        case 'ERROR':
          Alert.alert('Test Error', `Error in ${data.method} payment: ${JSON.stringify(data.data)}`);
          break;
      }
    } catch (error) {
      console.error('Error parsing Lenco test result:', error);
      setShowLencoTest(false);
      Alert.alert('Error', 'Failed to process test payment result.');
    }
  };

  const getPaymentIcon = (type: string, brand?: string) => {
    switch (type) {
      case 'credit':
      case 'debit':
        switch (brand?.toLowerCase()) {
          case 'visa': return '💳';
          case 'mastercard': return '💳';
          case 'amex': return '💳';
          default: return '💳';
        }
      case 'bank': return '🏦';
      case 'paypal': return '🅿️';
      case 'apple_pay': return '🍎';
      case 'google_pay': return '🅖';
      default: return '💳';
    }
  };

  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method.type) {
      case 'credit':
        return `${method.brand} Credit Card`;
      case 'debit':
        return `${method.brand} Debit Card`;
      case 'bank':
        return method.accountName || 'Bank Account';
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return 'Payment Method';
    }
  };

  const getPaymentDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case 'credit':
      case 'debit':
        return `•••• •••• •••• ${method.last4} • ${method.expiryMonth}/${method.expiryYear}`;
      case 'bank':
        return `•••• •••• •••• ${method.last4}`;
      case 'paypal':
        return method.email;
      case 'apple_pay':
      case 'google_pay':
        return 'Enabled';
      default:
        return `•••• ${method.last4}`;
    }
  };

  const PaymentMethodItem = ({ method }: { method: PaymentMethod }) => (
    <View style={styles.paymentMethodCard}>
      <View style={styles.paymentMethodMain}>
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodIcon}>
            {getPaymentIcon(method.type, method.brand)}
          </Text>
          <View style={styles.paymentMethodDetails}>
            <View style={styles.paymentMethodHeader}>
              <Text style={styles.paymentMethodLabel}>
                {getPaymentLabel(method)}
              </Text>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.paymentMethodNumber}>
              {getPaymentDetails(method)}
            </Text>
          </View>
        </View>

        <View style={styles.paymentMethodActions}>
          {!method.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(method.id)}
            >
              <Text style={styles.actionButtonText}>Set Default</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(method.id)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Lenco Testing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Lenco Payment Testing</Text>
          <Text style={styles.sectionSubtitle}>
            Test Lenco payment integration with sandbox credentials (no real money charged)
          </Text>
          
          <View style={styles.lencoTestCard}>
            <View style={styles.testAmountSection}>
              <Text style={styles.testLabel}>Test Amount ($USD)</Text>
              <TextInput
                style={styles.testAmountInput}
                value={testAmount}
                onChangeText={setTestAmount}
                placeholder="10.00"
                keyboardType="decimal-pad"
              />
            </View>
            
            <TouchableOpacity
              style={styles.lencoTestButton}
              onPress={() => setShowLencoTest(true)}
            >
              <Text style={styles.lencoTestButtonText}>🚀 Launch Lenco Payment Test</Text>
            </TouchableOpacity>
            
            <Text style={styles.testNote}>
              💡 This will open the Lenco payment widget in sandbox mode for testing both card and mobile money payments.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          <Text style={styles.sectionSubtitle}>
            Manage your payment options for buying and receiving payments
          </Text>
        </View>

        <FlatList
          data={paymentMethods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PaymentMethodItem method={item} />}
          scrollEnabled={false}
          style={styles.paymentMethodsList}
        />

        {user?.type === 'seller' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                💡 As a seller, customers can pay you through any of your active payment methods.
                Your default method will be used for automatic payouts.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Privacy</Text>
          <View style={styles.securityCard}>
            <Text style={styles.securityText}>
              🔒 Your payment information is encrypted and securely stored.
              We never share your financial details with other users.
            </Text>
            <TouchableOpacity style={styles.securityButton}>
              <Text style={styles.securityButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <AddPaymentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(newMethod) => {
          setPaymentMethods([...paymentMethods, { ...newMethod, id: Date.now() }]);
          setShowAddModal(false);
          Alert.alert('Success', 'Payment method added successfully');
        }}
      />

      {/* Lenco Test Modal */}
      <Modal
        visible={showLencoTest}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLencoTest(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLencoTest(false)}>
              <Text style={styles.modalCloseButton}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Lenco Payment Test</Text>
            <View style={{ width: 80 }} />
          </View>
          
          <WebView
            source={{ html: generateLencoTestHTML() }}
            style={styles.lencoWebView}
            onMessage={handleLencoTestMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            mixedContentMode="compatibility"
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (method: Omit<PaymentMethod, 'id'>) => void;
}

const AddPaymentModal = ({ visible, onClose, onAdd }: AddPaymentModalProps) => {
  const [paymentType, setPaymentType] = useState<'credit' | 'bank' | 'paypal'>('credit');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');

  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setAccountNumber('');
    setRoutingNumber('');
    setAccountName('');
    setEmail('');
  };

  const handleAdd = () => {
    let newMethod: Omit<PaymentMethod, 'id'>;

    switch (paymentType) {
      case 'credit':
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
          Alert.alert('Error', 'Please fill in all card details');
          return;
        }
        const [month, year] = expiryDate.split('/');
        newMethod = {
          type: 'credit',
          brand: 'Visa', // Would be detected from card number
          last4: cardNumber.slice(-4),
          expiryMonth: parseInt(month),
          expiryYear: parseInt('20' + year),
          isDefault: false,
          isActive: true,
        };
        break;

      case 'bank':
        if (!accountNumber || !routingNumber || !accountName) {
          Alert.alert('Error', 'Please fill in all bank details');
          return;
        }
        newMethod = {
          type: 'bank',
          accountName,
          last4: accountNumber.slice(-4),
          isDefault: false,
          isActive: true,
        };
        break;

      case 'paypal':
        if (!email) {
          Alert.alert('Error', 'Please enter your PayPal email');
          return;
        }
        newMethod = {
          type: 'paypal',
          email,
          last4: '',
          isDefault: false,
          isActive: true,
        };
        break;

      default:
        return;
    }

    onAdd(newMethod);
    resetForm();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Payment Method</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={styles.modalSaveButton}>Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.typeSelector}>
            <Text style={styles.label}>Payment Type</Text>
            <View style={styles.typeTabs}>
              {[
                { key: 'credit', label: '💳 Card' },
                { key: 'bank', label: '🏦 Bank' },
                { key: 'paypal', label: '🅿️ PayPal' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.typeTab,
                    paymentType === tab.key && styles.typeTabActive,
                  ]}
                  onPress={() => setPaymentType(tab.key as any)}
                >
                  <Text
                    style={[
                      styles.typeTabText,
                      paymentType === tab.key && styles.typeTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {paymentType === 'credit' && (
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          )}

          {paymentType === 'bank' && (
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Checking Account"
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234567890"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Routing Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="021000021"
                  value={routingNumber}
                  onChangeText={setRoutingNumber}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {paymentType === 'paypal' && (
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PayPal Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

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
  addButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  paymentMethodsList: {
    paddingHorizontal: 20,
  },
  paymentMethodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethodMain: {
    padding: 16,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  paymentMethodNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  securityCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  securityText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
    marginBottom: 12,
  },
  securityButton: {
    alignSelf: 'flex-start',
  },
  securityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  typeSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeTabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  typeTabTextActive: {
    color: '#1a1a1a',
  },
  formSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  // Lenco Testing Styles
  lencoTestCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  testAmountSection: {
    marginBottom: 16,
  },
  testLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  testAmountInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#856404',
  },
  lencoTestButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  lencoTestButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  testNote: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  lencoWebView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});