import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { Platform } from 'react-native';

// Helper to store token securely
const setToken = async (token: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('token', token);
  } else {
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync('token', token);
    } catch (e) {
      console.error('SecureStore setItem error:', e);
    }
  }
};

export const authService = {
  signup: async (userData: any) => {
    // This is now just for legacy or if we want to skip OTP (not used in new flow)
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      await setToken(response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  sendSignupOtp: async (userData: any) => {
    const response = await api.post('/auth/send-signup-otp', userData);
    return response.data;
  },

  verifySignup: async (userData: any, otp: string) => {
    const response = await api.post('/auth/verify-signup', { ...userData, otp });
    // Do not store token here, as we want to force login after signup
    return response.data;
  },

  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      await setToken(response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  sendLoginOtp: async (phone: string) => {
    const response = await api.post('/auth/send-login-otp', { phone });
    return response.data;
  },

  verifyLoginOtp: async (phone: string, otp: string) => {
    const response = await api.post('/auth/verify-login-otp', { phone, otp });
    if (response.data.token) {
      await setToken(response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  sendForgotPasswordOtp: async (email: string) => {
    const response = await api.post('/auth/forgot-password/send-otp', { email });
    return response.data;
  },

  verifyForgotPasswordOtp: async (email: string, otp: string) => {
    const response = await api.post('/auth/forgot-password/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (data: any) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  getMe: async () => {
    try {
      const token = await authService.getToken();
      if (!token) return null; // No token, no need to call API
      
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      // If 401, just return null (Guest or Expired), don't log scary error
      if (error.response && error.response.status === 401) {
          return null;
      }
      console.log('Error fetching user profile:', error.message);
      return null;
    }
  },

  logout: async () => {
    if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('token');
    } else {
        try {
          const SecureStore = require('expo-secure-store');
          await SecureStore.deleteItemAsync('token');
        } catch (e) {
          console.error('SecureStore delete error:', e);
        }
    }
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  getToken: async () => {
    if (Platform.OS === 'web') {
        return await AsyncStorage.getItem('token');
    }
    try {
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync('token');
    } catch (e) {
      return null;
    }
  }
};

export default authService;
