import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(1)).current; // Start visible
  const scale = useRef(new Animated.Value(1)).current; // Start at 1 (seamless)
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate scale slightly to breathe, and fade in text
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.05, // Slight zoom
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      router.replace('/auth/login');
    }, 2000); // Slightly longer to enjoy the animation

    return () => clearTimeout(t);
  }, [opacity, scale, textOpacity, router]);

  return (
    <LinearGradient
      colors={['#E6F4FE', '#FFFFFF', '#E6F4FE']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <Image
          source={require('../../assets/images/splash-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>Short movies • Stories • Reels</Text>

        {/* Stylish Loader */}
        <View style={styles.loaderContainer}>
          <BouncingDot delay={0} />
          <BouncingDot delay={200} />
          <BouncingDot delay={400} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoWrap: {
    width: 180,
    height: 180,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Optional: Add shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    marginTop: 10,
    color: '#333', // Darker text for light background
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    flexDirection: 'row',
    marginTop: 40,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF', // Modern blue
  },
});

// Simple Bouncing Dot Component
function BouncingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: -10,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(100),
      ])
    ).start();
  }, [delay]); // Although delay isn't used in the loop directly, we can use it to stagger start if needed, but here we just start immediately.
  // Actually, let's use delay to stagger the start time properly.

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{ translateY: anim }],
        },
      ]}
    />
  );
}
