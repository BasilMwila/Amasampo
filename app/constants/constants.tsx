// app/constants/constants.ts - Updated with default images and all constants

export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#10b981',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
  
  BACKGROUND: '#f8f9fa',
  CARD: '#ffffff',
  BORDER: '#e5e7eb',
  
  TEXT_PRIMARY: '#1f2937',
  TEXT_SECONDARY: '#6b7280',
  TEXT_MUTED: '#9ca3af',
  TEXT_LIGHT: '#f9fafb',
  
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  SHADOW: 'rgba(0, 0, 0, 0.1)',
};

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
  'Services'
];

export const DEFAULT_IMAGES = {
  PRODUCT_PLACEHOLDER: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image',
  USER_AVATAR: 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=User',
  CATEGORY_PLACEHOLDER: 'https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=Category',
  SHOP_BANNER: 'https://via.placeholder.com/400x200/f3f4f6/9ca3af?text=Shop+Banner'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  PRODUCT_NOT_FOUND: 'Product not found or no longer available.',
  USER_NOT_FOUND: 'User not found.',
  INSUFFICIENT_STOCK: 'Not enough items in stock.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  PHONE_ALREADY_EXISTS: 'An account with this phone number already exists.',
  PASSWORD_TOO_WEAK: 'Password must be at least 8 characters with letters and numbers.',
  REQUIRED_FIELDS_MISSING: 'Please fill in all required fields.',
  IMAGE_UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  ORDER_NOT_FOUND: 'Order not found.',
  PAYMENT_FAILED: 'Payment processing failed. Please try another payment method.',
  CART_EMPTY: 'Your cart is empty.',
  ADDRESS_REQUIRED: 'Please select a delivery address.',
  PAYMENT_METHOD_REQUIRED: 'Please select a payment method.'
};

export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Product created successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_UPDATED: 'Order status updated!',
  PAYMENT_SUCCESSFUL: 'Payment processed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  ADDRESS_ADDED: 'Address added successfully!',
  ADDRESS_UPDATED: 'Address updated successfully!',
  ADDRESS_DELETED: 'Address deleted successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  LOGOUT_SUCCESSFUL: 'Logged out successfully!',
  REGISTRATION_SUCCESSFUL: 'Account created successfully!',
  LOGIN_SUCCESSFUL: 'Logged in successfully!',
  CART_UPDATED: 'Cart updated successfully!',
  CART_CLEARED: 'Cart cleared successfully!'
};

export const USER_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller'
} as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export const LIMITS = {
  MESSAGE_LENGTH: 1000,
  PRODUCT_NAME_LENGTH: 100,
  PRODUCT_DESCRIPTION_LENGTH: 1000,
  USER_NAME_LENGTH: 50,
  SHOP_NAME_LENGTH: 100,
};

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  ORDER: 'order',
  PRODUCT: 'product',
  SYSTEM: 'system',
  PRODUCT_REFERENCE: 'product_reference',
  NOTIFICATION: 'notification',
  REVIEW: 'review',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  MESSAGE: 'message',
  PAYMENT: 'payment',
  PRODUCT: 'product',
  REVIEW: 'review',
  SYSTEM: 'system'
} as const;

export const PRODUCT_CONDITIONS = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
} as const;

export const DELIVERY_METHODS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  BOTH: 'both'
} as const;

export const SORT_OPTIONS = [
  { label: 'Latest', value: 'created_at_desc' },
  { label: 'Oldest', value: 'created_at_asc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' },
  { label: 'Rating: High to Low', value: 'rating_desc' },
  { label: 'Rating: Low to High', value: 'rating_asc' }
];

export const PRICE_RANGES = [
  { label: 'Under $10', min: 0, max: 10 },
  { label: '$10 - $25', min: 10, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $250', min: 100, max: 250 },
  { label: '$250 - $500', min: 250, max: 500 },
  { label: 'Over $500', min: 500, max: null }
];

export const DISTANCE_RANGES = [
  { label: 'Within 1 km', value: 1 },
  { label: 'Within 5 km', value: 5 },
  { label: 'Within 10 km', value: 10 },
  { label: 'Within 25 km', value: 25 },
  { label: 'Within 50 km', value: 50 },
  { label: 'Any distance', value: null }
];

export const RATING_FILTERS = [
  { label: '5 Stars', value: 5 },
  { label: '4+ Stars', value: 4 },
  { label: '3+ Stars', value: 3 },
  { label: '2+ Stars', value: 2 },
  { label: '1+ Stars', value: 1 }
];

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  URL: /^https?:\/\/.+$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  CREDIT_CARD: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  NAME: /^[a-zA-Z\s\-']{2,50}$/,
};

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_LETTER: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false
  },
  PRODUCT: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 500,
    MIN_PRICE: 0.01,
    MAX_PRICE: 999999.99,
    MIN_QUANTITY: 0,
    MAX_QUANTITY: 999999,
    MAX_IMAGES: 5
  },
  REVIEW: {
    TITLE_MIN_LENGTH: 5,
    TITLE_MAX_LENGTH: 100,
    COMMENT_MIN_LENGTH: 10,
    COMMENT_MAX_LENGTH: 500,
    MIN_RATING: 1,
    MAX_RATING: 5
  },
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500
  },
  ADDRESS: {
    FULL_NAME_MAX_LENGTH: 100,
    ADDRESS_LINE_MAX_LENGTH: 255,
    CITY_MAX_LENGTH: 100,
    STATE_MAX_LENGTH: 100,
    ZIP_CODE_MAX_LENGTH: 20,
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 15
  }
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILES: 5
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  CATEGORIES: 'categories',
  FEATURED_PRODUCTS: 'featured_products',
  CART_COUNT: 'cart_count',
  NOTIFICATIONS: 'notifications'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  SEARCH_HISTORY: 'search_history',
  RECENT_PRODUCTS: 'recent_products',
  SETTINGS: 'settings'
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  CART: '/cart',
  MESSAGES: '/messages',
  REVIEWS: '/reviews',
  NOTIFICATIONS: '/notifications',
  ADDRESSES: '/addresses',
  PAYMENT: '/payment',
  UPLOAD: '/upload'
};

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  ORDER_UPDATE: 'order_update',
  NOTIFICATION: 'notification',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing'
};

export const REFRESH_INTERVALS = {
  NOTIFICATIONS: 30000, // 30 seconds
  MESSAGES: 5000, // 5 seconds
  ORDERS: 60000, // 1 minute
  CART: 300000 // 5 minutes
};

export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  IMAGE_UPLOAD: 60000, // 1 minute
  SOCKET_CONNECTION: 10000 // 10 seconds
};

export const FEATURE_FLAGS = {
  ENABLE_CHAT: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_REVIEWS: true,
  ENABLE_WISHLISTS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_LOCATION_SERVICES: true,
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_MULTI_LANGUAGE: false,
  ENABLE_DARK_MODE: false
};

export default {
  COLORS,
  CATEGORIES,
  DEFAULT_IMAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  MESSAGE_TYPES,
  NOTIFICATION_TYPES,
  PRODUCT_CONDITIONS,
  DELIVERY_METHODS,
  SORT_OPTIONS,
  PRICE_RANGES,
  DISTANCE_RANGES,
  RATING_FILTERS,
  PATTERNS,
  VALIDATION_RULES,
  FILE_UPLOAD,
  PAGINATION,
  CACHE_KEYS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  SOCKET_EVENTS,
  REFRESH_INTERVALS,
  TIMEOUTS,
  FEATURE_FLAGS
};