import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doctorApi } from '../services/doctorApi';
import { DoctorProfile } from '../types';

interface DoctorContextType {
  doctor: DoctorProfile | null;
  isLoading: boolean;
  updateProfile: () => Promise<void>;
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

  return (
    <DoctorContext.Provider value={{ doctor, isLoading, updateProfile }}>
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
