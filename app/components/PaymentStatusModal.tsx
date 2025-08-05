import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PaymentService } from '../services/paymentService';

interface PaymentStatusModalProps {
  visible: boolean;
  paymentReference?: string;
  orderId?: number;
  paymentData?: any; // Data from mobile money initialization
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  visible,
  paymentReference,
  orderId,
  paymentData,
  onClose,
  onSuccess,
  onError,
}) => {
  const [status, setStatus] = useState<'checking' | 'otp-required' | 'pay-offline' | 'success' | 'failed' | 'pending'>('checking');
  const [currentPaymentData, setCurrentPaymentData] = useState<any>(paymentData);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [otp, setOtp] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const maxAttempts = 15; // Increased for mobile money which can take longer

  useEffect(() => {
    if (visible && (paymentReference || orderId)) {
      // Set initial status based on payment data
      if (paymentData?.status) {
        setStatus(paymentData.status);
        setCurrentPaymentData(paymentData);
        
        if (paymentData.status === 'otp-required' || paymentData.status === 'pay-offline') {
          // Start checking after a brief delay for mobile money
          setTimeout(() => {
            checkPaymentStatus();
          }, 3000);
        } else {
          checkPaymentStatus();
        }
      } else {
        checkPaymentStatus();
      }
    }
  }, [visible, paymentReference, orderId, paymentData]);

  const checkPaymentStatus = async () => {
    try {
      setCheckAttempts(prev => prev + 1);

      let result;
      if (paymentReference) {
        result = await PaymentService.verifyPayment(paymentReference);
      } else if (orderId) {
        result = await PaymentService.getPaymentStatus(orderId);
      }

      if (result?.success) {
        const data = 'data' in result && result.data !== undefined
          ? result.data
          : ('payment' in result ? result.payment : undefined);
        setCurrentPaymentData(data);

        if (data.status === 'successful') {
          setStatus('success');
          onSuccess(data);
        } else if (data.status === 'failed') {
          setStatus('failed');
          onError('Payment failed. Please try again.');
        } else if (data.status === 'otp-required') {
          setStatus('otp-required');
        } else if (data.status === 'pay-offline') {
          setStatus('pay-offline');
          // Continue checking for pay-offline status
          if (checkAttempts < maxAttempts) {
            setTimeout(() => {
              checkPaymentStatus();
            }, 5000); // Check every 5 seconds for mobile money
          } else {
            setStatus('failed');
            onError('Payment authorization timeout. Please try again.');
          }
        } else if (data.status === 'pending' && checkAttempts < maxAttempts) {
          setStatus('pending');
          setTimeout(() => {
            checkPaymentStatus();
          }, 3000);
        } else {
          setStatus('failed');
          onError('Payment verification timeout. Please contact support.');
        }
      } else {
        if (checkAttempts < maxAttempts) {
          setTimeout(() => {
            checkPaymentStatus();
          }, 3000);
        } else {
          setStatus('failed');
          onError(result?.error || 'Payment verification failed');
        }
      }
    } catch (error: any) {
      console.error('Payment status check error:', error);
      if (checkAttempts < maxAttempts) {
        setTimeout(() => {
          checkPaymentStatus();
        }, 3000);
      } else {
        setStatus('failed');
        onError('Payment verification failed');
      }
    }
  };

  const handleSubmitOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }

    try {
      setSubmittingOtp(true);
      
      const result = await PaymentService.submitMobileMoneyOTP(
        currentPaymentData?.collection_id || '',
        otp
      );

      if (result.success) {
        setOtp('');
        setStatus(result.data.status);
        
        // Continue checking payment status
        setTimeout(() => {
          checkPaymentStatus();
        }, 2000);
      } else {
        Alert.alert('Error', result.error || 'OTP submission failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit OTP');
    } finally {
      setSubmittingOtp(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      case 'otp-required':
        return '🔐';
      case 'pay-offline':
        return '📱';
      case 'pending':
        return '⏳';
      default:
        return '🔄';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return 'Verifying your payment...';
      case 'success':
        return 'Payment successful!';
      case 'failed':
        return 'Payment failed';
      case 'otp-required':
        return 'Enter OTP sent to your phone';
      case 'pay-offline':
        return `Complete payment on your ${currentPaymentData?.operator || 'mobile'} phone`;
      case 'pending':
        return 'Payment is being processed...';
      default:
        return 'Checking payment status...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'otp-required':
        return 'An OTP has been sent to your mobile money account. Please enter it below.';
      case 'pay-offline':
        return currentPaymentData?.instructions || 'Please check your phone for a payment prompt and authorize the transaction.';
      case 'pending':
        return 'Please wait while we confirm your payment. This may take a few moments.';
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>{getStatusIcon()}</Text>
            {(status === 'checking' || status === 'pending') && (
              <ActivityIndicator 
                size="large" 
                color="#3b82f6" 
                style={styles.spinner} 
              />
            )}
          </View>

          <Text style={styles.statusTitle}>{getStatusMessage()}</Text>

          {getStatusDescription() && (
            <Text style={styles.statusDescription}>
              {getStatusDescription()}
            </Text>
          )}

          {/* OTP Input */}
          {status === 'otp-required' && (
            <View style={styles.otpContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
              <TouchableOpacity
                style={[
                  styles.otpButton,
                  submittingOtp && styles.otpButtonDisabled
                ]}
                onPress={handleSubmitOtp}
                disabled={submittingOtp}
              >
                {submittingOtp ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.otpButtonText}>Submit OTP</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.otpHint}>
                Use 000000 for testing in sandbox environment
              </Text>
            </View>
          )}

          {/* Payment Details */}
          {status === 'success' && currentPaymentData && (
            <View style={styles.paymentDetails}>
              <Text style={styles.detailText}>
                Amount: ₦{currentPaymentData.amount?.toLocaleString()}
              </Text>
              <Text style={styles.detailText}>
                Reference: {currentPaymentData.reference}
              </Text>
              {currentPaymentData.lenco_reference && (
                <Text style={styles.detailText}>
                  Lenco Ref: {currentPaymentData.lenco_reference}
                </Text>
              )}
              <Text style={styles.detailText}>
                Method: {currentPaymentData.type || currentPaymentData.payment_method}
              </Text>
              {currentPaymentData.mobile_money_details?.operator && (
                <Text style={styles.detailText}>
                  Operator: {currentPaymentData.mobile_money_details.operator}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          {(status === 'success' || status === 'failed') && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>
                {status === 'success' ? 'Continue' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Progress Indicator */}
          {(status === 'pending' || status === 'pay-offline') && (
            <View style={styles.progressContainer}>
              <Text style={styles.attemptText}>
                Checking... {checkAttempts} of {maxAttempts}
              </Text>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  onClose();
                  onError('Payment cancelled by user');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Enhanced styles for all components
const styles = StyleSheet.create({
  // PaymentMethodSelector styles
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
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  spacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  totalContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  methodSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  methodOption: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedMethod: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodIconText: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  radioButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  operatorSection: {
    marginBottom: 20,
  },
  operatorItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedOperator: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  operatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  operatorIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  operatorName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  phoneSection: {
    marginTop: 16,
  },
  phoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  phoneInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  phoneHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // PaymentStatusModal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    margin: 20,
    alignItems: 'center',
    minWidth: 320,
    maxWidth: 400,
  },
  statusIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIconText: {
    fontSize: 48,
    marginBottom: 10,
  },
  spinner: {
    marginTop: 10,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  otpContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    width: 150,
    marginBottom: 12,
  },
  otpButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  otpButtonDisabled: {
    opacity: 0.6,
  },
  otpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  otpHint: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  paymentDetails: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  attemptText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
});