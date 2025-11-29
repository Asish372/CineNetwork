import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../src/context/ThemeContext';
import authService from '../src/services/authService';

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
    // Configure Audio
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.error('Failed to configure audio:', e);
      }
    };
    configureAudio();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (e) {
        console.error('Auth check failed:', e);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loaded || !rootNavigationState?.key || isAuthenticated === null) return;

    const inits = async () => {
      if (isAuthenticated) {
        // If authenticated, go to tabs
        router.replace('/(tabs)');
        SplashScreen.hideAsync();
      } else {
        // If not authenticated, redirect to login
        router.replace('/auth/login');
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
