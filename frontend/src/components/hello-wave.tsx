// src/components/hello-wave.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HelloWave: React.FC<{ style?: any }> = ({ style }) => {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.text}>👋 Hello!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: '700',
  },
});

export default HelloWave;
