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
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl // Import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationPanel from '../../src/components/NotificationPanel';
import ScreenTransition from '../../src/components/ScreenTransition';
import {
    CONTINUE_WATCHING,
    SHORTS_COMEDY,
    SHORTS_NEW,
    SHORTS_SLIDES,
    SHORTS_TRENDING
} from '../../src/data/mockData';
import contentService from '../../src/services/contentService';
import playbackService from '../../src/services/playbackService';
import socketService from '../../src/services/socketService';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export default function ShortsScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true); // Auto-play initially
  const [isVip, setIsVip] = useState(false); // VIP State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic Data States
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [continueWatchingData, setContinueWatchingData] = useState<any[]>([]);

  const scrollViewRef = useRef<ScrollView>(null);
  const notificationAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    loadContent();

    // Connect to Socket
    socketService.connect();

    // Listen for updates
    const unsubscribe = socketService.on('layout_updated', (data: any) => {
      if (data.page === 'shorts') {
        console.log('Received Shorts Layout Update!', data);
        Alert.alert('Update Received', 'Refreshing Shorts Layout...');
        loadContent();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadContent = async () => {
    try {
      // 0. Check User Status (Fetch fresh from API)
      const user = await import('../../src/services/authService').then(m => m.default.getMe()); // Force DB fetch
      if (user && (user.isVip || user.subscription?.status === 'active')) {
          setIsVip(true);
      } else {
          setIsVip(false);
      }

      setIsLoading(true);

      // 1. Fetch Dynamic Layout
      const layout = await contentService.getLayout('shorts');
      
      console.log('Shorts Layout Response:', JSON.stringify(layout, null, 2)); // Debug Log
      
      if (layout) {
         setHeroSlides(Array.isArray(layout.heroContent) ? layout.heroContent : []);
         setSections(Array.isArray(layout.sections) ? layout.sections : []);
      } else {
         // Fallback logic could go here if needed
         setHeroSlides([]);
         setSections([]);
      }

      // 2. Fetch Continue Watching
      try {
        const cw = await playbackService.syncWithBackend();
        // Filter CW for Shorts? Or show all? Usually just recent.
        // For shorts screen maybe strict filtering if we had content type.
        setContinueWatchingData(cw || []);
      } catch (e) {
        console.error('CW Error', e);
      }

    } catch (error) {
      console.error('Failed to load shorts content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use fetched shorts or fallback to mock (only if heroSlides empty, though we prefer strict)
  // Ensure we always have an array even if state gets corrupted
  const slidesToUse = Array.isArray(heroSlides) && heroSlides.length > 0 ? heroSlides : [];

  // Create an extended array with duplicates at both ends for bidirectional infinite scroll
  // Only if we have slides
  const extendedSlides = slidesToUse.length > 0 ? [
    { ...slidesToUse[slidesToUse.length - 1], id: 'duplicate-last' },
    ...slidesToUse,
    { ...slidesToUse[0], id: 'duplicate-first' }
  ] : [];

  // Initialize scroll position to the first real slide (index 1)
  React.useEffect(() => {
    if (width > 0 && slidesToUse.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: width, animated: false });
      }, 0);
    }
  }, [width, slidesToUse]);

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

  // Auto-slide logic
  React.useEffect(() => {
    if (slidesToUse.length === 0) return;
    const interval = setInterval(() => {
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
  }, [activeSlide, width, slidesToUse]);

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

  const handlePlayShort = (id: string) => {
    router.push({
      pathname: '/reels',
      params: { initialId: id }
    });
  };

  const renderDynamicSections = () => {
    return sections.map((section, index) => {
      // Handle Continue Watching
      if (section.type === 'continue_watching') {
         if (continueWatchingData.length === 0) return null;
         return renderContinueWatching(section.title);
      }
      
      // Handle Content Sections
      if (!section.contentIds || section.contentIds.length === 0) return null;
      
      return (
        <View key={section.id || index} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {section.contentIds.map((item: any) => (
               <TouchableOpacity 
                  key={item.id} 
                  style={styles.cardContainer} 
                  activeOpacity={0.7}
                  onPress={() => handlePlayShort(item.id)}
                >
                  <Image source={{ uri: item.thumbnailUrl || item.posterUrl || item.image }} style={styles.cardImage} contentFit="cover" />
                  
                  {section.type === 'new_arrivals' && (
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
    });
  };

  const renderContinueWatching = (title: string) => (
      <View key="continue-watching" style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {continueWatchingData.map((item) => {
             if (!item.Content) return null;
             return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.cardContainer} 
              activeOpacity={0.7}
              onPress={() => handlePlayShort(item.Content.id)}
            >
              <Image
                source={{ uri: item.Content.thumbnailUrl || item.Content.posterUrl }}
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
                  width: `${Math.min((item.progress / 30000) * 100, 100)}%`, // Mock Duration
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
          )})}
        </ScrollView>
      </View>
  );

  return (
    <ScreenTransition>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header - Fixed Position */}
        <SafeAreaView style={styles.headerContainer} edges={['top']}>
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
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.subscribeGradient}
                  >
                    <Ionicons name="diamond" size={12} color="black" />
                    <Text style={styles.subscribeText}>Premium</Text>
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
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadContent}
              tintColor="#E50914"
              colors={['#E50914']}
              progressBackgroundColor="#1a1a1a"
            />
          }
        >

          {/* Hero Carousel (Taller for Shorts) */}
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
            >
              {extendedSlides.map((slide, index) => (
                <TouchableOpacity
                  key={slide.id ? `${slide.id}-${index}` : index}
                  activeOpacity={0.9}
                  style={styles.slide}
                  onPress={() => handlePlayShort(slide.id)}
                >
                  <Image
                    source={{ uri: slide.thumbnailUrl || slide.posterUrl || slide.image }}
                    style={styles.heroImage}
                    contentFit="cover"
                  />

                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.2)', '#000']}
                    style={styles.heroGradient}
                  >
                    <View style={styles.heroContent}>
                      <Text style={styles.heroTitle}>{slide.title}</Text>
                      <Text style={styles.heroSubtitle}>{slide.description || slide.subtitle}</Text>
                      
                      <View style={styles.playButton}>
                        <Ionicons name="play" size={24} color="#fff" />
                        <Text style={styles.playButtonText}>Watch Short</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
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

          {renderDynamicSections()}

        </ScrollView>
        
        <NotificationPanel 
          isVisible={isNotificationOpen} 
          onClose={() => setIsNotificationOpen(false)} 
        />
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    // Bubble 3D Effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)', // Shine effect on border
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  subscribeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 10,
  },
  // Hero Section
  heroContainer: {
    height: 600, // Taller for Shorts
    width: '100%',
    position: 'relative',
    marginBottom: 20,
    marginTop: 80, // Add margin for fixed header
  },
  slide: {
    width: width,
    height: 600,
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
    height: '50%',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
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
    marginBottom: 20,
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
  pagination: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#E50914',
    width: 20,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  // Sections
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
  cardContainer: {
    width: 110, // Slightly narrower for vertical look
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
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
    height: 80,
    justifyContent: 'flex-end',
    padding: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    color: '#ccc',
    fontSize: 10,
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
    fontSize: 8,
    fontWeight: 'bold',
  },
});
