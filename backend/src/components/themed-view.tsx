// src/components/themed-view.tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from '../hooks/use-color-scheme';

export const ThemedView: React.FC<ViewProps> = ({ children, style, ...rest }) => {
  const { colors } = useColorScheme();
  return (
    <View style={[{ backgroundColor: colors?.background ?? '#fff' }, style]} {...rest}>
      {children}
    </View>
  );
};

export default ThemedView;
