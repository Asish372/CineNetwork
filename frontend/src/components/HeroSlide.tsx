import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface HeroSlideProps {
  item: any;
  onPlay: () => void;
  onStop: () => void;
  onDetailsPress: () => void;
}

export default function HeroSlide({ item, onPlay, onStop, onDetailsPress }: HeroSlideProps) {
  return (
    <View style={styles.slide}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={onDetailsPress}
          style={styles.contentContainer}
        >
          <Image
            source={{ uri: item.thumbnailUrl || item.image }}
            style={styles.heroImage}
            contentFit="cover"
          />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)', '#000']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{item.title}</Text>
              <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: width,
    height: 280,
    backgroundColor: '#000',
  },
  contentContainer: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 50,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  heroSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 25,
    fontWeight: '500',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    // Bubble 3D Effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
