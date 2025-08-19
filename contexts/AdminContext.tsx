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
  currentSection: 'dashboard' | 'menu' | 'analytics' | 'feedback' | 'settings' | 'orders' | 'backup';
  sessionExpiry: Date | null;
  token: string | null;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'hi' | 'te';
    notifications: boolean;
    autoRefresh: boolean;
  };
}

type AdminAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AdminUser; token: string } }
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
  getAuthHeaders: () => HeadersInit;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Helper function to set cookie with safer defaults
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const parts = [
    `${name}=${value}`,
    `expires=${expires.toUTCString()}`,
    'path=/',
    'SameSite=Lax',
  ];
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    parts.push('Secure');
  }
  document.cookie = parts.join(';');
};

// Helper function to get cookie
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper function to delete cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

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
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
        sessionExpiry: null
      };

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
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
  isLoading: true, // Start with loading true
  error: null,
  currentSection: 'dashboard',
  sessionExpiry: null,
  token: null,
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
        // Check for JWT token in cookie
        const token = getCookie('admin-token');
        const sessionData = localStorage.getItem('adminSession');
        
        if (token && sessionData) {
          const session = JSON.parse(sessionData);
          const expiry = new Date(session.expiry);
          
          if (expiry > new Date()) {
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { 
                user: session.user, 
                token: token 
              } 
            });
          } else {
            // Session expired
            localStorage.removeItem('adminSession');
            deleteCookie('admin-token');
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          // No valid session
          localStorage.removeItem('adminSession');
          deleteCookie('admin-token');
          dispatch({ type: 'LOGOUT' });
        }
        // Set loading to false after checking session
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error checking admin session:', error);
        localStorage.removeItem('adminSession');
        deleteCookie('admin-token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkExistingSession();
  }, []);

  // Session expiry checker
  useEffect(() => {
    if (state.sessionExpiry) {
      const interval = setInterval(() => {
        if (state.sessionExpiry && new Date() > state.sessionExpiry) {
          // Handle session expiry
          dispatch({ type: 'LOGOUT' });
          localStorage.removeItem('adminSession');
          deleteCookie('admin-token');
          router.push('/admin/login');
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [state.sessionExpiry, router]);

  // Save session to localStorage when authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.sessionExpiry && state.token) {
      const sessionData = {
        user: state.user,
        expiry: state.sessionExpiry.toISOString(),
        preferences: state.preferences
      };
      localStorage.setItem('adminSession', JSON.stringify(sessionData));
      setCookie('admin-token', state.token, 1); // 1 day
    }
  }, [state.isAuthenticated, state.user, state.sessionExpiry, state.token, state.preferences]);

  // Login function
  const login = useCallback(async (username: string, password: string) => {
    console.log('Login attempt for:', username);
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

      console.log('Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, user data:', data.user);
        console.log('Login successful, token received:', !!data.token);
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            user: data.user, 
            token: data.token 
          } 
        });
      } else {
        const errorData = await response.json();
        console.log('Login failed:', errorData);
        dispatch({ type: 'LOGIN_FAILURE', payload: errorData.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Network error. Please try again.' });
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    console.log('Logout called - clearing state and redirecting');
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('adminSession');
    deleteCookie('admin-token');
    console.log('Logout - redirecting to login page');
    
    // Small delay to ensure state is cleared before redirect
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 100);
  }, []);

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
    return !!(state.isAuthenticated && state.sessionExpiry && new Date() < state.sessionExpiry);
  }, [state.isAuthenticated, state.sessionExpiry]);

  // Get authentication headers for API requests
  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    return headers;
  }, [state.token]);

  const value: AdminContextType = {
    state,
    login,
    logout,
    setSection,
    setPreferences,
    clearError,
    checkAuth,
    getAuthHeaders
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