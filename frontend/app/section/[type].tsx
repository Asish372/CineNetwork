import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenTransition from '../../src/components/ScreenTransition';
import { NEW_RELEASES, TRENDING_NOW } from '../../src/data/mockData';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - 40) / COLUMN_COUNT - 10;

export default function SectionScreen() {
  const router = useRouter();
  const { type, title } = useLocalSearchParams();
  
  // Determine data based on type
  const getData = () => {
    switch (type) {
      case 'trending':
        return TRENDING_NOW;
      case 'new':
        return NEW_RELEASES;
      default:
        return TRENDING_NOW;
    }
  };

  const data = getData();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/player/[id]',
        params: { 
          id: item.id,
          title: item.title,
          subtitle: title as string,
          video: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4', // Dummy video
          likes: '5.5K',
          comments: '200'
        }
      })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.cardGradient}
      >
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScreenTransition>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title || 'Section'}</Text>
            <View style={{ width: 40 }} /> 
          </View>

          {/* Grid Content */}
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={COLUMN_COUNT}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'flex-end',
    padding: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
