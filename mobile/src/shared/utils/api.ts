/**
 * API Configuration
 * Axios instance with base URL, interceptors, and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the API - change this to your server URL
const API_BASE_URL = 'http://10.0.2.2:5000/api/customer'; // Android Emulator
// const API_BASE_URL = 'http://10.0.2.2:5001/api/customer'; // Android Emulator
// const API_BASE_URL = 'http://localhost:5001/api/customer'; // iOS Simulator
// const API_BASE_URL = 'http://YOUR_IP:5000/api/customer'; // Physical Device

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response errors (401 unauthorized, etc.)
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
