
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/services/api.ts - API service for backend integration
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL - Update this to your actual backend URL
const API_BASE_URL = 'http://10.67.69.23:3000/api'; // Change to your backend URL

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_type: 'buyer' | 'seller';
  shop_name?: string;
  avatar_url?: string;
  is_verified: boolean;
}

interface Product {
  is_on_sale: unknown;
  distance: number;
  original_price: any;
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category_id: number;
  category_name?: string;
  seller_id: number;
  seller_name?: string;
  shop_name?: string;
  image_url?: string;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  is_active?: boolean;
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
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: any[];
}

class ApiService {
  private baseURL: string;

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

  // Helper method to make HTTP requests
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<{ user: User; tokens: any }> {
    const response = await this.request<{ user: User; tokens: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token
    if (response.tokens?.access_token) {
      await AsyncStorage.setItem('auth_token', response.tokens.access_token);
      await AsyncStorage.setItem('refresh_token', response.tokens.refresh_token);
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
  }): Promise<{ user: User; tokens: any }> {
    const response = await this.request<{ user: User; tokens: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token
    if (response.tokens?.access_token) {
      await AsyncStorage.setItem('auth_token', response.tokens.access_token);
      await AsyncStorage.setItem('refresh_token', response.tokens.refresh_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear stored tokens
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
    }
  }

  async refreshToken(): Promise<{ tokens: any }> {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{ tokens: any }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Update stored tokens
    if (response.tokens?.access_token) {
      await AsyncStorage.setItem('auth_token', response.tokens.access_token);
      await AsyncStorage.setItem('refresh_token', response.tokens.refresh_token);
    }

    return response;
  }

  // Product APIs
  async getProducts(filters: {
    search?: string;
    category_id?: number;
    seller_id?: number;
    is_featured?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ products: Product[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ products: Product[]; pagination?: any }>(endpoint);
  }

  async getFeaturedProducts(): Promise<{ products: Product[] }> {
    return this.request<{ products: Product[] }>('/products/featured');
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

  async deleteProduct(id: number): Promise<void> {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  // Cart APIs
  async getCart(): Promise<{ cart_items: CartItem[]; summary: any }> {
    return this.request<{ cart_items: CartItem[]; summary: any }>('/cart');
  }

  async addToCart(productId: number, quantity: number): Promise<{ cart_item: CartItem }> {
    return this.request<{ cart_item: CartItem }>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(productId: number, quantity: number): Promise<{ cart_item: CartItem }> {
    return this.request<{ cart_item: CartItem }>(`/cart/update/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: number): Promise<void> {
    return this.request(`/cart/remove/${productId}`, { method: 'DELETE' });
  }

  async clearCart(): Promise<void> {
    return this.request('/cart/clear', { method: 'DELETE' });
  }

  async getCartCount(): Promise<{ total_items: number }> {
    return this.request<{ total_items: number }>('/cart/count');
  }

  // Order APIs
  async getOrders(page: number = 1, limit: number = 10): Promise<{ orders: Order[]; pagination: any }> {
    return this.request<{ orders: Order[]; pagination: any }>(`/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(id: number): Promise<{ order: Order }> {
    return this.request<{ order: Order }>(`/orders/${id}`);
  }

  async createOrder(orderData: {
    items: { product_id: number; quantity: number }[];
    delivery_address: any;
    payment_method: any;
  }): Promise<{ order: Order }> {
    return this.request<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Categories APIs
  async getCategories(): Promise<{ categories: any[] }> {
    return this.request<{ categories: any[] }>('/categories');
  }

  // Messages APIs
  async getConversations(): Promise<{ conversations: any[] }> {
    return this.request<{ conversations: any[] }>('/messages/conversations');
  }

  async getConversation(userId: number, page: number = 1): Promise<{ messages: any[]; other_user: any; pagination: any }> {
    return this.request<{ messages: any[]; other_user: any; pagination: any }>(`/messages/conversation/${userId}?page=${page}`);
  }

  async sendMessage(recipientId: number, messageText: string): Promise<{ data: any }> {
    return this.request<{ data: any }>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId, message_text: messageText }),
    });
  }

  // Notifications APIs
  async getNotifications(page: number = 1): Promise<{ notifications: any[]; pagination: any }> {
    return this.request<{ notifications: any[]; pagination: any }>(`/notifications?page=${page}`);
  }

  async getUnreadCount(): Promise<{ unread_count: number }> {
    return this.request<{ unread_count: number }>('/notifications/unread-count');
  }

  async markNotificationRead(id: number): Promise<void> {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.request('/notifications/mark-all-read', { method: 'PUT' });
  }

  // User Profile APIs
  async getUserProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getDashboard(): Promise<{ dashboard: any }> {
    return this.request<{ dashboard: any }>('/users/dashboard');
  }

  // Addresses APIs
  async getAddresses(): Promise<{ addresses: any[] }> {
    return this.request<{ addresses: any[] }>('/addresses');
  }

  async getDefaultAddress(): Promise<{ address: any }> {
    return this.request<{ address: any }>('/addresses/default');
  }

  async createAddress(addressData: any): Promise<{ address: any }> {
    return this.request<{ address: any }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id: number, addressData: any): Promise<{ address: any }> {
    return this.request<{ address: any }>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id: number): Promise<void> {
    return this.request(`/addresses/${id}`, { method: 'DELETE' });
  }

  // Reviews APIs
  async getProductReviews(productId: number, page: number = 1): Promise<{ reviews: any[]; rating_summary: any; pagination: any }> {
    return this.request<{ reviews: any[]; rating_summary: any; pagination: any }>(`/reviews/product/${productId}?page=${page}`);
  }

  async createReview(reviewData: {
    product_id: number;
    rating: number;
    title: string;
    comment: string;
    order_id?: number;
  }): Promise<{ review: any }> {
    return this.request<{ review: any }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // File Upload APIs
  async uploadProductImage(imageFile: any): Promise<{ image_url: string }> {
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
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
export type { CartItem, Order, Product, User };

