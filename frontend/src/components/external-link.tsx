// src/components/external-link.tsx
import React from 'react';
import { Linking, Text, TouchableOpacity } from 'react-native';

type Props = {
  href: string;
  children: React.ReactNode;
};

export const ExternalLink: React.FC<Props> = ({ href, children }) => {
  const open = async () => {
    try {
      await Linking.openURL(href);
    } catch (e) {
      console.warn('Cannot open link', href, e);
    }
  };

  return (
    <TouchableOpacity onPress={open} activeOpacity={0.7}>
      <Text style={{ color: '#1e90ff' }}>{children}</Text>
    </TouchableOpacity>
  );
};

export default ExternalLink;
