'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Admin State Types
interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: string[];
  lastLogin: Date;
}

interface AdminState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  currentSection: 'dashboard' | 'menu' | 'analytics' | 'feedback' | 'settings' | 'orders';
  sessionExpiry: Date | null;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'hi' | 'te';
    notifications: boolean;
    autoRefresh: boolean;
  };
}

type AdminAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AdminUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_SECTION'; payload: AdminState['currentSection'] }
  | { type: 'SET_PREFERENCES'; payload: Partial<AdminState['preferences']> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Admin Context
interface AdminContextType {
  state: AdminState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setSection: (section: AdminState['currentSection']) => void;
  setPreferences: (preferences: Partial<AdminState['preferences']>) => void;
  clearError: () => void;
  checkAuth: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Admin Reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload,
        sessionExpiry: null
      };

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        sessionExpiry: null,
        currentSection: 'dashboard'
      };

    case 'SET_SECTION':
      return {
        ...state,
        currentSection: action.payload
      };

    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

// Initial State
const initialState: AdminState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  currentSection: 'dashboard',
  sessionExpiry: null,
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: true,
    autoRefresh: true
  }
};

// Admin Provider Component
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const sessionData = localStorage.getItem('adminSession');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const expiry = new Date(session.expiry);
          
          if (expiry > new Date()) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: session.user });
          } else {
            // Session expired
            localStorage.removeItem('adminSession');
            dispatch({ type: 'LOGOUT' });
          }
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
        localStorage.removeItem('adminSession');
      }
    };

    checkExistingSession();
  }, []);

  // Session expiry checker
  useEffect(() => {
    if (state.sessionExpiry) {
      const interval = setInterval(() => {
        if (state.sessionExpiry && new Date() > state.sessionExpiry) {
          logout();
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [state.sessionExpiry]);

  // Save session to localStorage when authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.sessionExpiry) {
      const sessionData = {
        user: state.user,
        expiry: state.sessionExpiry.toISOString(),
        preferences: state.preferences
      };
      localStorage.setItem('adminSession', JSON.stringify(sessionData));
    }
  }, [state.isAuthenticated, state.user, state.sessionExpiry, state.preferences]);

  // Login function
  const login = useCallback(async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Call admin login API
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      } else {
        const errorData = await response.json();
        dispatch({ type: 'LOGIN_FAILURE', payload: errorData.message || 'Login failed' });
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Network error. Please try again.' });
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('adminSession');
    router.push('/admin');
  }, [router]);

  // Set current section
  const setSection = useCallback((section: AdminState['currentSection']) => {
    dispatch({ type: 'SET_SECTION', payload: section });
  }, []);

  // Set preferences
  const setPreferences = useCallback((preferences: Partial<AdminState['preferences']>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preferences });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check if user is authenticated
  const checkAuth = useCallback(() => {
    return state.isAuthenticated && state.sessionExpiry && new Date() < state.sessionExpiry;
  }, [state.isAuthenticated, state.sessionExpiry]);

  const value: AdminContextType = {
    state,
    login,
    logout,
    setSection,
    setPreferences,
    clearError,
    checkAuth
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

// Admin Hook
export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
} 