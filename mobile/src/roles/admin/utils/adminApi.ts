import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROOT_API_URL } from '../../../shared/utils/api';

// Derive the Admin API URL from the base one
const ADMIN_API_BASE_URL = `${ROOT_API_URL}/admin`;

const adminApi = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting admin token:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('adminToken');
      await AsyncStorage.removeItem('adminUser');
    }
    return Promise.reject(error);
  }
);

export default adminApi;
