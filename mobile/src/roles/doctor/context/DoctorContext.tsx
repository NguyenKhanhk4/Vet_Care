import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doctorApi } from '../services/doctorApi';
import { DoctorProfile } from '../types';

interface DoctorContextType {
  doctor: DoctorProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDoctor();
  }, []);

  const loadDoctor = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('doctorToken');
      if (token) {
        await updateProfile();
      }
    } catch (error) {
      console.log('Load doctor error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    try {
      setIsLoading(true);
      const res = await doctorApi.post('/auth/login', { email, password });
      const { token, doctor: doctorData, user } = res.data.data;
      doctorData.user = user;
      await AsyncStorage.setItem('doctorToken', token);
      setDoctor(doctorData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('doctorToken');
    setDoctor(null);
  };

  const updateProfile = async () => {
    try {
      const res = await doctorApi.get('/profile');
      const { user, doctor: doctorData } = res.data.data;
      doctorData.user = user;
      setDoctor(doctorData);
    } catch (error) {
      console.log('Update profile error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await doctorApi.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Yêu cầu thất bại');
    }
  };

  return (
    <DoctorContext.Provider value={{ doctor, isLoading, login, logout, updateProfile, forgotPassword }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};
