import apiService from "./api";

export class PaymentService {
  static async initializeCardPayment(orderId: number, successUrl?: string, cancelUrl?: string) {
    try {
      console.log('🔄 Initializing Lenco card payment for order:', orderId);
      
      const response = await apiService.request('/payment/initialize/card', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      }) as { data: any };

      console.log('✅ Lenco card payment initialized:', response.data.payment_reference);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ Lenco card payment initialization failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async initializeMobileMoneyPayment(
    orderId: number,
    operator: string,
    phone: string,
    country: string = 'ng'
  ) {
    try {
      console.log('🔄 Initializing Lenco mobile money payment:', { orderId, operator, phone });
      
      const response = await apiService.request('/payment/initialize/mobile-money', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          operator,
          phone,
          country,
        }),
      }) as { data: any };

      console.log('✅ Lenco mobile money payment initialized:', response.data.reference);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ Lenco mobile money payment initialization failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async submitMobileMoneyOTP(collectionId: string, otp: string) {
    try {
      console.log('🔄 Submitting mobile money OTP:', collectionId);
      
      const response = await apiService.request('/payment/mobile-money/submit-otp', {
        method: 'POST',
        body: JSON.stringify({
          collection_id: collectionId,
          otp,
        }),
      }) as { data: any };

      console.log('✅ Mobile money OTP submitted:', response.data.status);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ Mobile money OTP submission failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async verifyPayment(reference: string) {
    try {
      console.log('🔄 Verifying payment:', reference);
      
      const response = await apiService.request(`/payment/verify/${reference}`) as { data: any };
      
      console.log('✅ Payment verification completed:', response.data.status);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ Payment verification failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async getPaymentStatus(orderId: number) {
    try {
      const response = await apiService.request(`/payment/status/${orderId}`) as { payment: any };
      return {
        success: true,
        payment: response.payment,
      };
    } catch (error: any) {
      console.error('❌ Get payment status failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
