// Type definitions for Sri Kanya Menu System

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  isSignature?: boolean;
  isSpecial?: boolean;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  subtotal: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface OrderSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  grandTotal: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  category: string;
  isVeg: boolean;
  isSignature: boolean;
}

export interface Order {
  orderId: string;
  restaurantName: string;
  tableNumber: number;
  timestamp: string;
  customer: Customer;
  items: OrderItem[];
  orderSummary: OrderSummary;
  specialInstructions: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  estimatedTime: string;
  status: 'received' | 'preparing' | 'ready' | 'served' | 'completed';
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  tableNumber: number | null;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  phone: string;
  address: string;
  email: string;
  hours: string;
}