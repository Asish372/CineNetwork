// src/components/themed-text.tsx
import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { Colors } from '../../src/constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

type Props = TextProps & {
  type?: 'title' | 'default' | 'defaultSemiBold' | 'link';
  style?: StyleProp<TextStyle>;
};

export const ThemedText: React.FC<Props> = ({ children, type = 'default', style, ...rest }) => {
  const { colors } = useColorScheme();
  let fontWeight: TextStyle['fontWeight'] = '400';
  let color = colors?.text ?? '#000';

  if (type === 'title') fontWeight = '700';
  if (type === 'defaultSemiBold') fontWeight = '600';
  if (type === 'link') color = colors?.primary ?? '#1e90ff';

  return (
    <Text {...rest} style={[{ color, fontWeight }, style]}>
      {children}
    </Text>
  );
};

export default ThemedText;
