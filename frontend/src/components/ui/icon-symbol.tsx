// src/components/ui/icon-symbol.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  name?: string;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export const IconSymbol: React.FC<Props> = ({ name = 'I', size = 20, color = '#fff', onPress, style }) => {
  const content = (
    <View style={[styles.box, { width: size + 8, height: size + 8 }, style]}>
      <Text style={[styles.text, { fontSize: Math.max(10, size - 4), color }]}>{String(name)[0]?.toUpperCase()}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  text: {
    fontWeight: '700',
  },
});

export default IconSymbol;
