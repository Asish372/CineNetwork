import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../src/context/ThemeContext';
import authService from '../src/services/authService';
import VideoSplash from '../components/VideoSplash';

// keep the native splash visible until we decide
SplashScreen.preventAutoHideAsync().catch(() => { /* ignore */ });

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [isSplashFinished, setIsSplashFinished] = useState(false);
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

    if (isSplashFinished) {
      const inits = async () => {
        if (isAuthenticated) {
          // If authenticated, go to tabs
          router.replace('/(tabs)');
        } else {
          // If not authenticated, redirect to login
          router.replace('/auth/login');
        }
      };
      inits();
    }
  }, [loaded, isAuthenticated, rootNavigationState, isSplashFinished]);

  if (!loaded) {
    return null;
  }

  if (!isSplashFinished) {
    return (
      <VideoSplash 
        onFinish={() => {
          setIsSplashFinished(true);
        }} 
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'none',
          presentation: 'transparentModal', 
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
