import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../../shared/context/AuthContext';
import adminApi from '../utils/adminApi';
import { AdminUser, AdminAuthResponse } from '../types/admin.types';

interface AdminContextProps {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  isLoading: boolean;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextProps>({
  isAdminAuthenticated: false,
  adminUser: null,
  isLoading: true,
  loginAdmin: async () => false,
  logoutAdmin: async () => {},
});

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { logoutUnified } = React.useContext(AuthContext);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check auth state on load
  useEffect(() => {
    checkAdminAuthState();
  }, []);

  const checkAdminAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const userJson = await AsyncStorage.getItem('adminUser');

      if (token && userJson) {
        setAdminUser(JSON.parse(userJson));
        setIsAdminAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking admin auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await adminApi.post('/auth/login', { email, password });
      
      const { data } = response.data as AdminAuthResponse;
      
      if (data && data.user && data.token) {
        if (data.user.role !== 'admin') {
          return false;
        }
        
        await AsyncStorage.setItem('adminToken', data.token);
        await AsyncStorage.setItem('adminUser', JSON.stringify(data.user));
        
        setAdminUser(data.user);
        setIsAdminAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const logoutAdmin = async () => {
    try {
      await logoutUnified(); // Clears all unified tokens
      setAdminUser(null);
      setIsAdminAuthenticated(false);
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        adminUser,
        isLoading,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
