import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export interface ReelItem {
  id: string;
  title: string;
  subtitle: string;
  video: string;
  image: string;
  likes: string;
  comments: string;
}

interface ReelsPlayerProps {
  data: ReelItem[];
  initialIndex?: number;
}

export default function ReelsPlayer({ data, initialIndex = 0 }: ReelsPlayerProps) {
  const router = useRouter();
  const [activeVideoIndex, setActiveVideoIndex] = useState(initialIndex);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: ReelItem; index: number }) => {
    return (
      <ReelItemView 
        item={item} 
        isActive={activeVideoIndex === index} 
      />
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      initialScrollIndex={initialIndex}
      getItemLayout={(data, index) => (
        {length: height, offset: height * index, index}
      )}
    />
  );
}

function ReelItemView({ item, isActive }: { item: ReelItem, isActive: boolean }) {
  const [isBuffering, setIsBuffering] = useState(true);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isMuted, setIsMuted] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const videoRef = useRef<Video>(null);
  const router = useRouter();

  // Sync local playing state with active prop
  React.useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: item.video }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isPlaying}
        isLooping
        isMuted={isMuted}
        useNativeControls={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded) {
            const isPlayingStatus = status.isPlaying;
            const isBufferingStatus = status.isBuffering;
            if (isPlayingStatus) {
              setIsBuffering(false);
            } else {
              setIsBuffering(isBufferingStatus);
            }
          }
        }}
        onLoadStart={() => setIsBuffering(true)}
        onLoad={() => setIsBuffering(false)}
        onError={() => setIsBuffering(false)}
      />

      {isBuffering && (
        <View style={styles.bufferingContainer}>
          <BlurView intensity={30} tint="dark" style={styles.bufferingBlur}>
            <ActivityIndicator size="large" color="#E50914" />
          </BlurView>
        </View>
      )}

      <SafeAreaView style={styles.overlayContainer}>
        
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity style={styles.qualityButton}>
            <MaterialIcons name="settings" size={16} color="#fff" />
            <Text style={styles.qualityText}>Auto 480p</Text>
          </TouchableOpacity>
        </View>

        {/* Right Action Bar */}
        <View style={styles.rightActionBar}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart" size={32} color="#fff" />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add" size={32} color="#fff" />
            <Text style={styles.actionText}>My List</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social" size={30} color="#fff" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setShowEpisodes(true)}>
            <MaterialIcons name="grid-view" size={30} color="#fff" />
            <Text style={styles.actionText}>Episodes</Text>
          </TouchableOpacity>

           <TouchableOpacity style={styles.actionButton} onPress={() => setIsMuted(!isMuted)}>
            <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={30} color="#fff" />
            <Text style={styles.actionText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Info Row */}
          <View style={styles.infoRow}>
            <Text style={styles.episodeLabel}>S1 E1</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarFill} />
          </View>

          {/* Control Buttons Row */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn}>
              <MaterialIcons name="speed" size={20} color="#fff" />
              <Text style={styles.controlText}>1x</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn}>
              <MaterialIcons name="replay-5" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlay} style={styles.playPauseBtn}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn}>
              <MaterialIcons name="forward-5" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn}>
              <MaterialIcons name="closed-caption" size={24} color="#fff" />
              <Text style={styles.controlText}>CC</Text>
            </TouchableOpacity>

            <Text style={styles.durationText}>02:00</Text>
          </View>
        </View>

      </SafeAreaView>

      {/* Episodes Overlay */}
      {showEpisodes && (
        <EpisodesView 
          item={item} 
          onClose={() => setShowEpisodes(false)} 
        />
      )}
    </View>
  );
}

function EpisodesView({ item, onClose }: { item: ReelItem, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const totalEpisodes = 87;
  const episodesPerPage = 35;
  const tabs = ['1-35', '36-70', '71-87'];

  const renderEpisodeGrid = () => {
    const start = activeTab * episodesPerPage + 1;
    const end = Math.min((activeTab + 1) * episodesPerPage, totalEpisodes);
    const episodes = [];

    for (let i = start; i <= end; i++) {
      const isCurrent = i === 1; // Dummy current episode
      const isLocked = i > 5; // Dummy lock logic

      episodes.push(
        <TouchableOpacity 
          key={i} 
          style={[
            styles.episodeItem, 
            isCurrent && styles.activeEpisodeItem
          ]}
        >
          <Text style={[styles.episodeNum, isCurrent && styles.activeEpisodeNum]}>{i}</Text>
          {isCurrent && (
             <Ionicons name="stats-chart" size={12} color="#E50914" style={styles.playingIcon} />
          )}
          {isLocked && !isCurrent && (
            <View style={styles.lockIconContainer}>
              <MaterialIcons name="lock" size={10} color="#888" />
            </View>
          )}
        </TouchableOpacity>
      );
    }
    return <View style={styles.gridContainer}>{episodes}</View>;
  };

  return (
    <View style={styles.episodesOverlay}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.episodesContent}>
        
        {/* Header */}
        <View style={styles.episodesHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>


          {/* Season Selector */}
          <View style={styles.seasonContainer}>
            <TouchableOpacity style={styles.seasonButton}>
              <Text style={styles.seasonText}>Season 1</Text>
            </TouchableOpacity>
          </View>

          {/* Range Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setActiveTab(index)}
                style={[styles.tabItem, activeTab === index && styles.activeTabItem]}
              >
                <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Grid */}
          {renderEpisodeGrid()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: width,
    height: height,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  
  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    // Bubble 3D Effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  topTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  qualityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    // Bubble 3D Effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  qualityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Right Action Bar
  rightActionBar: {
    position: 'absolute',
    right: 10,
    bottom: 180, // Above bottom controls
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Bottom Controls
  bottomControls: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', // Slight background for readability
  },
  infoRow: {
    marginBottom: 10,
  },
  episodeLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '30%', // Dummy progress
    height: '100%',
    backgroundColor: '#E50914',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playPauseBtn: {
    padding: 0,
  },
  durationText: {
    color: '#ccc',
    fontSize: 12,
    marginLeft: 8,
  },

  // Buffering
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bufferingBlur: {
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  // Episodes Overlay Styles
  episodesOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  episodesContent: {
    flex: 1,
  },
  episodesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  seasonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  seasonButton: {
    borderColor: '#E50914',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    // Bubble 3D Effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  seasonText: {
    color: '#E50914',
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 20,
  },
  tabItem: {
    paddingBottom: 5,
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#E50914',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#E50914',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 10,
    justifyContent: 'flex-start', // Align left but gap handles spacing
  },
  episodeItem: {
    width: (width - 30 - 40) / 5, // (Screen width - padding - gaps) / 5 columns
    aspectRatio: 1,
    backgroundColor: '#222',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    // Bubble 3D Effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  activeEpisodeItem: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  episodeNum: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeEpisodeNum: {
    color: '#E50914',
  },
  playingIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  lockIconContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#f0e68c', // Gold-ish background for lock
    borderRadius: 10,
    padding: 2,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
