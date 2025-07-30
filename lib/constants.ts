// Constants for Sri Kanya Family Restaurants

export const RESTAURANT_INFO = {
  name: 'Sri Kanya Family Restaurants',
  tagline: 'Authentic Indian Cuisine & Traditional Flavors',
  phone: '+91-9876543210',
  address: '123 Culinary Street, Food District, City 560001',
  email: 'orders@srikanya.com',
  hours: 'Daily: 11:00 AM - 11:00 PM',
};

export const ORDER_CONFIG = {
  currency: '₹',
  maxQuantityPerItem: 10,
  estimatedPrepTime: '20-25 minutes',
  taxRate: 0, // 0% tax
  serviceCharge: 0, // 0% service charge
  minOrderAmount: 50,
};

export const UI_CONFIG = {
  animationDuration: 300,
  toastDuration: 3000,
  debounceDelay: 500,
  pageSize: 20,
};

export const API_ENDPOINTS = {
  orders: '/api/orders',
  menu: '/api/menu',
  webhook: process.env.N8N_WEBHOOK_URL || '',
};

export const CATEGORY_COLORS = {
  biryanis: 'from-amber-500 to-orange-500',
  vegCurries: 'from-green-500 to-emerald-500',
  nonVegCurries: 'from-red-500 to-rose-500',
  friedRiceNoodles: 'from-blue-500 to-cyan-500',
  breadsRoti: 'from-yellow-500 to-amber-500',
};

export const BADGE_VARIANTS = {
  veg: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: '🥗',
  },
  signature: {
    bg: 'bg-gradient-to-r from-amber-100 to-orange-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: '⭐',
  },
  special: {
    bg: 'bg-gradient-to-r from-purple-100 to-pink-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: '✨',
  },
};

export const STORAGE_KEYS = {
  cart: 'sriKanyaCart',
  tableNumber: 'sriKanyaTable',
  preferences: 'sriKanyaPrefs',
};

export const ORDER_STATUS = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
} as const;

export const ORDER_TYPES = {
  DINE_IN: 'dine-in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
} as const;