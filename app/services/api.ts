// app/services/api.ts - Complete API service with TypeScript errors fixed
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types - All original types preserved
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_type: 'buyer' | 'seller';
  shop_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Product {
  id: number;
  seller_id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_url?: string;
  images?: string[];
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  original_price?: number;
  rating?: number;
  review_count?: number;
  view_count?: number;
  distance?: number;
  category_name?: string;
  seller_name?: string;
  shop_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  product_image?: string;
  seller_name: string;
  shop_name?: string;
  available_quantity: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  buyer_id: number;
  seller_id: number;
  status: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  tax: number;
  total: number;
  delivery_address_name: string;
  delivery_full_name: string;
  delivery_phone: string;
  delivery_address_line1: string;
  delivery_address_line2?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip_code: string;
  delivery_country: string;
  delivery_instructions?: string;
  payment_method_type: string;
  payment_method_last4?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  buyer_name?: string;
  seller_name?: string;
  shop_name?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export interface Conversation {
  id: number;
  participant_id: number;
  participant_name: string;
  participant_type: string;
  shop_name?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  order_id?: number;
  rating: number;
  title: string;
  comment: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  product_name?: string;
}

export interface Address {
  id: number;
  user_id: number;
  address_name: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  user_id: number;
  payment_type: string;
  brand?: string;
  last4?: string;
  expiry_month?: number;
  expiry_year?: number;
  account_name?: string;
  email?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  user_type: 'buyer' | 'seller';
  shop_name?: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: number;
  seller_id?: number;
  is_featured?: boolean;
  is_on_sale?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

class ApiService {
  private baseURL: string;
  private defaultTimeout: number = 30000;

  constructor() {
    // Use your actual backend URL here
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.116:3000/api';
    console.log('🌐 API Service initialized with base URL:', this.baseURL);
  }

  // Get base URL for debugging
  getBaseURL(): string {
    return this.baseURL;
  }

  // Helper method to create fetch with timeout
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = this.defaultTimeout): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  // Test connection to backend
  async checkConnection(): Promise<boolean> {
    try {
      console.log('🔄 Testing connection to:', `${this.baseURL.replace('/api', '')}/health`);
      
      const response = await this.fetchWithTimeout(`${this.baseURL.replace('/api', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 10000);

      const isConnected = response.ok;
      console.log('✅ Connection test result:', isConnected ? 'SUCCESS' : 'FAILED');
      
      if (isConnected) {
        const data = await response.json();
        console.log('📊 Server status:', data);
      }
      
      return isConnected;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  // Get stored auth token
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  // Store auth tokens
  private async storeTokens(tokens: { access_token: string; refresh_token: string }): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['auth_token', tokens.access_token],
        ['refresh_token', tokens.refresh_token],
      ]);
      console.log('✅ Tokens stored successfully');
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
    }
  }

  // Clear stored tokens
  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
      console.log('🗑️ Tokens cleared');
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error);
    }
  }

  // Process image URLs to ensure they're valid - NEW IMAGE PROCESSING FUNCTIONALITY
  private processImageUrl(imageUrl?: string): string | undefined {
    if (!imageUrl) {
      console.log('📷 No image URL provided, will use placeholder');
      return undefined;
    }

    // If it's already a complete URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('📷 Using complete image URL:', imageUrl);
      return imageUrl;
    }

    // If it's a relative path, prepend the base URL
    const fullImageUrl = `${this.baseURL.replace('/api', '')}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    console.log('📷 Converted relative path to full URL:', fullImageUrl);
    return fullImageUrl;
  }

  // Process product data to ensure image URLs are valid - NEW IMAGE PROCESSING FUNCTIONALITY
  private processProductData(product: any): Product {
    return {
      ...product,
      image_url: this.processImageUrl(product.image_url),
      images: product.images ? product.images.map((img: string) => this.processImageUrl(img)).filter(Boolean) : undefined,
    };
  }

  // Process cart item data to ensure image URLs are valid - NEW IMAGE PROCESSING FUNCTIONALITY
  private processCartItemData(item: any): CartItem {
    return {
      ...item,
      product_image: this.processImageUrl(item.product_image),
    };
  }

  // Process order data to ensure image URLs are valid - NEW IMAGE PROCESSING FUNCTIONALITY
  private processOrderData(order: any): Order {
    return {
      ...order,
      items: order.items ? order.items.map((item: any) => ({
        ...item,
        product_image: this.processImageUrl(item.product_image),
      })) : undefined,
    };
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

    try {
      const token = await this.getAuthToken();
      
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      const response = await this.fetchWithTimeout(url, config);
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('❌ API Error Details:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
        }

        // Handle specific error cases
        if (response.status === 401) {
          console.log('🔐 Unauthorized - clearing tokens');
          await this.clearTokens();
          throw new Error('Session expired. Please log in again.');
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ API Request successful');
      return data;
      
    } catch (error: any) {
      console.error(`❌ API Request failed for ${endpoint}:`, error);
      
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  }

  // Auth methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('🔐 Attempting login for:', email);
    
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.tokens) {
      await this.storeTokens(response.tokens);
    }

    console.log('✅ Login successful for user:', response.user.name);
    return response;
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    console.log('📝 Attempting registration for:', userData.email);
    
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.tokens) {
      await this.storeTokens(response.tokens);
    }

    console.log('✅ Registration successful for user:', response.user.name);
    return response;
  }

  async logout(): Promise<void> {
    console.log('🚪 Logging out...');
    
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('⚠️ Logout request failed (continuing with local cleanup):', error);
    }

    await this.clearTokens();
    console.log('✅ Logout completed');
  }

  async refreshToken(): Promise<void> {
    console.log('🔄 Refreshing token...');
    
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{ tokens: LoginResponse['tokens'] }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    await this.storeTokens(response.tokens);
    console.log('✅ Token refreshed successfully');
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.request<{ user: User }>('/auth/me');
    return response;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    console.log('🔐 Requesting password reset for:', email);
    
    const response = await this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    console.log('✅ Password reset request sent');
    return response;
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    console.log('🔐 Resetting password with token');
    
    const response = await this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });

    console.log('✅ Password reset successful');
    return response;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    console.log('🔐 Changing password');
    
    const response = await this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    console.log('✅ Password changed successfully');
    return response;
  }

  // User methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async updateProfile(userData: Partial<User>): Promise<{ user: User }> {
    console.log('👤 Updating profile');
    
    const response = await this.request<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    console.log('✅ Profile updated successfully');
    return response;
  }

  async getUserProfile(userId: number): Promise<{ user: User }> {
    console.log('👤 Fetching user profile:', userId);
    
    const response = await this.request<{ user: User }>(`/users/${userId}`);
    
    console.log('✅ User profile fetched');
    return response;
  }

  async uploadAvatar(formData: FormData): Promise<{ avatar_url: string }> {
    console.log('📷 Uploading avatar...');
    
    const token = await this.getAuthToken();
    const url = `${this.baseURL}/upload/avatar`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      }, 60000);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Avatar uploaded successfully');
      return data;
      
    } catch (error: any) {
      console.error('❌ Avatar upload failed:', error);
      throw error;
    }
  }

  // Product methods - ALL ORIGINAL FUNCTIONALITY PRESERVED + IMAGE PROCESSING
  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; pagination?: PaginationInfo }> {
    console.log('📦 Fetching products with filters:', filters);
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<{ products: Product[]; pagination?: PaginationInfo }>(endpoint);
    
    // Process image URLs in products
    const processedProducts = response.products.map(product => this.processProductData(product));
    
    console.log(`✅ Fetched ${processedProducts.length} products`);
    return { ...response, products: processedProducts };
  }

  async getProduct(id: number): Promise<{ product: Product }> {
    console.log('📦 Fetching product:', id);
    
    const response = await this.request<{ product: Product }>(`/products/${id}`);
    
    // Process image URLs
    const processedProduct = this.processProductData(response.product);
    
    console.log('✅ Fetched product:', processedProduct.name);
    return { product: processedProduct };
  }

  async getFeaturedProducts(limit: number = 10): Promise<{ products: Product[] }> {
    console.log('⭐ Fetching featured products');
    
    const response = await this.request<{ products: Product[] }>(`/products/featured?limit=${limit}`);
    
    // Process image URLs
    const processedProducts = response.products.map(product => this.processProductData(product));
    
    console.log(`✅ Fetched ${processedProducts.length} featured products`);
    return { products: processedProducts };
  }

  async getSellerProducts(sellerId: number, page: number = 1): Promise<{ products: Product[]; pagination?: PaginationInfo }> {
    console.log('🏪 Fetching seller products:', sellerId);
    
    const response = await this.request<{ products: Product[]; pagination?: PaginationInfo }>(`/products/seller/${sellerId}?page=${page}`);
    
    // Process image URLs
    const processedProducts = response.products.map(product => this.processProductData(product));
    
    console.log(`✅ Fetched ${processedProducts.length} seller products`);
    return { ...response, products: processedProducts };
  }

  async getCategoryProducts(categoryId: number, page: number = 1): Promise<{ products: Product[]; pagination?: PaginationInfo }> {
    console.log('📂 Fetching category products:', categoryId);
    
    const response = await this.request<{ products: Product[]; pagination?: PaginationInfo }>(`/products/category/${categoryId}?page=${page}`);
    
    // Process image URLs
    const processedProducts = response.products.map(product => this.processProductData(product));
    
    console.log(`✅ Fetched ${processedProducts.length} category products`);
    return { ...response, products: processedProducts };
  }

  async createProduct(productData: any): Promise<{ product: Product }> {
    console.log('📦 Creating product:', productData.name);
    
    const response = await this.request<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });

    const processedProduct = this.processProductData(response.product);
    
    console.log('✅ Created product:', processedProduct.name);
    return { product: processedProduct };
  }

  async updateProduct(id: number, productData: any): Promise<{ product: Product }> {
    console.log('📦 Updating product:', id);
    
    const response = await this.request<{ product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });

    const processedProduct = this.processProductData(response.product);
    
    console.log('✅ Updated product:', processedProduct.name);
    return { product: processedProduct };
  }

  async deleteProduct(id: number): Promise<void> {
    console.log('🗑️ Deleting product:', id);
    
    await this.request(`/products/${id}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Deleted product:', id);
  }

  async toggleProductFeatured(id: number): Promise<{ is_featured: boolean }> {
    console.log('⭐ Toggling product featured status:', id);
    
    const response = await this.request<{ is_featured: boolean }>(`/products/${id}/toggle-featured`, {
      method: 'POST',
    });
    
    console.log('✅ Product featured status toggled');
    return response;
  }

  async duplicateProduct(id: number): Promise<{ product: Product }> {
    console.log('📋 Duplicating product:', id);
    
    const response = await this.request<{ product: Product }>(`/products/${id}/duplicate`, {
      method: 'POST',
    });

    const processedProduct = this.processProductData(response.product);
    
    console.log('✅ Product duplicated');
    return { product: processedProduct };
  }

  // Category methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async getCategories(): Promise<{ categories: Category[] }> {
    console.log('📂 Fetching categories...');
    
    const response = await this.request<{ categories: Category[] }>('/categories');
    
    console.log(`✅ Fetched ${response.categories.length} categories`);
    return response;
  }

  async getCategory(id: number): Promise<{ category: Category }> {
    console.log('📂 Fetching category:', id);
    
    const response = await this.request<{ category: Category }>(`/categories/${id}`);
    
    console.log('✅ Category fetched');
    return response;
  }

  async createCategory(categoryData: Partial<Category>): Promise<{ category: Category }> {
    console.log('📂 Creating category');
    
    const response = await this.request<{ category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    
    console.log('✅ Category created');
    return response;
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<{ category: Category }> {
    console.log('📂 Updating category:', id);
    
    const response = await this.request<{ category: Category }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    
    console.log('✅ Category updated');
    return response;
  }

  async deleteCategory(id: number): Promise<void> {
    console.log('🗑️ Deleting category:', id);
    
    await this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Category deleted');
  }

  // Cart methods - ALL ORIGINAL FUNCTIONALITY PRESERVED + IMAGE PROCESSING
  async getCartItems(): Promise<{ items: CartItem[] }> {
    console.log('🛒 Fetching cart items...');
    
    const response = await this.request<{ items: CartItem[] }>('/cart');
    
    // Process image URLs in cart items
    const processedItems = response.items.map(item => this.processCartItemData(item));
    
    console.log(`✅ Fetched ${processedItems.length} cart items`);
    return { items: processedItems };
  }

  async getCartCount(): Promise<{ count: number }> {
    console.log('🛒 Fetching cart count...');
    
    const response = await this.request<{ count: number }>('/cart/count');
    
    console.log(`✅ Cart count: ${response.count}`);
    return response;
  }

  async addToCart(productId: number, quantity: number): Promise<{ item: CartItem }> {
    console.log('🛒 Adding to cart:', { productId, quantity });
    
    const response = await this.request<{ item: CartItem }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    // Process image URL
    const processedItem = this.processCartItemData(response.item);
    
    console.log('✅ Added to cart:', processedItem.product_name);
    return { item: processedItem };
  }

  async updateCartItem(productId: number, quantity: number): Promise<{ item: CartItem }> {
    console.log('🛒 Updating cart item:', { productId, quantity });
    
    const response = await this.request<{ item: CartItem }>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });

    const processedItem = this.processCartItemData(response.item);
    
    console.log('✅ Updated cart item:', processedItem.product_name);
    return { item: processedItem };
  }

  async removeFromCart(productId: number): Promise<void> {
    console.log('🛒 Removing from cart:', productId);
    
    await this.request(`/cart/${productId}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Removed from cart:', productId);
  }

  async clearCart(): Promise<void> {
    console.log('🛒 Clearing cart...');
    
    await this.request('/cart', {
      method: 'DELETE',
    });
    
    console.log('✅ Cart cleared');
  }

  // Order methods - ALL ORIGINAL FUNCTIONALITY PRESERVED + IMAGE PROCESSING
  async createOrder(orderData: any): Promise<{ order: Order }> {
    console.log('📋 Creating order');
    
    const response = await this.request<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    const processedOrder = this.processOrderData(response.order);
    
    console.log('✅ Order created:', processedOrder.order_number);
    return { order: processedOrder };
  }

  async getOrders(type: 'buyer' | 'seller' = 'buyer', page: number = 1): Promise<{ orders: Order[]; pagination?: PaginationInfo }> {
    console.log('📋 Fetching orders:', type);
    
    const response = await this.request<{ orders: Order[]; pagination?: PaginationInfo }>(`/orders?type=${type}&page=${page}`);
    
    // Process image URLs in orders
    const processedOrders = response.orders.map(order => this.processOrderData(order));
    
    console.log(`✅ Fetched ${processedOrders.length} orders`);
    return { ...response, orders: processedOrders };
  }

  async getOrder(id: number): Promise<{ order: Order }> {
    console.log('📋 Fetching order:', id);
    
    const response = await this.request<{ order: Order }>(`/orders/${id}`);
    
    const processedOrder = this.processOrderData(response.order);
    
    console.log('✅ Order fetched:', processedOrder.order_number);
    return { order: processedOrder };
  }

  async updateOrderStatus(id: number, status: string, note?: string): Promise<{ order: Order }> {
    console.log('📋 Updating order status:', { id, status });
    
    const response = await this.request<{ order: Order }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });

    const processedOrder = this.processOrderData(response.order);
    
    console.log('✅ Order status updated');
    return { order: processedOrder };
  }

  async cancelOrder(id: number, reason: string): Promise<{ order: Order }> {
    console.log('📋 Cancelling order:', id);
    
    const response = await this.request<{ order: Order }>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    const processedOrder = this.processOrderData(response.order);
    
    console.log('✅ Order cancelled');
    return { order: processedOrder };
  }

  // Message methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async getConversations(): Promise<{ conversations: Conversation[] }> {
    console.log('💬 Fetching conversations');
    
    const response = await this.request<{ conversations: Conversation[] }>('/messages/conversations');
    
    console.log(`✅ Fetched ${response.conversations.length} conversations`);
    return response;
  }

  async getMessages(userId: number, page: number = 1): Promise<{ messages: Message[]; pagination?: PaginationInfo }> {
    console.log('💬 Fetching messages with user:', userId);
    
    const response = await this.request<{ messages: Message[]; pagination?: PaginationInfo }>(`/messages/${userId}?page=${page}`);
    
    console.log(`✅ Fetched ${response.messages.length} messages`);
    return response;
  }

  async sendMessage(receiverId: number, message: string, messageType: string = 'text'): Promise<{ message: Message }> {
    console.log('💬 Sending message to:', receiverId);
    
    const response = await this.request<{ message: Message }>('/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: receiverId,
        message,
        message_type: messageType,
      }),
    });
    
    console.log('✅ Message sent');
    return response;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    console.log('👁️ Marking message as read:', messageId);
    
    await this.request(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
    
    console.log('✅ Message marked as read');
  }

  async deleteMessage(messageId: number): Promise<void> {
    console.log('🗑️ Deleting message:', messageId);
    
    await this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Message deleted');
  }

  // Review methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async getProductReviews(productId: number, page: number = 1): Promise<{ reviews: Review[]; pagination?: PaginationInfo }> {
    console.log('⭐ Fetching reviews for product:', productId);
    
    const response = await this.request<{ reviews: Review[]; pagination?: PaginationInfo }>(`/reviews/product/${productId}?page=${page}`);
    
    console.log(`✅ Fetched ${response.reviews.length} reviews`);
    return response;
  }

  async getUserReviews(page: number = 1): Promise<{ reviews: Review[]; pagination?: PaginationInfo }> {
    console.log('⭐ Fetching user reviews');
    
    const response = await this.request<{ reviews: Review[]; pagination?: PaginationInfo }>(`/reviews/user?page=${page}`);
    
    console.log(`✅ Fetched ${response.reviews.length} user reviews`);
    return response;
  }

  async createReview(reviewData: {
    product_id: number;
    order_id?: number;
    rating: number;
    title: string;
    comment: string;
  }): Promise<{ review: Review }> {
    console.log('⭐ Creating review for product:', reviewData.product_id);
    
    const response = await this.request<{ review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
    
    console.log('✅ Review created');
    return response;
  }

  async updateReview(id: number, reviewData: Partial<Review>): Promise<{ review: Review }> {
    console.log('⭐ Updating review:', id);
    
    const response = await this.request<{ review: Review }>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
    
    console.log('✅ Review updated');
    return response;
  }

  async deleteReview(id: number): Promise<void> {
    console.log('🗑️ Deleting review:', id);
    
    await this.request(`/reviews/${id}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Review deleted');
  }

  // Address methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async getAddresses(): Promise<{ addresses: Address[] }> {
    console.log('📍 Fetching addresses');
    
    const response = await this.request<{ addresses: Address[] }>('/addresses');
    
    console.log(`✅ Fetched ${response.addresses.length} addresses`);
    return response;
  }

  async getAddress(id: number): Promise<{ address: Address }> {
    console.log('📍 Fetching address:', id);
    
    const response = await this.request<{ address: Address }>(`/addresses/${id}`);
    
    console.log('✅ Address fetched');
    return response;
  }

  async createAddress(addressData: Partial<Address>): Promise<{ address: Address }> {
    console.log('📍 Creating address');
    
    const response = await this.request<{ address: Address }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    
    console.log('✅ Address created');
    return response;
  }

  async updateAddress(id: number, addressData: Partial<Address>): Promise<{ address: Address }> {
    console.log('📍 Updating address:', id);
    
    const response = await this.request<{ address: Address }>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
    
    console.log('✅ Address updated');
    return response;
  }

  async deleteAddress(id: number): Promise<void> {
    console.log('🗑️ Deleting address:', id);
    
    await this.request(`/addresses/${id}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Address deleted');
  }

  async setDefaultAddress(id: number): Promise<void> {
    console.log('📍 Setting default address:', id);
    
    await this.request(`/addresses/${id}/set-default`, {
      method: 'POST',
    });
    
    console.log('✅ Default address set');
  }

  // Payment methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async getPaymentMethods(): Promise<{ payment_methods: PaymentMethod[] }> {
    console.log('💳 Fetching payment methods');
    
    const response = await this.request<{ payment_methods: PaymentMethod[] }>('/payment/methods');
    
    console.log(`✅ Fetched ${response.payment_methods.length} payment methods`);
    return response;
  }

  async getPaymentMethod(id: number): Promise<{ payment_method: PaymentMethod }> {
    console.log('💳 Fetching payment method:', id);
    
    const response = await this.request<{ payment_method: PaymentMethod }>(`/payment/methods/${id}`);
    
    console.log('✅ Payment method fetched');
    return response;
  }

  async getDefaultPaymentMethod(): Promise<{ payment_method: PaymentMethod }> {
    console.log('💳 Fetching default payment method');
    
    const response = await this.request<{ payment_method: PaymentMethod }>('/payment/methods/default');
    
    console.log('✅ Default payment method fetched');
    return response;
  }

  async createPaymentMethod(paymentData: Partial<PaymentMethod>): Promise<{ payment_method: PaymentMethod }> {
    console.log('💳 Creating payment method');
    
    const response = await this.request<{ payment_method: PaymentMethod }>('/payment/methods', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    
    console.log('✅ Payment method created');
    return response;
  }

  async updatePaymentMethod(id: number, paymentData: Partial<PaymentMethod>): Promise<{ payment_method: PaymentMethod }> {
    console.log('💳 Updating payment method:', id);
    
    const response = await this.request<{ payment_method: PaymentMethod }>(`/payment/methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
    
    console.log('✅ Payment method updated');
    return response;
  }

  async deletePaymentMethod(id: number): Promise<void> {
    console.log('🗑️ Deleting payment method:', id);
    
    await this.request(`/payment/methods/${id}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Payment method deleted');
  }

  async setDefaultPaymentMethod(id: number): Promise<void> {
    console.log('💳 Setting default payment method:', id);
    
    await this.request(`/payment/methods/${id}/set-default`, {
      method: 'POST',
    });
    
    console.log('✅ Default payment method set');
  }

  async processPayment(paymentData: {
    order_id: number;
    payment_method_id: number;
    amount: number;
  }): Promise<{ payment_id: string; status: string }> {
    console.log('💳 Processing payment');
    
    const response = await this.request<{ payment_id: string; status: string }>('/payment/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    
    console.log('✅ Payment processed');
    return response;
  }

  async getPaymentHistory(page: number = 1): Promise<{ payments: any[]; pagination?: PaginationInfo }> {
    console.log('💳 Fetching payment history');
    
    const response = await this.request<{ payments: any[]; pagination?: PaginationInfo }>(`/payment/history?page=${page}`);
    
    console.log(`✅ Fetched ${response.payments.length} payments`);
    return response;
  }

  async requestRefund(orderId: number, reason: string): Promise<{ message: string }> {
    console.log('💳 Requesting refund for order:', orderId);
    
    const response = await this.request<{ message: string }>('/payment/refund', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, reason }),
    });
    
    console.log('✅ Refund requested');
    return response;
  }

  // Notification methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async getNotifications(page: number = 1): Promise<{ notifications: Notification[]; pagination?: PaginationInfo }> {
    console.log('🔔 Fetching notifications');
    
    const response = await this.request<{ notifications: Notification[]; pagination?: PaginationInfo }>(`/notifications?page=${page}`);
    
    console.log(`✅ Fetched ${response.notifications.length} notifications`);
    return response;
  }

  async getUnreadNotificationCount(): Promise<{ count: number }> {
    console.log('🔔 Fetching unread notification count');
    
    const response = await this.request<{ count: number }>('/notifications/unread-count');
    
    console.log(`✅ Unread notifications: ${response.count}`);
    return response;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    console.log('👁️ Marking notification as read:', id);
    
    await this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
    
    console.log('✅ Notification marked as read');
  }

  async markAllNotificationsAsRead(): Promise<void> {
    console.log('👁️ Marking all notifications as read');
    
    await this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
    
    console.log('✅ All notifications marked as read');
  }

  async deleteNotification(id: number): Promise<void> {
    console.log('🗑️ Deleting notification:', id);
    
    await this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Notification deleted');
  }

  // Image upload methods - ALL ORIGINAL FUNCTIONALITY PRESERVED + IMPROVED
  async uploadProductImage(formData: FormData): Promise<{ image_url: string }> {
    console.log('📷 Uploading product image...');
    
    const token = await this.getAuthToken();
    const url = `${this.baseURL}/upload/product-image`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type for FormData - let the browser set it
        },
        body: formData,
      }, 60000);

      console.log(`📡 Upload response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('❌ Upload error details:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse upload error:', parseError);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Process the returned image URL
      const processedImageUrl = this.processImageUrl(data.image_url);
      
      console.log('✅ Image uploaded successfully:', processedImageUrl);
      return { image_url: processedImageUrl || data.image_url };
      
    } catch (error: any) {
      console.error('❌ Image upload failed:', error);
      
      if (error.message?.includes('timeout')) {
        throw new Error('Upload timed out. Please try again with a smaller image.');
      }
      
      if (error.message?.includes('Network')) {
        throw new Error('Network error during upload. Please check your connection.');
      }
      
      throw error;
    }
  }

  async uploadCategoryImage(formData: FormData): Promise<{ image_url: string }> {
    console.log('📷 Uploading category image...');
    
    const token = await this.getAuthToken();
    const url = `${this.baseURL}/upload/category-image`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      }, 60000);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const processedImageUrl = this.processImageUrl(data.image_url);
      
      console.log('✅ Category image uploaded successfully');
      return { image_url: processedImageUrl || data.image_url };
      
    } catch (error: any) {
      console.error('❌ Category image upload failed:', error);
      throw error;
    }
  }

  // Debug method to test image URLs - NEW FUNCTIONALITY
  async testImageUrl(imageUrl: string): Promise<boolean> {
    try {
      console.log('🧪 Testing image URL:', imageUrl);
      
      const response = await this.fetchWithTimeout(imageUrl, {
        method: 'HEAD', // Just check if the image exists
      }, 10000);
      
      const isValid = response.ok;
      console.log(`📷 Image URL test result: ${isValid ? 'VALID' : 'INVALID'}`);
      
      return isValid;
    } catch (error) {
      console.error('❌ Image URL test failed:', error);
      return false;
    }
  }

  // Search methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async searchProducts(query: string, filters: ProductFilters = {}): Promise<{ products: Product[]; pagination?: PaginationInfo }> {
    console.log('🔍 Searching products:', query);
    
    const searchFilters = { ...filters, search: query };
    return this.getProducts(searchFilters);
  }

  async getSearchSuggestions(query: string): Promise<{ suggestions: string[] }> {
    console.log('🔍 Getting search suggestions for:', query);
    
    const response = await this.request<{ suggestions: string[] }>(`/search/suggestions?q=${encodeURIComponent(query)}`);
    
    console.log(`✅ Fetched ${response.suggestions.length} suggestions`);
    return response;
  }

  // Analytics methods - ALL ORIGINAL FUNCTIONALITY PRESERVED
  async getSellerAnalytics(period: string = '30d'): Promise<{ analytics: any }> {
    console.log('📊 Fetching seller analytics');
    
    const response = await this.request<{ analytics: any }>(`/analytics/seller?period=${period}`);
    
    console.log('✅ Seller analytics fetched');
    return response;
  }

  async getProductAnalytics(productId: number, period: string = '30d'): Promise<{ analytics: any }> {
    console.log('📊 Fetching product analytics:', productId);
    
    const response = await this.request<{ analytics: any }>(`/analytics/product/${productId}?period=${period}`);
    
    console.log('✅ Product analytics fetched');
    return response;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;