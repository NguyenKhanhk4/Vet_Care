/**
 * Customer Context
 * Manages authentication state and user data for the customer role
 * Provides login, register, logout functions
 * Persists auth state with AsyncStorage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../shared/utils/api';
import { User, AuthResponse, ApiResponse } from '../../../shared/types';

// Context State Interface
interface CustomerContextState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  updateUser: (userData: User) => void;
  clearError: () => void;
}

// Create Context
const CustomerContext = createContext<CustomerContextState | undefined>(undefined);

// Provider Component
export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on app start
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is already authenticated (persisted session)
   */
  const checkAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      });

      const { user: userData, token: authToken } = response.data.data;

      // Save to state
      setUser(userData);
      setToken(authToken);

      // Persist to storage
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new customer account
   */
  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
        name,
        email,
        password,
        phone,
      });

      const { user: userData, token: authToken } = response.data.data;

      // Save to state
      setUser(userData);
      setToken(authToken);

      // Persist to storage
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout - clear state and storage
   */
  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  /**
   * Request password reset
   */
  const forgotPassword = async (email: string): Promise<string> => {
    try {
      setError(null);

      const response = await api.post<ApiResponse<null>>('/auth/forgot-password', {
        email,
      });

      return response.data.message || 'Password reset instructions sent';
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to send reset instructions.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Update user data in state and storage
   */
  const updateUser = (userData: User) => {
    setUser(userData);
    AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  const value: CustomerContextState = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    updateUser,
    clearError,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

/**
 * Custom hook to use CustomerContext
 * Throws error if used outside CustomerProvider
 */
export const useCustomer = (): CustomerContextState => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

export default CustomerContext;
