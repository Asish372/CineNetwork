import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const authService = {
  signup: async (userData: any) => {
    // This is now just for legacy or if we want to skip OTP (not used in new flow)
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
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
      await AsyncStorage.setItem('token', response.data.token);
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
      await AsyncStorage.setItem('token', response.data.token);
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
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    // Fallback: try to fetch from API if token exists
    const token = await AsyncStorage.getItem('token');
    if (token) {
        return await authService.getMe();
    }
    return null;
  }
};

export default authService;
