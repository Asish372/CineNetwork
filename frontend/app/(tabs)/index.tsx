import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

const { width } = Dimensions.get('window');

import {
    ACTION_MOVIES,
    CATEGORIES,
    COMEDY_MOVIES,
    CONTINUE_WATCHING,
    DOCUMENTARIES,
    HERO_SLIDES,
    HORROR_MOVIES,
    NEW_RELEASES,
    SCIFI_MOVIES,
    TRENDING_NOW
} from '../../src/data/mockData';

import HeroSlide from '../../src/components/HeroSlide';
import Loader from '../../src/components/Loader';
import NotificationPanel from '../../src/components/NotificationPanel';
import ScreenTransition from '../../src/components/ScreenTransition';
import contentService from '../../src/services/contentService';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [newReleasesData, setNewReleasesData] = useState<any[]>([]);
  const [actionData, setActionData] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);

  const scrollViewRef = useRef<ScrollView>(null);
  const notificationAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const categories = await contentService.getHomeContent();
      
      // Map categories to sections
      const trending = categories.find((c: any) => c.title === 'Trending Now')?.Contents || [];
      const newReleases = categories.find((c: any) => c.title === 'New Releases')?.Contents || [];
      const action = categories.find((c: any) => c.title === 'Action Movies')?.Contents || [];
      
      setTrendingData(trending.length > 0 ? trending : TRENDING_NOW);
      setNewReleasesData(newReleases.length > 0 ? newReleases : NEW_RELEASES);
      setActionData(action.length > 0 ? action : ACTION_MOVIES);

      // Use Trending for Hero Slides if available
      if (trending.length > 0) {
        setHeroSlides(trending.slice(0, 5));
      } else {
        setHeroSlides(HERO_SLIDES);
      }

    } catch (error) {
      console.error('Failed to load home content:', error);
      // Fallback is already handled by initial state or conditional rendering logic if we want
      setTrendingData(TRENDING_NOW);
      setNewReleasesData(NEW_RELEASES);
      setActionData(ACTION_MOVIES);
      setHeroSlides(HERO_SLIDES);
    } finally {
      setIsLoading(false);
    }
  };

  // Create an extended array with duplicates at both ends for bidirectional infinite scroll
  const slidesToUse = heroSlides.length > 0 ? heroSlides : HERO_SLIDES;
  const extendedSlides = [
    { ...slidesToUse[slidesToUse.length - 1], id: 'duplicate-last' },
    ...slidesToUse,
    { ...slidesToUse[0], id: 'duplicate-first' }
  ];

  // Notification Bell Animation
  React.useEffect(() => {
    const startShake = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(notificationAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
          Animated.timing(notificationAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(notificationAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
          Animated.timing(notificationAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(notificationAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
          Animated.delay(100) // Short pause between shakes
        ])
      ).start();
    };

    startShake();
  }, []);

  const bellRotation = notificationAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg']
  });

  // Initialize scroll position to the first real slide (index 1)
  React.useEffect(() => {
    if (width > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: width, animated: false });
      }, 0);
    }
  }, [width]);

  // Auto-slide logic
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isVideoPlaying) return; // Pause auto-scroll if video is playing

      if (activeSlide < slidesToUse.length - 1) {
        // Move to next slide
        scrollViewRef.current?.scrollTo({
          x: (activeSlide + 2) * width, // +1 for next, +1 for offset
          animated: true,
        });
      } else {
        // Move to duplicate first slide (visually next)
        scrollViewRef.current?.scrollTo({
          x: (slidesToUse.length + 1) * width,
          animated: true,
        });
        // Reset to real first slide after animation
        setTimeout(() => {
           scrollViewRef.current?.scrollTo({
            x: width,
            animated: false,
          });
          setActiveSlide(0);
        }, 500); // Wait for animation to finish
      }
    }, 4000); // 4 seconds interval

    return () => clearInterval(interval);
  }, [activeSlide, width, isVideoPlaying, slidesToUse]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const rawSlide = Math.round(offset / slideWidth);
    
    // Map raw slide index to actual content index (0 to length-1)
    let actualIndex = rawSlide - 1;
    if (actualIndex < 0) actualIndex = slidesToUse.length - 1;
    if (actualIndex >= slidesToUse.length) actualIndex = 0;

    if (actualIndex !== activeSlide) {
      setActiveSlide(actualIndex);
    }
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(offset / slideWidth);

    // If we reached the first duplicate (index 0), jump to the real last slide
    if (slideIndex === 0) {
      scrollViewRef.current?.scrollTo({ 
        x: slideWidth * (extendedSlides.length - 2), 
        animated: false 
      });
    }
    // If we reached the last duplicate (index length-1), jump to the real first slide
    else if (slideIndex === extendedSlides.length - 1) {
      scrollViewRef.current?.scrollTo({ 
        x: slideWidth, 
        animated: false 
      });
    }
  };

  const renderSection = (title: string, data: any[], isHorizontal = true) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal={isHorizontal} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {data.map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            style={styles.cardContainer}
            activeOpacity={0.7}
            onPress={() => router.push({
                pathname: '/details/[id]',
                params: { 
                  id: item.id,
                  title: item.title,
                  subtitle: item.genre || item.subtitle || 'Movie',
                  video: item.videoUrl || item.video || '',
                  image: item.thumbnailUrl || item.image,
                  likes: item.likes ? item.likes.toString() : '10K',
                  comments: '500'
                }
              })}
          >
            <Image
              source={{ uri: item.thumbnailUrl || item.image }}
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
            />
            {/* New Badge for first few items in New Releases */}
            {title === 'New Releases' && index < 2 && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
            {/* VIP Badge for some items */}
            {(index % 3 === 0) && (
              <View style={styles.vipBadge}>
                <Ionicons name="diamond" size={10} color="#000" />
                <Text style={styles.vipText}>VIP</Text>
              </View>
            )}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.cardGradient}
            >
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScreenTransition>
      <View style={styles.container}>
        <Loader isLoading={isLoading} />
        <NotificationPanel 
          isVisible={isNotificationOpen} 
          onClose={() => setIsNotificationOpen(false)} 
        />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <SafeAreaView style={styles.headerContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerContent}>
            <View style={styles.logoRow}>
              <Image
                source={require('../../assets/images/login-logo.png')}
                style={styles.headerLogo}
                contentFit="contain"
              />
              <Text style={styles.headerTitle}>CINE NETWORK</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.subscribeButton}
                activeOpacity={0.8}
                onPress={() => router.push('/auth/login')}
              >
                <LinearGradient
                  colors={['#FFEC8B', '#FFD700', '#FFA500']} // Lighter top for bubble shine
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.subscribeGradient}
                >
                  <Ionicons name="diamond-outline" size={14} color="#000" />
                  <Text style={styles.subscribeText}>Subscribe</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setIsNotificationOpen(true)}
              >
                <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
                  <Ionicons name="notifications-outline" size={24} color="#fff" />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Hero Carousel */}
          <View style={styles.heroContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              onMomentumScrollEnd={onMomentumScrollEnd}
              scrollEventThrottle={16}
              scrollEnabled={!isVideoPlaying}
            >
              {extendedSlides.map((slide, index) => (
                <HeroSlide
                  key={slide.id || index}
                  item={slide}
                  onPlay={() => setIsVideoPlaying(true)}
                  onStop={() => setIsVideoPlaying(false)}
                  onDetailsPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: slide.id,
                      title: slide.title,
                      subtitle: slide.genre || slide.subtitle,
                      video: slide.videoUrl || slide.video,
                      image: slide.thumbnailUrl || slide.image,
                      likes: slide.likes ? slide.likes.toString() : '12.5K',
                      comments: '840'
                    }
                  })}
                />
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {slidesToUse.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    (activeSlide === index || (activeSlide === extendedSlides.length - 1 && index === 0))
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categoriesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {CATEGORIES.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={[styles.categoryChip, index === 0 && styles.activeCategoryChip]}
                >
                  <Text style={[styles.categoryText, index === 0 && styles.activeCategoryText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Continue Watching */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Watching</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {CONTINUE_WATCHING.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.cardContainer} 
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: item.id,
                      title: item.title,
                      subtitle: 'Continue Watching',
                      video: '', // Add video link if available in mock data
                      image: item.image,
                      likes: '5K',
                      comments: '200'
                    }
                  })}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                    contentFit="cover"
                  />
                  {/* Progress Bar Overlay */}
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }}>
                    <View style={{
                      width: `${item.progress * 100}%`,
                      height: '100%',
                      backgroundColor: '#E50914'
                    }} />
                  </View>

                   {/* Play Icon Overlay */}
                   <View style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: [{ translateX: -15 }, { translateY: -15 }],
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#fff'
                  }}>
                    <Ionicons name="play" size={16} color="#fff" style={{ marginLeft: 2 }} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sections */}
          {renderSection('Trending Now', trendingData)}
          {renderSection('New Releases', newReleasesData)}
          {renderSection('Action Movies', actionData)}
          {renderSection('Comedy Hits', COMEDY_MOVIES)}
          {renderSection('Sci-Fi & Fantasy', SCIFI_MOVIES)}
          {renderSection('Documentaries', DOCUMENTARIES)}
          {renderSection('Horror', HORROR_MOVIES)}

        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  subscribeButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  subscribeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Hero Section
  heroContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
    marginTop: 80, // Adjusted for header height
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#E50914',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  // Categories
  categoriesWrapper: {
    marginTop: -10,
    marginBottom: 25,
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    // Bubble 3D Effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeCategoryChip: {
    backgroundColor: '#E50914',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  activeCategoryText: {
    color: '#fff',
  },

  // Sections
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
  cardContainer: {
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
    // Bubble 3D Effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    height: 60,
    justifyContent: 'flex-end',
    padding: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  vipBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  vipText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
