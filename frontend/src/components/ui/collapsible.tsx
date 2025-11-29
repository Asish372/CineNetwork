// src/components/ui/collapsible.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';

type Props = {
  title?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const Collapsible: React.FC<Props> = ({ title = '', children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggle} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.indicator}>{open ? '-' : '+'}</Text>
      </TouchableOpacity>
      {open ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  header: { paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '600' },
  indicator: { fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 12, paddingBottom: 10 },
});

export default Collapsible;
