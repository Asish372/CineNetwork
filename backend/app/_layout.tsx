import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../src/context/ThemeContext';

// keep the native splash visible until we decide
SplashScreen.preventAutoHideAsync().catch(() => { /* ignore */ });

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const router = useRouter();

  const rootNavigationState = useRootNavigationState();



  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      // For now, we'll assume not authenticated to show the login screen as requested
      // In a real app, check AsyncStorage or Auth Context
      // Adding a small delay to simulate async and allow hydration
      setTimeout(() => {
        setIsAuthenticated(false);
      }, 500); // Increased delay slightly to ensure smoothness
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loaded || !rootNavigationState?.key || isAuthenticated === null) return;

    const inits = async () => {
      if (isAuthenticated === false) {
        // If not authenticated, redirect to login
        router.replace('/auth/login');
        // Hide splash screen after a short delay to allow navigation to complete
        // This prevents the "flash" of the home screen
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 200);
      } else {
        // If authenticated, just hide splash screen
        SplashScreen.hideAsync();
      }
    };

    inits();
  }, [loaded, isAuthenticated, rootNavigationState]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'none',
          presentation: 'transparentModal', // This helps with the transparency/overlay effect if needed, but 'card' is standard. 'none' is key.
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
          <Stack.Screen name="reels" options={{ headerShown: false }} />
          <Stack.Screen name="player/[id]" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
