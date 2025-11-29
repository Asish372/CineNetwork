import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ResizeMode } from 'expo-av';
import VideoPlayer from 'expo-video-player';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState, useRef } from 'react';
import {
    Alert,
    Dimensions,
    StatusBar,
    StyleSheet,
    View,
    useWindowDimensions,
    Text,
    TouchableOpacity,
    Modal,
    FlatList
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import contentService from '../../src/services/contentService';
import playbackService from '../../src/services/playbackService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const videoRef = useRef<any>(null);

  // Fallback data
  const {
    id = '0',
    title: initialTitle,
    subtitle: initialSubtitle,
    video: initialVideo,
    position = '0',
  } = params;

  useEffect(() => {
    console.log('PlayerScreen params:', params);
    console.log('PlayerScreen received position:', position);
  }, [position]);
  
  // State
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [videoUrl, setVideoUrl] = useState(initialVideo as string);
  const [videoTitle, setVideoTitle] = useState(initialTitle as string);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [videoQuality, setVideoQuality] = useState('Auto');
  const [activeSettingTab, setActiveSettingTab] = useState<'Speed' | 'Quality'>('Speed');

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const qualities = ['Auto', '360p', '480p', '720p', '1080p', '4k'];

  useEffect(() => {
    if (!videoUrl && id) {
      loadContentDetails();
    }
  }, [id, videoUrl]);

  const loadContentDetails = async () => {
    try {
      const content = await contentService.getContentById(id as string);
      if (content) {
        setVideoUrl(content.videoUrl);
        setVideoTitle(content.title);
      }
    } catch (error) {
      console.log('Failed to load content details from backend, using fallback params:', error);
    }
  };

  useEffect(() => {
    // Lock to landscape on mount for better viewing experience
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const handleExitFullscreen = async () => {
    if (videoRef.current) {
        try {
            const status = await videoRef.current.getStatusAsync();
            if (status.isLoaded) {
                console.log('Saving position on exit:', status.positionMillis);
                playbackService.savePosition(id as string, status.positionMillis);
            }
        } catch (e) {
            console.log('Error saving position:', e);
        }
    }
    router.back();
  };

  const handleSeek = async (amount: number) => {
    if (videoRef.current) {
        try {
            const status = await videoRef.current.getStatusAsync();
            if (status.isLoaded) {
                const newPosition = status.positionMillis + amount;
                await videoRef.current.setPositionAsync(newPosition);
                setFeedbackText(amount > 0 ? '+10s' : '-10s');
                setShowFeedback(true);
                setTimeout(() => setShowFeedback(false), 1000);
            }
        } catch (e) {
            console.log('Seek error:', e);
        }
    }
  };

  const changeSpeed = async (speed: number) => {
      setPlaybackSpeed(speed);
      if (videoRef.current) {
          await videoRef.current.setRateAsync(speed, true);
      }
      setShowSettings(false);
  };

  const changeQuality = (quality: string) => {
      setVideoQuality(quality);
      // Logic to switch video source would go here
      console.log('Switching quality to:', quality);
      setShowSettings(false);
  };

  const doubleTapLeft = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
        handleSeek(-10000);
    })
    .runOnJS(true);

  const doubleTapRight = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
        handleSeek(10000);
    })
    .runOnJS(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <VideoPlayer
        videoProps={{
          ref: videoRef,
          shouldPlay: false,
          resizeMode: ResizeMode.CONTAIN,
          source: {
            uri: videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4" 
          },
          isMuted: false,
          onLoad: async () => {
            if (position) {
                const seekTime = parseInt(position as string, 10);
                if (videoRef.current) {
                    await videoRef.current.playFromPositionAsync(seekTime);
                }
            } else {
                if (videoRef.current) {
                    await videoRef.current.playAsync();
                }
            }
          }
        }}
        fullscreen={{
          inFullscreen: true,
          enterFullscreen: async () => {},
          exitFullscreen: handleExitFullscreen,
        }}
        style={{
          videoBackgroundColor: 'black',
          height: height,
          width: width,
          paddingBottom: 40, // Lift controls up
        }}
        header={
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                        onPress={() => {
                            setActiveSettingTab('Speed');
                            setShowSettings(true);
                        }} 
                        style={{ padding: 10, marginRight: 10 }}
                    >
                        <MaterialIcons name="speed" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => {
                            setActiveSettingTab('Quality');
                            setShowSettings(true);
                        }} 
                        style={{ padding: 10 }}
                    >
                        <MaterialIcons name="high-quality" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        }
      />

      {/* Gesture Overlays */}
      <GestureDetector gesture={doubleTapLeft}>
        <View style={styles.leftGestureArea} />
      </GestureDetector>
      <GestureDetector gesture={doubleTapRight}>
        <View style={styles.rightGestureArea} />
      </GestureDetector>

      {/* Feedback Overlay */}
      {showFeedback && (
        <View style={styles.feedbackOverlay}>
            <Text style={styles.feedbackText}>{feedbackText}</Text>
        </View>
      )}

      {/* Settings Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowSettings(false)}
        >
            <View style={styles.settingsContainer}>
                <View style={styles.settingsHeader}>
                    <TouchableOpacity onPress={() => setActiveSettingTab('Speed')}>
                        <Text style={[styles.tabText, activeSettingTab === 'Speed' && styles.activeTab]}>Speed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveSettingTab('Quality')}>
                        <Text style={[styles.tabText, activeSettingTab === 'Quality' && styles.activeTab]}>Quality</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.settingsContent}>
                    {activeSettingTab === 'Speed' ? (
                        <FlatList
                            data={speeds}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.settingOption} 
                                    onPress={() => changeSpeed(item)}
                                >
                                    <Text style={[styles.optionText, playbackSpeed === item && styles.selectedOption]}>
                                        {item}x
                                    </Text>
                                    {playbackSpeed === item && <Ionicons name="checkmark" size={20} color="#E50914" />}
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <FlatList
                            data={qualities}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.settingOption} 
                                    onPress={() => changeQuality(item)}
                                >
                                    <Text style={[styles.optionText, videoQuality === item && styles.selectedOption]}>
                                        {item}
                                    </Text>
                                    {videoQuality === item && <Ionicons name="checkmark" size={20} color="#E50914" />}
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
      </Modal>

    </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
      flexDirection: 'row',
  },
  leftGestureArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '30%',
    zIndex: 10,
  },
  rightGestureArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '30%',
    zIndex: 10,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    zIndex: 20,
  },
  feedbackText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  settingsContainer: {
      width: 300,
      backgroundColor: '#1a1a1a',
      borderRadius: 10,
      padding: 10,
      maxHeight: 400,
  },
  settingsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: 1,
      borderBottomColor: '#333',
      paddingBottom: 10,
      marginBottom: 10,
  },
  tabText: {
      color: '#888',
      fontSize: 16,
      fontWeight: 'bold',
      padding: 5,
  },
  activeTab: {
      color: '#E50914',
      borderBottomWidth: 2,
      borderBottomColor: '#E50914',
  },
  settingsContent: {
      maxHeight: 300,
  },
  settingOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
  },
  optionText: {
      color: '#fff',
      fontSize: 16,
  },
  selectedOption: {
      color: '#E50914',
      fontWeight: 'bold',
  }
});


