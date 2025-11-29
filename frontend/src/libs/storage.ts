// src/libs/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.warn('saveToken error', err);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    return t;
  } catch (err) {
    console.warn('getToken error', err);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.warn('removeToken error', err);
  }
};
