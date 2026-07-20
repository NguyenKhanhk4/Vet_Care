import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_HOST = 'https://vet-care-g0hz.onrender.com';
const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;
const BASE_URL = `${SERVER_URL}/api/doctor`;

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
