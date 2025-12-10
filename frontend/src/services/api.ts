import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Replace with your local IP address or use Env Var
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.103:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  async (config) => {
    // Avoid circular dependency by importing dynamically or ensuring authService is light
    // Better: Retrieve token directly here or use a lightweight helper
    let token;
      try {
          if (require('react-native').Platform.OS === 'web') {
              token = await AsyncStorage.getItem('token');
          } else {
              // Dynamically import SecureStore to safely handle it
              try {
                const SecureStore = require('expo-secure-store');
                token = await SecureStore.getItemAsync('token');
              } catch (e) {
                console.warn('SecureStore not available:', e);
              }
          }
      } catch (e) {
          console.log('Error getting token', e);
      }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors (Auto-logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - Clear storage
      await AsyncStorage.removeItem('user');
      if (require('react-native').Platform.OS === 'web') {
          await AsyncStorage.removeItem('token');
      } else {
          try {
            const SecureStore = require('expo-secure-store');
            await SecureStore.deleteItemAsync('token');
          } catch(e) {}
      }
    }
    return Promise.reject(error);
  }
);

export default api;
