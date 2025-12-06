import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';

import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import contentService from '../../src/services/contentService';
import playbackService from '../../src/services/playbackService';
import React, { useRef, useState, useCallback } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video>(null);
  const playerVideoRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const playbackPositionRef = useRef(0);
  const [shouldPlayInline, setShouldPlayInline] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  React.useEffect(() => {
    checkWatchlist();
  }, [params.id]);

  const checkWatchlist = async () => {
    try {
      const status = await contentService.checkWatchlistStatus(params.id as string);
      setIsInWatchlist(status.isInWatchlist);
    } catch (error) {
      console.log('Error checking watchlist:', error);
    }
  };

  const toggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        await contentService.removeFromWatchlist(params.id as string);
        setIsInWatchlist(false);
      } else {
        await contentService.addToWatchlist(params.id as string);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // When screen is focused
      if (showPlayer) {
        setShouldPlayInline(true);
        
        // Check for saved position
        const savedPosition = playbackService.getPosition(params.id as string);
        if (savedPosition > 0 && playerVideoRef.current) {
            console.log('Resuming from saved position:', savedPosition);
            // Small delay to ensure player is ready
            setTimeout(() => {
                playerVideoRef.current?.playFromPositionAsync(savedPosition);
            }, 100);
        }
      }
      return () => {
        // When screen is unfocused (e.g. navigating to player)
        setShouldPlayInline(false);
      };
    }, [showPlayer, params.id])
  );

  // State
  const [activeTab, setActiveTab] = useState('Episodes');
  const [selectedSeason, setSelectedSeason] = useState('Season 1');

  // Constants
  const seasons = ['Season 1', 'Season 2', 'Season 3'];

  // Fallback data
  const {
    title = 'Unknown Title',
    subtitle = 'Genre',
    video = '',
    image = '',
    likes = '0',
    comments = '0',
  } = params;

  // Mock Episodes Data
  const EPISODES = [
    { id: 1, title: 'The Beginning', duration: '45m', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80', desc: 'The journey begins in a world of chaos.' },
    { id: 2, title: 'Lost Souls', duration: '42m', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80', desc: 'Finding the lost path is harder than it seems.' },
    { id: 3, title: 'Redemption', duration: '48m', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80', desc: 'A chance to make things right.' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Top Section: Trailer / Hero */}
        <View style={styles.heroContainer}>
          {showPlayer ? (

             <View style={{ width: width, height: 250 }}>
                <Video
                  ref={playerVideoRef}
                  source={{ uri: video as string || "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={shouldPlayInline}
                  isMuted={false}
                  useNativeControls
                  onPlaybackStatusUpdate={(status) => {
                      if (status.isLoaded && status.didJustFinish) {
                          setShowPlayer(false);
                      }
                  }}
                />
                <TouchableOpacity 
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        padding: 8,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: 20,
                    }}
                    onPress={async () => {
                        let currentPosition = 0;
                        if (playerVideoRef.current) {
                            const status = await playerVideoRef.current.getStatusAsync();
                            if (status.isLoaded) {
                                currentPosition = status.positionMillis;
                            }
                        }
                        router.push({
                            pathname: '/player/[id]',
                            params: { 
                                id: params.id as string, 
                                ...params,
                                position: currentPosition.toString() 
                            }
                        });
                    }}
                >
                    <Ionicons name="expand" size={20} color="#fff" />
                </TouchableOpacity>
             </View>
          ) : (
            <>
              {video ? (
                <Video
                  ref={videoRef}
                  source={{ uri: video as string }}
                  style={styles.heroVideo}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={isPlaying}
                  isLooping
                  isMuted={isMuted}
                  useNativeControls={false}
                />
              ) : (
                 <Image source={{ uri: image as string }} style={styles.heroVideo} />
              )}
              
              <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'transparent', '#000']}
                style={styles.heroGradient}
              >
                <SafeAreaView style={styles.header} edges={['top']}>
                  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.headerActions}>
                     <TouchableOpacity onPress={() => {}} style={styles.iconButton}>
                        <Ionicons name="search" size={24} color="#fff" />
                     </TouchableOpacity>
                     <TouchableOpacity onPress={() => {}} style={styles.iconButton}>
                        <Image source={{ uri: 'https://github.com/shadcn.png' }} style={styles.avatar} />
                     </TouchableOpacity>
                  </View>
                </SafeAreaView>
              </LinearGradient>
              
              <View style={styles.controlsOverlay}>
                <TouchableOpacity 
                  style={styles.centerPlayButton} 
                  onPress={() => setShowPlayer(true)}
                >
                  <Ionicons name="play" size={40} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>
    
              <TouchableOpacity 
                style={styles.muteButton} 
                onPress={() => setIsMuted(!isMuted)}
              >
                <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{title}</Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.matchText}>98% Match</Text>
            <Text style={styles.yearText}>2024</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageText}>12+</Text>
            </View>
            <Text style={styles.durationText}>1 Season</Text>
            <View style={styles.qualityBadge}>
              <Text style={styles.qualityText}>HD</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!showPlayer && (
            <TouchableOpacity 
                style={styles.playButton} 
                activeOpacity={0.8}
                onPress={() => setShowPlayer(true)}
            >
                <LinearGradient
                colors={['#ff4d4d', '#E50914', '#8f0000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.playButtonGradient}
                >
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.playButtonText}>Watch Now</Text>
                {/* Shine Effect */}
                <LinearGradient
                    colors={['rgba(255,255,255,0.4)', 'transparent']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
                </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Season Selector */}
          <View style={styles.seasonContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {seasons.map((season) => (
                <TouchableOpacity
                  key={season}
                  style={[styles.seasonChip, selectedSeason === season && styles.activeSeasonChip]}
                  onPress={() => setSelectedSeason(season)}
                >
                  <Text style={[styles.seasonText, selectedSeason === season && styles.activeSeasonText]}>
                    {season}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.synopsis}>
            In a futuristic world where technology rules, one hero rises to challenge the system. 
            Experience the thrill of the unknown in this groundbreaking series.
          </Text>
          
          <Text style={styles.castText}>
            <Text style={{color: '#888'}}>Starring: </Text> Keanu Reeves, Scarlett Johansson
          </Text>
          <Text style={styles.castText}>
            <Text style={{color: '#888'}}>Creator: </Text> Christopher Nolan
          </Text>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionItem} onPress={toggleWatchlist}>
              <Ionicons name={isInWatchlist ? "checkmark-circle" : "add"} size={24} color={isInWatchlist ? "#E50914" : "#fff"} />
              <Text style={[styles.actionLabel, isInWatchlist && { color: '#E50914' }]}>
                  {isInWatchlist ? 'Saved' : 'My List'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="thumbs-up-outline" size={24} color="#fff" />
              <Text style={styles.actionLabel}>Rate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="share-social-outline" size={24} color="#fff" />
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Tabs */}
        <View style={styles.tabContainer}>
           <View style={styles.tabIndicator} />
           <Text style={styles.tabTitle}>Episodes</Text>
           <Text style={[styles.tabTitle, { color: '#888', marginLeft: 20 }]}>More Like This</Text>
        </View>

        {/* Episodes List */}
        <View style={styles.episodesList}>
          {EPISODES.map((ep) => (
            <TouchableOpacity key={ep.id} style={styles.episodeItem} activeOpacity={0.7}>
              <View style={styles.episodeImageContainer}>
                <Image source={{ uri: ep.image }} style={styles.episodeImage} />
                <View style={styles.playOverlay}>
                   <Ionicons name="play-circle-outline" size={32} color="#fff" />
                </View>
              </View>
              <View style={styles.episodeInfo}>
                <View style={styles.episodeHeader}>
                  <Text style={styles.episodeTitle}>{ep.id}. {ep.title}</Text>
                  <Text style={styles.episodeDuration}>{ep.duration}</Text>
                </View>
                <Text style={styles.episodeDesc} numberOfLines={3}>{ep.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
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
  heroContainer: {
    width: '100%',
    height: 250, // Standard trailer height
    position: 'relative',
  },
  heroVideo: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingRight: 10,
  },
  iconButton: {
    padding: 5,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  muteButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  matchText: {
    color: '#46d369', // Netflix green
    fontWeight: 'bold',
    fontSize: 14,
  },
  yearText: {
    color: '#888',
    fontSize: 14,
  },
  ageBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  ageText: {
    color: '#fff',
    fontSize: 12,
  },
  durationText: {
    color: '#888',
    fontSize: 14,
  },
  qualityBadge: {
    borderWidth: 1,
    borderColor: '#666',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  qualityText: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playButton: {
    marginBottom: 20,
    borderRadius: 30,
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
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seasonContainer: {
    marginBottom: 20,
  },
  seasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeSeasonChip: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  seasonText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
  activeSeasonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerPlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  synopsis: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  castText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 40,
    paddingHorizontal: 10,
  },
  actionItem: {
    alignItems: 'center',
    gap: 5,
  },
  actionLabel: {
    color: '#888',
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#000', // Just to separate
    alignItems: 'center',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: 70,
    height: 4,
    backgroundColor: '#E50914',
  },
  tabTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  episodesList: {
    paddingHorizontal: 16,
  },
  episodeItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  episodeImageContainer: {
    width: 120,
    height: 70,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  episodeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  episodeDuration: {
    color: '#888',
    fontSize: 12,
  },
  episodeDesc: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
  },
});
