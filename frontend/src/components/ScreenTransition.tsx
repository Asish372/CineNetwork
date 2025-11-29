import React from 'react';
import { Dimensions, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    withDelay,
    withTiming
} from 'react-native-reanimated';

interface ScreenTransitionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

const { width } = Dimensions.get('window');

export default function ScreenTransition({ children, style, delay = 0 }: ScreenTransitionProps) {
  // Custom Entering: Slide in from Right (30% of screen) + Fade In
  const enteringAnimation = (targetValues: any) => {
    'worklet';
    return {
      initialValues: {
        opacity: 0,
        transform: [
          { translateX: width * 0.3 }, // Start 30% to the right for a smooth, non-jarring slide
        ],
      },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })),
        transform: [
          { translateX: withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })) },
        ],
      },
    };
  };

  // Custom Exiting: Slide out to Right + Fade Out
  const exitingAnimation = (values: any) => {
    'worklet';
    return {
      initialValues: {
        opacity: 1,
        transform: [{ translateX: 0 }],
      },
      animations: {
        opacity: withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) }),
        transform: [
          { translateX: withTiming(width * 0.3, { duration: 300, easing: Easing.in(Easing.cubic) }) },
        ],
      },
    };
  };

  return (
    <Animated.View 
      style={[styles.container, style]} 
      entering={enteringAnimation}
      exiting={exitingAnimation}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Keep background black to avoid white flashes
  },
});
