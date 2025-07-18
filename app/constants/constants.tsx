// app/constants.ts - App constants
export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food',
  'Home & Garden',
  'Sports & Recreation',
  'Books & Media',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Arts & Crafts',
  'Services',
];

export const USER_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller',
} as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  PRODUCT: 'product',
} as const;

export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  MESSAGE: 'message',
  PRODUCT: 'product',
  GENERAL: 'general',
} as const;

export const PAYMENT_METHODS = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  BANK: 'bank',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
} as const;

export const ADDRESS_TYPES = {
  HOME: 'home',
  WORK: 'work',
  OTHER: 'other',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// App Configuration
export const APP_CONFIG = {
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  MIN_PASSWORD_LENGTH: 8,
  MAX_CART_ITEMS: 50,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// UI Constants
export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
  BACKGROUND: '#f8f9fa',
  CARD: '#ffffff',
  BORDER: '#e5e7eb',
  TEXT_PRIMARY: '#1a1a1a',
  TEXT_SECONDARY: '#6b7280',
  TEXT_MUTED: '#9ca3af',
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  ROUND: 999,
};

export const FONT_SIZES = {
  XS: 10,
  SM: 12,
  MD: 14,
  LG: 16,
  XL: 18,
  XXL: 20,
  XXXL: 24,
  TITLE: 28,
  HEADER: 32,
};

// Feature Flags
export const FEATURES = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_GEOLOCATION: true,
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_DARK_MODE: false,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: __DEV__ ? false : true,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  PRODUCT_CREATED: 'Product added successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
};

// Regex Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[\d\s\-\(\)]{10,}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  URL: /^https?:\/\/.+/,
  NUMBERS_ONLY: /^\d+$/,
  DECIMAL: /^\d+\.?\d*$/,
};

// Default Images
export const DEFAULT_IMAGES = {
  PRODUCT_PLACEHOLDER: 'https://via.placeholder.com/300x200?text=Product+Image',
  AVATAR_PLACEHOLDER: 'https://via.placeholder.com/150x150?text=Avatar',
  LOGO: 'https://via.placeholder.com/200x100?text=Marketplace',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PRODUCTS_PER_PAGE: 20,
  ORDERS_PER_PAGE: 10,
  MESSAGES_PER_PAGE: 50,
  REVIEWS_PER_PAGE: 10,
  NOTIFICATIONS_PER_PAGE: 20,
};

// Cache Keys
export const CACHE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CART_COUNT: 'cart_count',
  NOTIFICATIONS_COUNT: 'notifications_count',
};

// Socket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  ORDER_UPDATE: 'order_update',
  NOTIFICATION: 'notification',
};

export default {
  CATEGORIES,
  USER_TYPES,
  ORDER_STATUSES,
  MESSAGE_TYPES,
  NOTIFICATION_TYPES,
  PAYMENT_METHODS,
  ADDRESS_TYPES,
  API_CONFIG,
  APP_CONFIG,
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FEATURES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PATTERNS,
  DEFAULT_IMAGES,
  PAGINATION,
  CACHE_KEYS,
  SOCKET_EVENTS,
};