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

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const notificationAnim = useRef(new Animated.Value(0)).current;

  // Simulate initial data loading
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Create an extended array with duplicates at both ends for bidirectional infinite scroll
  // [Last, First, Second, ..., Last, First]
  const extendedSlides = [
    { ...HERO_SLIDES[HERO_SLIDES.length - 1], id: 'duplicate-last' },
    ...HERO_SLIDES,
    { ...HERO_SLIDES[0], id: 'duplicate-first' }
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

      if (activeSlide < HERO_SLIDES.length - 1) {
        // Move to next slide
        scrollViewRef.current?.scrollTo({
          x: (activeSlide + 2) * width, // +1 for next, +1 for offset
          animated: true,
        });
      } else {
        // Move to duplicate first slide (visually next)
        scrollViewRef.current?.scrollTo({
          x: (HERO_SLIDES.length + 1) * width,
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
  }, [activeSlide, width, isVideoPlaying]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Optional: Update active dot while scrolling if desired, 
    // but usually better to wait for momentum end for the jump logic.
    // For dots, we can calculate based on offset.
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const rawSlide = Math.round(offset / slideWidth);
    
    // Map raw slide index to actual content index (0 to length-1)
    let actualIndex = rawSlide - 1;
    if (actualIndex < 0) actualIndex = HERO_SLIDES.length - 1;
    if (actualIndex >= HERO_SLIDES.length) actualIndex = 0;

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
                  key={slide.id}
                  item={slide}
                  onPlay={() => setIsVideoPlaying(true)}
                  onStop={() => setIsVideoPlaying(false)}
                  onDetailsPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: slide.id,
                      title: slide.title,
                      subtitle: slide.subtitle,
                      video: slide.video,
                      image: slide.image,
                      likes: '12.5K',
                      comments: '840'
                    }
                  })}
                />
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {HERO_SLIDES.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    // Highlight the dot if it's the active slide OR if it's the duplicate slide (which maps to index 0)
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



          {/* Continue Watching Section */}
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
                      subtitle: item.timeLeft,
                      image: item.image,
                      likes: '10K',
                      comments: '500'
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

          {/* Trending Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/section/[type]', params: { type: 'trending', title: 'Trending Now' } })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {TRENDING_NOW.slice(0, 4).map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.cardContainer} 
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: item.id,
                      title: item.title,
                      subtitle: 'Trending Movie',
                      video: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4', // Dummy video
                      image: item.image,
                      likes: '8.2K',
                      comments: '420'
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
              ))}
            </ScrollView>
          </View>

          {/* New Releases Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Releases</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/section/[type]', params: { type: 'new', title: 'New Releases' } })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {NEW_RELEASES.slice(0, 4).map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.cardContainer} 
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: item.id,
                      title: item.title,
                      subtitle: 'New Release',
                      video: 'https://videos.pexels.com/video-files/854671/854671-hd_1920_1080_25fps.mp4', // Dummy video
                      image: item.image,
                      likes: '5.1K',
                      comments: '120'
                    }
                  })}
                >
                  <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
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

          {/* Action Movies Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Action Movies</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/section/[type]', params: { type: 'action', title: 'Action Movies' } })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {ACTION_MOVIES.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.cardContainer} 
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: item.id,
                      title: item.title,
                      subtitle: 'Action',
                      video: 'https://videos.pexels.com/video-files/5091624/5091624-uhd_2560_1440_24fps.mp4',
                      image: item.image,
                      likes: '4.5K',
                      comments: '98'
                    }
                  })}
                >
                  <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardGradient}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Comedy Movies Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comedy Hits</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/section/[type]', params: { type: 'comedy', title: 'Comedy Hits' } })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {COMEDY_MOVIES.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.cardContainer} 
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: item.id,
                      title: item.title,
                      subtitle: 'Comedy',
                      video: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
                      image: item.image,
                      likes: '3.2K',
                      comments: '45'
                    }
                  })}
                >
                  <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardGradient}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sci-Fi Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sci-Fi & Fantasy</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/section/[type]', params: { type: 'scifi', title: 'Sci-Fi & Fantasy' } })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {SCIFI_MOVIES.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.cardContainer} 
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: item.id,
                      title: item.title,
                      subtitle: 'Sci-Fi',
                      video: 'https://videos.pexels.com/video-files/854671/854671-hd_1920_1080_25fps.mp4',
                      image: item.image,
                      likes: '6.7K',
                      comments: '230'
                    }
                  })}
                >
                  <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardGradient}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Documentaries Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Documentaries</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/section/[type]', params: { type: 'docs', title: 'Documentaries' } })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {DOCUMENTARIES.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.cardContainer} 
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: item.id,
                      title: item.title,
                      subtitle: 'Documentary',
                      video: 'https://videos.pexels.com/video-files/2658849/2658849-hd_1920_1080_30fps.mp4',
                      image: item.image,
                      likes: '2.1K',
                      comments: '34'
                    }
                  })}
                >
                  <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardGradient}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Horror Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Horror</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/section/[type]', params: { type: 'horror', title: 'Horror' } })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {HORROR_MOVIES.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.cardContainer} 
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/details/[id]',
                    params: { 
                      id: item.id,
                      title: item.title,
                      subtitle: 'Horror',
                      video: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
                      image: item.image,
                      likes: '9.9K',
                      comments: '666'
                    }
                  })}
                >
                  <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardGradient}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>



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


  // Hero Section
  heroContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
    marginTop: 80, // Adjusted for header height
  },
  slide: {
    width: width,
    height: 280,
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: 'hidden',
  },
  heroVideo: {
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
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 25,
    fontWeight: '500',
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  playButton: {
    borderRadius: 30, // Rounded for bubble effect
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  muteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
  heroImage: {
    width: '100%',
    height: '100%',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

