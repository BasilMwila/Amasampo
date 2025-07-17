// app/services/api.ts
const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    type: 'buyer' | 'seller';
    shopName?: string;
  }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile() {
    return this.makeRequest('/users/profile');
  }

  async updateProfile(userData: any) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Product endpoints
  async getProducts(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.makeRequest(endpoint);
  }

  async getProduct(id: number) {
    return this.makeRequest(`/products/${id}`);
  }

  async createProduct(productData: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string;
    image?: string;
  }) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: any) {
    return this.makeRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number) {
    return this.makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async getOrders() {
    return this.makeRequest('/orders');
  }

  async getOrder(id: number) {
    return this.makeRequest(`/orders/${id}`);
  }

  async createOrder(orderData: {
    items: {
      productId: number;
      quantity: number;
      price: number;
    }[];
    deliveryAddress: any;
    paymentMethodId: number;
    deliveryInstructions?: string;
  }) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id: number, status: string) {
    return this.makeRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Message endpoints
  async getConversations() {
    return this.makeRequest('/messages/conversations');
  }

  async getMessages(userId: number) {
    return this.makeRequest(`/messages/${userId}`);
  }

  async sendMessage(userId: number, message: string) {
    return this.makeRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId: userId, message }),
    });
  }

  // Review endpoints
  async getProductReviews(productId: number) {
    return this.makeRequest(`/reviews/product/${productId}`);
  }

  async getUserReviews(userId: number) {
    return this.makeRequest(`/reviews/user/${userId}`);
  }

  async createReview(reviewData: {
    productId?: number;
    sellerId?: number;
    rating: number;
    title: string;
    comment: string;
  }) {
    return this.makeRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Image upload
  async uploadImage(imageUri: string): Promise<string> {
    const formData = new FormData();
    
    // Convert image URI to blob for web, or use as-is for React Native
    if (imageUri.startsWith('data:')) {
      // Base64 image
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, 'image.jpg');
    } else {
      // File URI (React Native)
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const result = await response.json();
    return result.imageUrl;
  }

  // Payment methods
  async getPaymentMethods() {
    return this.makeRequest('/payment-methods');
  }

  async addPaymentMethod(paymentData: any) {
    return this.makeRequest('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async deletePaymentMethod(id: number) {
    return this.makeRequest(`/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }

  // Addresses
  async getAddresses() {
    return this.makeRequest('/addresses');
  }

  async addAddress(addressData: any) {
    return this.makeRequest('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id: number, addressData: any) {
    return this.makeRequest(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id: number) {
    return this.makeRequest(`/addresses/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();