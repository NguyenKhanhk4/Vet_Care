import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'ios' ? 'http://localhost:5001/api/doctor' : 'http://10.0.2.2:5001/api/doctor';
const SERVER_URL = Platform.OS === 'ios' ? 'http://localhost:5001' : 'http://10.0.2.2:5001';

export const getImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const doctorApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
doctorApi.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('doctorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
