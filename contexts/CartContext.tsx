'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { MenuItem } from '@/data/sriKanyaMenu';

export interface CartItem extends MenuItem {
  quantity: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  tableNumber: number | null;
  sessionId: string | null; // Unique session ID for each table
  orderHistory: OrderHistoryItem[]; // Track order history per table
}

interface OrderHistoryItem {
  orderId: string;
  timestamp: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served';
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { item: MenuItem; quantity: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'SET_CHECKOUT_OPEN'; payload: boolean }
  | { type: 'SET_TABLE_NUMBER'; payload: number }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'ADD_ORDER_TO_HISTORY'; payload: OrderHistoryItem }
  | { type: 'LOAD_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isCartOpen: false,
  isCheckoutOpen: false,
  tableNumber: null,
  sessionId: null,
  orderHistory: [],
};

// Helper function to get item-specific max quantity
function getMaxQuantity(item: MenuItem): number {
  return item.maxQuantity || 10; // Default to 10 if not specified
}

// Helper function to calculate bulk pricing
function calculateBulkPrice(item: MenuItem, quantity: number): number {
  if (!item.bulkPricing || item.bulkPricing.length === 0) {
    return item.price * quantity;
  }

  // Sort bulk pricing by quantity (descending)
  const sortedPricing = [...item.bulkPricing].sort((a, b) => b.quantity - a.quantity);
  
  // Find the applicable bulk pricing tier
  for (const tier of sortedPricing) {
    if (quantity >= tier.quantity) {
      return tier.price * quantity;
    }
  }
  
  return item.price * quantity;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  console.log('CartReducer - Action:', action.type, 'payload:', 'payload' in action ? action.payload : 'no payload');
  console.log('CartReducer - Current State:', state);

  let newState: CartState;

  switch (action.type) {
    case 'ADD_TO_CART': {
      const { item, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(cartItem => cartItem.id === item.id);
      const maxQuantity = getMaxQuantity(item);

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Enforce item-specific max quantity
        const currentQuantity = state.items[existingItemIndex].quantity;
        const newQuantity = Math.min(currentQuantity + quantity, maxQuantity);
        
        if (newQuantity === currentQuantity) {
          // Quantity didn't change (hit max limit)
          return state;
        }
        
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? {
                ...cartItem,
                quantity: newQuantity,
                subtotal: calculateBulkPrice(item, newQuantity),
              }
            : cartItem
        );
      } else {
        // Enforce item-specific max quantity for new items
        const safeQuantity = Math.min(quantity, maxQuantity);
        const newItem: CartItem = {
          ...item,
          quantity: safeQuantity,
          subtotal: calculateBulkPrice(item, safeQuantity),
        };
        newItems = [...state.items, newItem];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      newState = {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
      };
      break;
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      console.log('UPDATE_QUANTITY - itemId:', itemId, 'quantity:', quantity);
      
      const item = state.items.find(item => item.id === itemId);
      if (!item) return state;
      
      // Enforce min 1, max item-specific limit
      if (quantity < 1) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: itemId });
      }
      
      const maxQuantity = getMaxQuantity(item);
      if (quantity > maxQuantity) {
        return state; // Ignore if above max
      }

      const newItems = state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, subtotal: calculateBulkPrice(item, quantity) }
          : item
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      newState = {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
      };
      break;
    }

    case 'REMOVE_FROM_CART': {
      const itemId = action.payload;
      const newItems = state.items.filter(item => item.id !== itemId);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      newState = {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
      };
      break;
    }

    case 'CLEAR_CART': {
      newState = {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
      break;
    }

    case 'SET_CART_OPEN': {
      newState = {
        ...state,
        isCartOpen: action.payload,
      };
      break;
    }

    case 'SET_CHECKOUT_OPEN': {
      newState = {
        ...state,
        isCheckoutOpen: action.payload,
      };
      break;
    }

    case 'SET_TABLE_NUMBER': {
      const tableNumber = action.payload;
      const currentTableNumber = state.tableNumber;
      
      // Only clear cart and generate new session if table number actually changes
      const shouldClearCart = currentTableNumber !== null && currentTableNumber !== tableNumber;
      
      // Only generate new session ID if table actually changes or if no session exists
      let sessionId = state.sessionId;
      if (shouldClearCart || !sessionId) {
        sessionId = `table-${tableNumber}-${Date.now()}`;
      }
      
      newState = {
        ...state,
        tableNumber,
        sessionId,
        // Only clear cart if table actually changes
        ...(shouldClearCart && {
          items: [],
          totalItems: 0,
          totalAmount: 0,
          isCartOpen: false,
          isCheckoutOpen: false,
        }),
      };
      break;
    }

    case 'SET_SESSION_ID': {
      newState = {
        ...state,
        sessionId: action.payload,
      };
      break;
    }

    case 'ADD_ORDER_TO_HISTORY': {
      newState = {
        ...state,
        orderHistory: [...state.orderHistory, action.payload],
      };
      break;
    }

    case 'LOAD_CART': {
      // Validate the loaded cart data to prevent corruption
      const loadedCart = action.payload;
      
      // Validate cart structure
      if (!loadedCart || typeof loadedCart !== 'object') {
        console.warn('Invalid cart data loaded, using initial state');
        return initialState;
      }
      
      // Validate items array
      if (!Array.isArray(loadedCart.items)) {
        console.warn('Invalid items array in cart data, using initial state');
        return initialState;
      }
      
      // Validate and sanitize items
      const validItems = loadedCart.items.filter(item => 
        item && 
        typeof item === 'object' && 
        typeof item.id === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0 &&
        item.quantity <= 100 && // Sanity check for max quantity
        typeof item.subtotal === 'number' &&
        item.subtotal >= 0
      );
      
      // Recalculate totals to ensure consistency
      const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = validItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      // Sanity check for totals
      if (totalItems > 1000 || totalAmount > 100000) {
        console.warn('Cart totals exceed reasonable limits, clearing cart');
        return initialState;
      }
      
      newState = {
        ...state,
        items: validItems,
        totalItems,
        totalAmount,
        tableNumber: loadedCart.tableNumber || null,
        sessionId: loadedCart.sessionId || null,
        orderHistory: Array.isArray(loadedCart.orderHistory) ? loadedCart.orderHistory : [],
        isCartOpen: false,
        isCheckoutOpen: false,
      };
      break;
    }

    default:
      return state;
  }

  console.log('CartReducer - New State:', newState);
  return newState;
}

interface CartContextType {
  state: CartState;
  addToCart: (item: MenuItem, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  resetCart: () => void;
  setCartOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  setTableNumber: (table: number) => void;
  setSessionId: (sessionId: string) => void;
  getMaxQuantity: (item: MenuItem) => number;
  getBulkPrice: (item: MenuItem, quantity: number) => number;
  addOrderToHistory: (order: OrderHistoryItem) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear corrupted localStorage data
        localStorage.removeItem('restaurant-cart');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      // Only save if cart is not empty or if we're clearing it
      if (state.items.length > 0 || state.totalItems === 0) {
        localStorage.setItem('restaurant-cart', JSON.stringify(state));
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state, isInitialized]);

  // Add a function to reset cart completely
  const resetCart = () => {
    localStorage.removeItem('restaurant-cart');
    dispatch({ type: 'CLEAR_CART' });
  };

  const addToCart = (item: MenuItem, quantity: number) => {
    dispatch({ type: 'ADD_TO_CART', payload: { item, quantity } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setCartOpen = (open: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open });
  };

  const setCheckoutOpen = (open: boolean) => {
    dispatch({ type: 'SET_CHECKOUT_OPEN', payload: open });
  };

  const setTableNumber = (table: number) => {
    dispatch({ type: 'SET_TABLE_NUMBER', payload: table });
  };

  const setSessionId = (sessionId: string) => {
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
  };

  const getMaxQuantity = (item: MenuItem): number => {
    return item.maxQuantity || 10; // Default to 10 if not specified
  };

  const getBulkPrice = (item: MenuItem, quantity: number): number => {
    return calculateBulkPrice(item, quantity);
  };

  const addOrderToHistory = (order: OrderHistoryItem) => {
    dispatch({ type: 'ADD_ORDER_TO_HISTORY', payload: order });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        resetCart,
        setCartOpen,
        setCheckoutOpen,
        setTableNumber,
        setSessionId,
        getMaxQuantity,
        getBulkPrice,
        addOrderToHistory,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
