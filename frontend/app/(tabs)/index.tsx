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
    View,
    RefreshControl,
    Alert // Import Alert
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
import { useFocusEffect } from 'expo-router';
import playbackService from '../../src/services/playbackService';
import socketService from '../../src/services/socketService';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic Data States
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [continueWatchingData, setContinueWatchingData] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isVip, setIsVip] = useState(false); // VIP State

  const scrollViewRef = useRef<ScrollView>(null);
  const notificationAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      loadContent();
      
      // Connect to Socket
      socketService.connect();
      
      // Listen for updates
      const unsubscribe = socketService.on('layout_updated', (data: any) => {
        if (data.page === 'home') {
          console.log('Received Home Layout Update!', data);
          Alert.alert('Update Received', 'Refreshing Home Layout...'); // Visible feedback
          loadContent(); // Reload content
        }
      });

      return () => {
        unsubscribe(); // Unsubscribe on blur (optional, or keep generic)
      };
    }, [])
  );

  const loadContent = async () => {
    try {
      setIsLoading(true);
      
      // 0. Check User Status (Fetch fresh from API)
      const user = await import('../../src/services/authService').then(m => m.default.getMe()); // Force DB fetch
      if (user && (user.isVip || user.subscription?.status === 'active')) {
          setIsVip(true);
      } else {
          setIsVip(false);
      }

      // 1. Fetch Dynamic Layout
      const layout = await contentService.getLayout('home');
      
      console.log('Layout Response:', JSON.stringify(layout, null, 2)); // Debug Log
      
      if (layout) {
        setHeroSlides(Array.isArray(layout.heroContent) ? layout.heroContent : []);
        console.log('Hero Slides set:', layout.heroContent?.length); // Debug Log
        
        // Process sections
        const sectionsToProcess = Array.isArray(layout.sections) ? layout.sections : [];
        const processedSections = sectionsToProcess.map((section: any) => {
           // If it's a manual collection, contentIds is already populated
           // If it's auto (trending, new_arrivals), contentIds might be empty or pre-populated by backend
           // For now, we assume the backend populates 'contentIds' even for auto sections when serving the layout
           // OR we might need to fetch them if they are empty. 
           // Based on Admin Panel implementation, 'contentIds' are arrays of objects.
           return section;
        });
        setSections(processedSections);
        console.log('Sections set:', processedSections.length); // Debug Log
      } else {
        // Fallback or Empty State
        setHeroSlides([]);
        setSections([]);
        console.log('No layout found, setting empty');
      }

      // 2. Fetch User Specific Data (Continue Watching)
      if (user) {
          try {
            const cw = await playbackService.syncWithBackend();
            console.log('Continue Watching Data:', cw?.length); // Debug Log
            setContinueWatchingData(cw || []);
          } catch (e) {
            console.log('CW Error', e);
            setContinueWatchingData([]);
          }
      } else {
          setContinueWatchingData([]);
      }

    } catch (error) {
      console.error('Failed to load home content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to merge dynamic sections with user specific data
  const renderDynamicSections = () => {
    return sections.map((section, index) => {
      if (section.type === 'continue_watching') {
         if (continueWatchingData.length === 0) return null;
         return renderContinueWatching(section.title);
      }
      
      // For other sections, we expect 'contentIds' to contain the items
      if (!section.contentIds || section.contentIds.length === 0) return null;
      
      return renderSection(section.title, section.contentIds, section.type);
    });
  };

  // ... (Auto-slide and Animation logic remains same)
  // Create an extended array with duplicates at both ends for bidirectional infinite scroll
  const slidesToUse = Array.isArray(heroSlides) && heroSlides.length > 0 ? heroSlides : [];
  // Only create extended slides if we have slides
  const extendedSlides = slidesToUse.length > 0 ? [
    { ...slidesToUse[slidesToUse.length - 1], id: 'duplicate-last' },
    ...slidesToUse,
    { ...slidesToUse[0], id: 'duplicate-first' }
  ] : [];

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
    if (width > 0 && slidesToUse.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: width, animated: false });
      }, 0);
    }
  }, [width, slidesToUse]);

  // Auto-slide logic
  React.useEffect(() => {
    if (slidesToUse.length === 0) return;
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

  const renderSection = (title: string, data: any[], type: string) => (
    <View key={title} style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/section/[title]', params: { title } })}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal={true} 
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
                  image: item.thumbnailUrl || item.posterUrl || item.image,
                  likes: item.likes ? item.likes.toString() : '10K',
                  comments: '500',
                  isVip: item.isVip ? 'true' : 'false'
                }
              })}
          >
            <Image
              source={{ uri: item.thumbnailUrl || item.posterUrl || item.image }}
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
            />
            
            {/* New Badge for New Arrivals */}
            {type === 'new_arrivals' && index < 3 && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
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

  const renderContinueWatching = (title: string) => (
    <View key="continue-watching" style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.listContent}
      >
        {continueWatchingData.map((item) => {
          if (!item.Content) return null;
          return (
            <TouchableOpacity 
                key={item.id} 
                style={styles.cardContainer} 
                activeOpacity={0.7}
                onPress={() => router.push({
                pathname: '/details/[id]',
                params: { 
                    id: item.Content.id,
                    title: item.Content.title,
                    subtitle: 'Continue Watching',
                    video: item.Content.videoUrl,
                    image: item.Content.thumbnailUrl,
                    likes: '5K',
                    comments: '200',
                    position: item.progress.toString()
                }
                })}
            >
                <Image
                source={{ uri: item.Content.thumbnailUrl }}
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
                    width: `${Math.min((item.progress / 30000) * 100, 100)}%`, 
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
          );
        })}
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
              {!isVip && (
              <TouchableOpacity 
                style={styles.subscribeButton}
                activeOpacity={0.8}
                onPress={() => router.push('/subscription')}
              >
                <LinearGradient
                  colors={['#FFEC8B', '#FFD700', '#FFA500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.subscribeGradient}
                >
                  <Ionicons name="diamond-outline" size={14} color="#000" />
                  <Text style={styles.subscribeText}>Subscribe</Text>
                </LinearGradient>
              </TouchableOpacity>
              )}

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
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadContent} tintColor="#E50914" />
          }
        >
          {/* Hero Carousel */}
          {slidesToUse.length > 0 && (
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
                  key={slide.id ? `${slide.id}-${index}` : index}
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
                      image: slide.thumbnailUrl || slide.posterUrl || slide.image,
                      likes: slide.likes ? slide.likes.toString() : '12.5K',
                      comments: '840',
                      isVip: slide.isVip ? 'true' : 'false'
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
          )}

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
                  onPress={() => {
                    if (cat !== 'All') {
                        router.push({ pathname: '/section/[title]', params: { title: cat } });
                    }
                  }}
                >
                  <Text style={[styles.categoryText, index === 0 && styles.activeCategoryText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dynamic Sections */}
          {renderDynamicSections()}

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
