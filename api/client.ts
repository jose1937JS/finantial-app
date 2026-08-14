import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// In a real app, this should be an environment variable. Using localhost for development.
// Ensure you replace this with your actual backend URL (e.g., your network IP for React Native testing).
let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

if (Platform.OS === 'android') {
  if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    const hostUri = Constants.expoConfig?.hostUri;
    const hostIp = hostUri ? hostUri.split(':')[0] : null;
    if (hostIp) {
      API_BASE_URL = API_BASE_URL.replace('localhost', hostIp).replace('127.0.0.1', hostIp);
    } else {
      API_BASE_URL = API_BASE_URL.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
    }
  }
}

// console.log('Resolved API Base URL for platform:', Platform.OS, '->', API_BASE_URL);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching auth token from AsyncStorage', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., token expired)
      // Implementation depends on auth state management
      // Example: clear token and redirect
      // Optionally trigger an event to log the user out via Zustand or similar
      try {
        const { useAuthStore } = require('@/store/auth-store');
        useAuthStore.getState().logout();
        router.replace('/(auth)/login');
      } catch (e) {
        console.error('Failed to logout dynamically', e);
      }
    }
    return Promise.reject(error);
  }
);
