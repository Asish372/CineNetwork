import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function Loader({ isLoading }: { isLoading: boolean }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      const animateDot = (anim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              delay: delay,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateDot(dot1, 0);
      animateDot(dot2, 200);
      animateDot(dot3, 400);
    } else {
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  const getDotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, getDotStyle(dot1)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot2)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot3)]} />
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent black to darken the blur slightly
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E50914', // Brand red color
  },
});
