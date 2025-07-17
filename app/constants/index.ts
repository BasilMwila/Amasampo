// app/constants/index.ts

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
  'Other',
];

export const ORDER_STATUSES = [
  'pending',
  'confirmed', 
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled'
] as const;

export const USER_TYPES = ['buyer', 'seller'] as const;

export const PAYMENT_TYPES = [
  'credit',
  'debit', 
  'bank',
  'paypal',
  'apple_pay',
  'google_pay'
] as const;

export const ADDRESS_TYPES = ['home', 'work', 'other'] as const;

export const MESSAGE_TYPES = [
  'order',
  'message',
  'review',
  'system',
  'promotion',
  'payment'
] as const;

export const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'price_low', label: 'Price: Low to High' },
  { key: 'price_high', label: 'Price: High to Low' },
  { key: 'rating', label: 'Highest Rated' },
  { key: 'distance', label: 'Nearest First' },
];

export const REVIEW_SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'rating_high', label: 'Highest Rated' },
  { key: 'rating_low', label: 'Lowest Rated' },
  { key: 'helpful', label: 'Most Helpful' },
];

export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center';

export const IMAGE_UPLOAD_LIMITS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxDimensions: {
    width: 2048,
    height: 2048,
  },
};

export const APP_CONFIG = {
  name: 'Marketplace',
  version: '1.0.0',
  description: 'Your local marketplace for buying and selling',
  supportEmail: 'support@marketplace.com',
  supportPhone: '+1 (555) 123-4567',
  website: 'https://marketplace.com',
};