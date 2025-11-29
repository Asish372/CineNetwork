// src/components/haptic-tab.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
// Optional: for real haptics install expo-haptics and uncomment
// import * as Haptics from 'expo-haptics';

type Props = {
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export const HapticTab: React.FC<Props> = ({ label = '', onPress, style }) => {
  const handlePress = () => {
    try {
      // If you install expo-haptics, you can use:
      // Haptics.selectionAsync();
    } catch (e) {
      // ignore if not installed
    }
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#fff',
  },
});

export default HapticTab;

