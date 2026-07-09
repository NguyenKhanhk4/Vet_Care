import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

// Create a generic auth instance pointing to the base /api/auth
const authApi = axios.create({
  baseURL: API_BASE_URL.replace('/customer', ''), // this makes it http://localhost:5001/api
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UserAuth {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'doctor';
  isActive: boolean;
  [key: string]: any;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: UserAuth | null;
  role: 'guest' | 'customer' | 'admin' | 'doctor';
  isLoading: boolean;
  loginUnified: (email: string, password: string) => Promise<boolean>;
  logoutUnified: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  role: 'guest',
  isLoading: true,
  loginUnified: async () => false,
  logoutUnified: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserAuth | null>(null);
  const [role, setRole] = useState<'guest' | 'customer' | 'admin' | 'doctor'>('guest');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check for unified token and user
      const token = await AsyncStorage.getItem('token');
      const userJson = await AsyncStorage.getItem('user');

      if (token && userJson) {
        const parsedUser = JSON.parse(userJson) as UserAuth;
        setUser(parsedUser);
        setRole(parsedUser.role);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUnified = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.post('/auth/login', { email, password });
      
      const { data } = response.data;
      
      if (data && data.user && data.token) {
        // Store globally
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        
        // Also store to specific role tokens for backward compatibility with their Axios instances
        if (data.user.role === 'admin') {
          await AsyncStorage.setItem('adminToken', data.token);
          await AsyncStorage.setItem('adminUser', JSON.stringify(data.user));
        }

        setUser(data.user);
        setRole(data.user.role);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logoutUnified = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('adminToken');
      await AsyncStorage.removeItem('adminUser');
      
      setUser(null);
      setRole('guest');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        isLoading,
        loginUnified,
        logoutUnified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
