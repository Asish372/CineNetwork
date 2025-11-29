import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import ReelsDetails from '../src/components/ReelsDetails';
import ReelsPlayer from '../src/components/ReelsPlayer';
import { ALL_SHORTS } from '../src/data/mockData';

const { width, height } = Dimensions.get('window');

export default function ReelsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialId = params.initialId as string;
  const [showPlayer, setShowPlayer] = useState(false);

  // Find index of the initial video
  const initialIndex = ALL_SHORTS.findIndex(item => item.id === initialId);
  const startIndex = initialIndex !== -1 ? initialIndex : 0;
  const selectedItem = ALL_SHORTS[startIndex];

  const handlePlay = () => {
    setShowPlayer(true);
  };

  if (showPlayer) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ReelsPlayer data={ALL_SHORTS} initialIndex={startIndex} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ReelsDetails item={selectedItem} onPlay={handlePlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
