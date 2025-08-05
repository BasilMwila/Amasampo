import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiService } from '../services/api';

interface Operator {
  code: string;
  name: string;
  country: string;
  logo_url: string;
}

interface PaymentMethodSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectMethod: (method: string, data?: any) => void;
  orderTotal: number;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  visible,
  onClose,
  onSelectMethod,
  orderTotal,
}) => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'mobile_money' | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadOperators();
    }
  }, [visible]);

  const loadOperators = async () => {
    try {
      const response = await apiService.request('/payment/providers');
      const typedResponse = response as { providers?: Operator[] };
      setOperators(typedResponse.providers || []);
    } catch (error) {
      console.error('Failed to load operators:', error);
      // Use fallback operators
      setOperators([
        { code: 'mtn', name: 'MTN', country: 'ng', logo_url: 'mtn-logo.png' },
        { code: 'airtel', name: 'Airtel', country: 'ng', logo_url: 'airtel-logo.png' },
        { code: 'glo', name: 'Glo', country: 'ng', logo_url: 'glo-logo.png' },
        { code: '9mobile', name: '9mobile', country: 'ng', logo_url: '9mobile-logo.png' },
      ]);
    }
  };
  
  // Add styles definition below the component
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    cancelButton: {
      color: '#888',
      fontSize: 16,
      padding: 8,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 18,
    },
    spacer: {
      width: 60,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    totalContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    totalLabel: {
      fontSize: 16,
      color: '#888',
    },
    totalAmount: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#222',
      marginTop: 4,
    },
    methodSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#222',
    },
    methodOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#eee',
      marginBottom: 12,
      backgroundColor: '#fafafa',
    },
    selectedMethod: {
      borderColor: '#007bff',
      backgroundColor: '#e6f0ff',
    },
    methodIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#eee',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    methodIconText: {
      fontSize: 20,
    },
    methodInfo: {
      flex: 1,
    },
    methodTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#222',
    },
    methodDescription: {
      fontSize: 13,
      color: '#888',
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#ccc',
      marginLeft: 12,
      backgroundColor: '#fff',
    },
    radioButtonSelected: {
      borderColor: '#007bff',
      backgroundColor: '#007bff',
    },
    operatorSection: {
      marginTop: 16,
      marginBottom: 24,
    },
    operatorItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#eee',
      marginBottom: 10,
      backgroundColor: '#fafafa',
    },
    selectedOperator: {
      borderColor: '#007bff',
      backgroundColor: '#e6f0ff',
    },
    operatorIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#eee',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    operatorIconText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#007bff',
    },
    operatorName: {
      flex: 1,
      fontSize: 15,
      color: '#222',
    },
    phoneSection: {
      marginTop: 16,
    },
    phoneLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 6,
      color: '#222',
    },
    phoneInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      backgroundColor: '#fff',
      marginBottom: 6,
    },
    phoneHint: {
      fontSize: 12,
      color: '#888',
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      backgroundColor: '#fff',
    },
    payButton: {
      backgroundColor: '#007bff',
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    payButtonDisabled: {
      backgroundColor: '#ccc',
    },
    payButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  const handleCardPayment = () => {
    onSelectMethod('card');
    onClose();
  };

  const handleMobileMoneyPayment = () => {
    if (!selectedOperator) {
      Alert.alert('Error', 'Please select a mobile money operator');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    onSelectMethod('mobile_money', {
      operator: selectedOperator,
      phone: phoneNumber,
      country: 'ng'
    });
    onClose();
  };

  const OperatorItem = ({ operator }: { operator: Operator }) => (
    <TouchableOpacity
      style={[
        styles.operatorItem,
        selectedOperator === operator.code && styles.selectedOperator,
      ]}
      onPress={() => setSelectedOperator(operator.code)}
    >
      <View style={styles.operatorIcon}>
        <Text style={styles.operatorIconText}>
          {operator.name.charAt(0)}
        </Text>
      </View>
      <Text style={styles.operatorName}>{operator.name}</Text>
      <View style={[
        styles.radioButton,
        selectedOperator === operator.code && styles.radioButtonSelected,
      ]} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Payment Method</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₦{orderTotal.toLocaleString()}</Text>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.methodSection}>
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
            
            {/* Card Payment Option */}
            <TouchableOpacity
              style={[
                styles.methodOption,
                selectedMethod === 'card' && styles.selectedMethod,
              ]}
              onPress={() => setSelectedMethod('card')}
            >
              <View style={styles.methodIcon}>
                <Text style={styles.methodIconText}>💳</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Debit/Credit Card</Text>
                <Text style={styles.methodDescription}>Pay with Visa, Mastercard, Verve</Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedMethod === 'card' && styles.radioButtonSelected,
              ]} />
            </TouchableOpacity>

            {/* Mobile Money Option */}
            <TouchableOpacity
              style={[
                styles.methodOption,
                selectedMethod === 'mobile_money' && styles.selectedMethod,
              ]}
              onPress={() => setSelectedMethod('mobile_money')}
            >
              <View style={styles.methodIcon}>
                <Text style={styles.methodIconText}>📱</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Mobile Money</Text>
                <Text style={styles.methodDescription}>Pay with MTN, Airtel, Glo, 9mobile</Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedMethod === 'mobile_money' && styles.radioButtonSelected,
              ]} />
            </TouchableOpacity>
          </View>

          {/* Mobile Money Operator Selection */}
          {selectedMethod === 'mobile_money' && (
            <View style={styles.operatorSection}>
              <Text style={styles.sectionTitle}>Select Operator</Text>
              <FlatList
                data={operators}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => <OperatorItem operator={item} />}
                scrollEnabled={false}
              />

              <View style={styles.phoneSection}>
                <Text style={styles.phoneLabel}>Phone Number</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="080XXXXXXXX"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
                <Text style={styles.phoneHint}>
                  Enter your {operators.find(op => op.code === selectedOperator)?.name || 'mobile money'} phone number
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {selectedMethod === 'card' && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={handleCardPayment}
            >
              <Text style={styles.payButtonText}>Pay with Card</Text>
            </TouchableOpacity>
          )}

          {selectedMethod === 'mobile_money' && (
            <TouchableOpacity
              style={[
                styles.payButton,
                (!selectedOperator || !phoneNumber) && styles.payButtonDisabled,
              ]}
              onPress={handleMobileMoneyPayment}
              disabled={!selectedOperator || !phoneNumber}
            >
              <Text style={styles.payButtonText}>Pay with Mobile Money</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};