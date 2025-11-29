// src/components/parallax-scroll-view.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';

type Props = {
  headerBackgroundColor?: any;
  headerImage?: React.ReactNode;
  children?: React.ReactNode;
};

const ParallaxScrollView: React.FC<Props> = ({ headerBackgroundColor, headerImage, children }) => {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Simple header placeholder */}
      <View style={{ height: 160, backgroundColor: headerBackgroundColor?.light || '#ddd', alignItems: 'center', justifyContent: 'center' }}>
        {headerImage}
      </View>
      <View style={{ padding: 16 }}>{children}</View>
    </ScrollView>
  );
};

export default ParallaxScrollView;
