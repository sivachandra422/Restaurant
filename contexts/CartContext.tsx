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
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { item: MenuItem; quantity: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'SET_CHECKOUT_OPEN'; payload: boolean }
  | { type: 'SET_TABLE_NUMBER'; payload: number }
  | { type: 'LOAD_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isCartOpen: false,
  isCheckoutOpen: false,
  tableNumber: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  console.log('CartReducer - Action:', action.type, 'payload:', 'payload' in action ? action.payload : 'no payload');
  console.log('CartReducer - Current State:', state);

  let newState: CartState;

  switch (action.type) {
    case 'ADD_TO_CART': {
      const { item, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(cartItem => cartItem.id === item.id);

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Enforce max quantity per item
        const newQuantity = Math.min(state.items[existingItemIndex].quantity + quantity, 10);
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? {
                ...cartItem,
                quantity: newQuantity,
                subtotal: newQuantity * cartItem.price,
              }
            : cartItem
        );
      } else {
        // Enforce max quantity per item
        const safeQuantity = Math.min(quantity, 10);
        const newItem: CartItem = {
          ...item,
          quantity: safeQuantity,
          subtotal: item.price * safeQuantity,
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
      
      // Enforce min 1, max 10
      if (quantity < 1) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: itemId });
      }
      if (quantity > 10) {
        return state; // Ignore if above max
      }

      const newItems = state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, subtotal: item.price * quantity }
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
      const newItems = state.items.filter(item => item.id !== action.payload);
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

    case 'CLEAR_CART':
      newState = {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
      break;

    case 'SET_CART_OPEN':
      newState = { ...state, isCartOpen: action.payload };
      break;

    case 'SET_CHECKOUT_OPEN':
      newState = { ...state, isCheckoutOpen: action.payload };
      break;

    case 'SET_TABLE_NUMBER':
      newState = { ...state, tableNumber: action.payload };
      break;

    case 'LOAD_CART':
      newState = action.payload;
      break;

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
  setCartOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  setTableNumber: (table: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Debug log for state changes within provider
  useEffect(() => {
    console.log('CartProvider - Internal State Changed:', state);
  }, [state]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('sriKanyaCart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        } catch (error) {
          console.warn('Cart: Error parsing cart from localStorage:', error);
          localStorage.removeItem('sriKanyaCart'); // Remove corrupted cart
        }
      }
    } catch (error) {
      console.warn('Cart: Error accessing localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sriKanyaCart', JSON.stringify(state));
    } catch (error) {
      console.warn('Cart: Error saving cart to localStorage (maybe quota exceeded):', error);
    }
  }, [state]);

  const addToCart = (item: MenuItem, quantity: number) => {
    console.log('CartProvider - addToCart called:', item.name, quantity);
    dispatch({ type: 'ADD_TO_CART', payload: { item, quantity } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    console.log('CartProvider - updateQuantity called:', itemId, quantity);
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const removeFromCart = (itemId: string) => {
    console.log('CartProvider - removeFromCart called:', itemId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const clearCart = () => {
    console.log('CartProvider - clearCart called');
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

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setCartOpen,
        setCheckoutOpen,
        setTableNumber,
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
