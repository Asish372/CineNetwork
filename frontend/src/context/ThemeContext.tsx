import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  text: string;
  textSecondary: string;
  card: string;
  border: string;
  primary: string;
  tabBar: string;
  tabBarBorder: string;
}

export const lightTheme: ThemeColors = {
  background: '#f5f5f5',
  text: '#000000',
  textSecondary: '#666666',
  card: '#ffffff',
  border: '#e0e0e0',
  primary: '#E50914',
  tabBar: '#ffffff',
  tabBarBorder: '#e0e0e0',
};

export const darkTheme: ThemeColors = {
  background: '#000000',
  text: '#ffffff',
  textSecondary: '#aaaaaa',
  card: '#1a1a1a',
  border: '#333333',
  primary: '#E50914',
  tabBar: 'rgba(0,0,0,0.9)',
  tabBarBorder: 'rgba(255,255,255,0.1)',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark

  useEffect(() => {
    // Load saved theme or default to dark
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDarkMode: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
