/* eslint-disable @typescript-eslint/no-unused-vars */
// app/services/api.ts - Complete updated API service with proper logout handling
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL - Update this to your actual backend URL
const API_BASE_URL = 'http://192.168.1.184:3000/api'; // Update this to your backend URL

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

interface User {
  id: number;
  uuid?: string;
  name: string;
  email: string;
  phone?: string;
  user_type: 'buyer' | 'seller';
  shop_name?: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at?: string;
  last_login?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  quantity: number;
  category_id: number;
  category_name?: string;
  seller_id: number;
  seller_name?: string;
  shop_name?: string;
  image_url?: string;
  images?: string[];
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  is_active?: boolean;
  is_on_sale?: boolean;
  distance?: number;
  view_count?: number;
  created_at?: string;
}

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  seller_name?: string;
  shop_name?: string;
  available_quantity: number;
  subtotal?: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  subtotal?: number;
  delivery_fee?: number;
  service_fee?: number;
  tax?: number;
  created_at: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  items: any[];
  buyer_name?: string;
  seller_name?: string;
  shop_name?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: string;
}

class ApiService {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth token
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Helper method to get refresh token
  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Helper method to clear all tokens and user data
  private async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user']);
      console.log('🗑️ All auth data cleared from storage');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Helper method to store tokens
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['auth_token', tokens.access_token],
        ['refresh_token', tokens.refresh_token],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  // Helper method to make HTTP requests with automatic token refresh
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
    timeoutMs = 10000
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        // Handle specific token-related errors
        if (response.status === 401 && retry) {
          const errorCode = data.code;
          
          if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_REVOKED' || errorCode === 'INVALID_TOKEN') {
            console.log('🔄 Token expired/invalid, attempting refresh...');
            
            try {
              await this.refreshToken();
              // Retry the original request with new token
              return this.request<T>(endpoint, options, false, timeoutMs);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              await this.clearAllData();
              throw new Error('Session expired. Please log in again.');
            }
          }
        }

        // Handle other HTTP errors
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        (error as any).code = data.code;
        (error as any).status = response.status;
        throw error;
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      console.error(`API request failed [${endpoint}]:`, error.message);
      throw error;
    }
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.request<{ user: User; tokens: AuthTokens }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store tokens and user data
    if (response.tokens?.access_token) {
      await this.storeTokens(response.tokens);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      console.log('✅ Login tokens stored');
    }

    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    user_type: 'buyer' | 'seller';
    shop_name?: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.request<{ user: User; tokens: AuthTokens }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens and user data
    if (response.tokens?.access_token) {
      await this.storeTokens(response.tokens);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      console.log('✅ Registration tokens stored');
    }

    return response;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getAuthToken();
      const refreshToken = await this.getRefreshToken();
      
      console.log('🔄 Calling logout API...');
      
      // Call logout endpoint with both tokens - don't use this.request to avoid retry logic
      const url = `${this.baseURL}/auth/logout`;
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Short timeout for logout
      
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            refresh_token: refreshToken
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log('✅ Logout API call successful');
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Logout request timed out');
        }
        throw fetchError;
      }
      
    } catch (error: any) {
      // Log error but don't throw - we still want to clear local data
      console.warn('⚠️ Logout API call failed (continuing with local cleanup):', error.message);
    } finally {
      // Always clear local data regardless of API response
      await this.clearAllData();
      console.log('✅ Local logout cleanup completed');
    }
  }

  async refreshToken(): Promise<{ tokens: AuthTokens }> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    
    this.refreshPromise = (async () => {
      try {
        const refreshToken = await this.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('🔄 Refreshing tokens...');

        // Don't use this.request to avoid infinite loops
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            // Refresh token is invalid/expired, clear all data
            await this.clearAllData();
            throw new Error('Refresh token expired. Please log in again.');
          }
          throw new Error(data.error || 'Token refresh failed');
        }

        // Store new tokens
        if (data.tokens?.access_token) {
          await this.storeTokens(data.tokens);
          console.log('✅ Tokens refreshed successfully');
        }

        return data;
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Token refresh timed out. Please try again.');
        }
        throw fetchError;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Product APIs
  async getProducts(filters: {
    search?: string;
    category_id?: number;
    seller_id?: number;
    is_featured?: boolean;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ products: Product[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ products: Product[]; pagination?: any }>(endpoint);
  }

  async getFeaturedProducts(limit?: number): Promise<{ products: Product[] }> {
    const endpoint = `/products/featured${limit ? `?limit=${limit}` : ''}`;
    return this.request<{ products: Product[] }>(endpoint);
  }

  async getProduct(id: number): Promise<{ product: Product; recent_reviews?: any[] }> {
    return this.request<{ product: Product; recent_reviews?: any[] }>(`/products/${id}`);
  }

  async createProduct(productData: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    category_id: number;
    image_url?: string;
    images?: string[];
    is_featured?: boolean;
    is_on_sale?: boolean;
    original_price?: number;
  }): Promise<{ product: Product }> {
    return this.request<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<{ product: Product }> {
    return this.request<{ product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${id}`, { method: 'DELETE' });
  }

  async toggleProductFeatured(id: number): Promise<{ message: string; is_featured: boolean }> {
    return this.request<{ message: string; is_featured: boolean }>(`/products/${id}/toggle-featured`, {
      method: 'POST',
    });
  }

  // Cart APIs
  async getCart(): Promise<{ cart_items: CartItem[]; summary: any }> {
    return this.request<{ cart_items: CartItem[]; summary: any }>('/cart');
  }

  async addToCart(productId: number, quantity: number): Promise<{ cart_item: CartItem; message: string }> {
    return this.request<{ cart_item: CartItem; message: string }>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(productId: number, quantity: number): Promise<{ cart_item: CartItem; message: string }> {
    return this.request<{ cart_item: CartItem; message: string }>(`/cart/update/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cart/remove/${productId}`, { method: 'DELETE' });
  }

  async clearCart(): Promise<{ message: string; removed_items: number }> {
    return this.request<{ message: string; removed_items: number }>('/cart/clear', { method: 'DELETE' });
  }

  async getCartCount(): Promise<{ total_items: number }> {
    return this.request<{ total_items: number }>('/cart/count');
  }

  async validateCart(): Promise<{ validation_result: any }> {
    return this.request<{ validation_result: any }>('/cart/validate', { method: 'POST' });
  }

  // Order APIs
  async getOrders(filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ orders: Order[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ orders: Order[]; pagination: any }>(endpoint);
  }

  async getOrder(id: number): Promise<{ order: Order }> {
    return this.request<{ order: Order }>(`/orders/${id}`);
  }

  async createOrder(orderData: {
    items: { product_id: number; quantity: number }[];
    delivery_address: any;
    payment_method: any;
  }): Promise<{ order: Order; message: string }> {
    return this.request<{ order: Order; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id: number, status: string, note?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  }

  async cancelOrder(id: number, reason?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Categories APIs
  async getCategories(): Promise<{ categories: any[] }> {
    return this.request<{ categories: any[] }>('/categories');
  }

  async getCategoryTree(): Promise<{ categories: any[] }> {
    return this.request<{ categories: any[] }>('/categories/tree/all');
  }

  // Messages APIs
  async getConversations(): Promise<{ conversations: any[] }> {
    return this.request<{ conversations: any[] }>('/messages/conversations');
  }

  async getConversation(userId: number, page: number = 1, limit: number = 50): Promise<{ messages: any[]; other_user: any; pagination: any }> {
    return this.request<{ messages: any[]; other_user: any; pagination: any }>(`/messages/conversation/${userId}?page=${page}&limit=${limit}`);
  }

  async sendMessage(recipientId: number, messageText: string, messageType: string = 'text'): Promise<{ data: any; message: string }> {
    return this.request<{ data: any; message: string }>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ 
        recipient_id: recipientId, 
        message_text: messageText,
        message_type: messageType 
      }),
    });
  }

  async markMessagesRead(senderId: number): Promise<{ message: string; updated_count: number }> {
    return this.request<{ message: string; updated_count: number }>(`/messages/conversation/${senderId}/read`, {
      method: 'PUT',
    });
  }

  async getUnreadMessageCount(): Promise<{ unread_count: number }> {
    return this.request<{ unread_count: number }>('/messages/unread-count');
  }

  // Notifications APIs
  async getNotifications(filters: {
    type?: string;
    unread_only?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ notifications: any[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ notifications: any[]; pagination: any }>(endpoint);
  }

  async getUnreadNotificationCount(): Promise<{ unread_count: number }> {
    return this.request<{ unread_count: number }>('/notifications/unread-count');
  }

  async markNotificationRead(id: number): Promise<{ message: string; notification: any }> {
    return this.request<{ message: string; notification: any }>(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead(): Promise<{ message: string; updated_count: number }> {
    return this.request<{ message: string; updated_count: number }>('/notifications/mark-all-read', { method: 'PUT' });
  }

  async deleteNotification(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/${id}`, { method: 'DELETE' });
  }

  async getNotificationStats(): Promise<{ stats: any }> {
    return this.request<{ stats: any }>('/notifications/stats');
  }

  // User Profile APIs
  async getUserProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getDashboard(): Promise<{ dashboard: any }> {
    return this.request<{ dashboard: any }>('/users/dashboard');
  }

  async getSellers(filters: {
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ sellers: any[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/users/sellers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ sellers: any[]; pagination: any }>(endpoint);
  }

  async getSellerDetails(id: number): Promise<{ seller: any; recent_products: Product[] }> {
    return this.request<{ seller: any; recent_products: Product[] }>(`/users/seller/${id}`);
  }

  // Addresses APIs
  async getAddresses(): Promise<{ addresses: any[] }> {
    return this.request<{ addresses: any[] }>('/addresses');
  }

  async getDefaultAddress(): Promise<{ address: any }> {
    return this.request<{ address: any }>('/addresses/default');
  }

  async createAddress(addressData: any): Promise<{ address: any; message: string }> {
    return this.request<{ address: any; message: string }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id: number, addressData: any): Promise<{ address: any; message: string }> {
    return this.request<{ address: any; message: string }>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/addresses/${id}`, { method: 'DELETE' });
  }

  async setDefaultAddress(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/addresses/${id}/set-default`, { method: 'POST' });
  }

  // Reviews APIs
  async getProductReviews(productId: number, filters: {
    rating?: number;
    sort_by?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ reviews: any[]; rating_summary: any; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/reviews/product/${productId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ reviews: any[]; rating_summary: any; pagination: any }>(endpoint);
  }

  async createReview(reviewData: {
    product_id: number;
    rating: number;
    title: string;
    comment: string;
    order_id?: number;
  }): Promise<{ review: any; message: string }> {
    return this.request<{ review: any; message: string }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(id: number, reviewData: {
    rating?: number;
    title?: string;
    comment?: string;
  }): Promise<{ review: any; message: string }> {
    return this.request<{ review: any; message: string }>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/reviews/${id}`, { method: 'DELETE' });
  }

  async getMyReviews(page: number = 1, limit: number = 10): Promise<{ reviews: any[]; pagination: any }> {
    return this.request<{ reviews: any[]; pagination: any }>(`/reviews/my-reviews?page=${page}&limit=${limit}`);
  }

  async canReviewProduct(productId: number): Promise<{ can_review: boolean; reason?: string }> {
    return this.request<{ can_review: boolean; reason?: string }>(`/reviews/can-review/${productId}`);
  }

  // File Upload APIs
  async uploadProductImage(imageFile: any): Promise<{ image_url: string; filename: string; message: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseURL}/upload/product-image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }

  async uploadAvatar(imageFile: any): Promise<{ avatar_url: string; filename: string; message: string }> {
    const formData = new FormData();
    formData.append('avatar', imageFile);

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseURL}/upload/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }

  // Utility methods
  async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error: any) {
      console.error('Connection check failed:', error);
      return false;
    }
  }

  // Get the current base URL
  getBaseURL(): string {
    return this.baseURL;
  }

  // Update the base URL (useful for switching environments)
  updateBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
    console.log(`API base URL updated to: ${newBaseURL}`);
  }
}

export const apiService = new ApiService();
export type { AuthTokens, CartItem, Order, Product, User };
