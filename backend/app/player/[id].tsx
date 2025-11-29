import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import * as Battery from 'expo-battery';
import * as Brightness from 'expo-brightness';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock Data
const EPISODES = [
    { id: 1, title: 'The Beginning', duration: '45m', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80', desc: 'The journey begins.' },
    { id: 2, title: 'Lost Souls', duration: '42m', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80', desc: 'Finding the lost path.' },
    { id: 3, title: 'Redemption', duration: '48m', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80', desc: 'A chance to make things right.' },
];

const QUALITY_OPTIONS = ['360p', '480p', '720p', '1080p', '4k'];

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video>(null);
  
  // State
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [orientation, setOrientation] = useState(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  const [volume, setVolume] = useState(1.0);
  const [brightness, setBrightness] = useState(1.0);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [isLowDataMode, setIsLowDataMode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [videoResizeMode, setVideoResizeMode] = useState<ResizeMode>(ResizeMode.CONTAIN);
  
  // Refs
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const doubleTapLeftOpacity = useSharedValue(0);
  const doubleTapRightOpacity = useSharedValue(0);
  const controlsOpacity = useSharedValue(1);

  // Fallback data
  const {
    id = '0',
    title = 'Unknown Title',
    subtitle = 'Genre',
    video = '',
  } = params;

  // --- Lifecycle & Setup ---

  useEffect(() => {
    ScreenOrientation.unlockAsync();
    
    (async () => {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
            const cur = await Brightness.getBrightnessAsync();
            setBrightness(cur);
        }
    })();

    loadPlaybackPosition();
    checkBatteryStatus();
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
        if (state.type !== 'wifi' && state.isConnected) {
            setIsLowDataMode(true);
        } else {
            setIsLowDataMode(false);
        }
    });

    return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        unsubscribeNetInfo();
        savePlaybackPosition();
    };
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    controlsOpacity.value = withTiming(showControls ? 1 : 0, { duration: 300 });
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls]);

  useEffect(() => {
      if (status?.isLoaded && status.isPlaying) {
          const interval = setInterval(() => {
              savePlaybackPosition();
          }, 5000);
          return () => clearInterval(interval);
      }
  }, [status?.isLoaded, status?.isPlaying, status?.positionMillis]);

  // --- Smart Features Logic ---

  const loadPlaybackPosition = async () => {
      try {
          const savedPosition = await AsyncStorage.getItem(`playback_position_${id}`);
          if (savedPosition && videoRef.current) {
              const positionMillis = parseInt(savedPosition, 10);
              if (positionMillis > 0) {
                  await videoRef.current.setPositionAsync(positionMillis);
              }
          }
      } catch (error) {
          console.log('Error loading playback position:', error);
      }
  };

  const savePlaybackPosition = async () => {
      if (status?.isLoaded && status.positionMillis > 0) {
          try {
              await AsyncStorage.setItem(`playback_position_${id}`, status.positionMillis.toString());
          } catch (error) {
              console.log('Error saving playback position:', error);
          }
      }
  };

  const checkBatteryStatus = async () => {
      try {
          const level = await Battery.getBatteryLevelAsync();
          const isLowPower = await Battery.isLowPowerModeEnabledAsync();
          if (level < 0.2 || isLowPower) {
              setIsLowPowerMode(true);
          }
      } catch (e) {
          console.log("Battery info unavailable");
      }
  };

  // --- Controls Logic ---

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (showControls && !isLocked) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (!showControls) resetControlsTimeout();
  };

  const handlePlayPause = async () => {
    if (!videoRef.current || !status?.isLoaded) return;
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    resetControlsTimeout();
  };

  const handleSkip = async (amount: number) => {
    if (!videoRef.current || !status?.isLoaded) return;
    const newPosition = status.positionMillis + amount;
    await videoRef.current.setPositionAsync(newPosition);
    resetControlsTimeout();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const changePlaybackSpeed = async () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
        await videoRef.current.setRateAsync(nextSpeed, true);
    }
  };

  const toggleResizeMode = () => {
      setVideoResizeMode(prev => prev === ResizeMode.CONTAIN ? ResizeMode.COVER : ResizeMode.CONTAIN);
  };

  const handleQualityChange = (quality: string) => {
      setVideoQuality(quality);
      setShowQualityModal(false);
      // In a real app, this would switch the video source URL
      Alert.alert("Quality Changed", `Video quality set to ${quality}`);
  };

  // --- Gestures ---

  const singleTap = Gesture.Tap()
    .onEnd(() => {
        runOnJS(toggleControls)();
    });

  const doubleTapLeft = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
        if (isLocked) return;
        runOnJS(handleSkip)(-10000);
        doubleTapLeftOpacity.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 500 }));
    });

  const doubleTapRight = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
        if (isLocked) return;
        runOnJS(handleSkip)(10000);
        doubleTapRightOpacity.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 500 }));
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
        if (isLocked) return;
        if (e.x < SCREEN_WIDTH / 2) {
            const delta = -e.velocityY / 5000; 
            const newBrightness = Math.max(0, Math.min(1, brightness + delta));
            if (!isNaN(newBrightness)) {
                runOnJS(setBrightness)(newBrightness);
                runOnJS(Brightness.setBrightnessAsync)(newBrightness);
            }
        } else {
             const delta = -e.velocityY / 5000;
             const newVolume = Math.max(0, Math.min(1, volume + delta));
             if (!isNaN(newVolume)) {
                runOnJS(setVolume)(newVolume);
             }
        }
    });

  const composedGestures = Gesture.Exclusive(doubleTapLeft, doubleTapRight, singleTap, panGesture);

  // --- Render Helpers ---

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getProgress = () => {
    if (!status?.isLoaded || !status.durationMillis) return 0;
    return status.positionMillis / status.durationMillis;
  };

  useEffect(() => {
    if (status?.isLoaded) {
        if (status.positionMillis > 5000 && status.positionMillis < 15000) {
            setShowSkipIntro(true);
        } else {
            setShowSkipIntro(false);
        }
        if (status.durationMillis && status.positionMillis > status.durationMillis - 20000) {
            setShowNextEpisode(true);
        } else {
            setShowNextEpisode(false);
        }
    }
  }, [status?.positionMillis]);

  const animatedControlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  const leftRippleStyle = useAnimatedStyle(() => ({
    opacity: doubleTapLeftOpacity.value,
  }));

  const rightRippleStyle = useAnimatedStyle(() => ({
    opacity: doubleTapRightOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <GestureDetector gesture={composedGestures}>
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: video as string }}
            style={styles.video}
            resizeMode={videoResizeMode}
            shouldPlay
            isLooping={false}
            useNativeControls={false}
            onPlaybackStatusUpdate={status => setStatus(status)}
          />

          {/* Double Tap Visual Feedback */}
          <View style={styles.rippleContainer} pointerEvents="none">
             <Animated.View style={[styles.rippleSide, leftRippleStyle]}>
                <MaterialIcons name="replay-10" size={50} color="rgba(255,255,255,0.8)" />
                <Text style={styles.rippleText}>10s</Text>
             </Animated.View>
             <View style={{flex:1}} />
             <Animated.View style={[styles.rippleSide, rightRippleStyle]}>
                <MaterialIcons name="forward-10" size={50} color="rgba(255,255,255,0.8)" />
                <Text style={styles.rippleText}>10s</Text>
             </Animated.View>
          </View>

          {/* Smart Overlays */}
          {showSkipIntro && !isLocked && (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.skipIntroContainer}>
                <TouchableOpacity style={styles.skipIntroButton} onPress={() => handleSkip(15000)}>
                    <Text style={styles.skipIntroText}>Skip Intro</Text>
                </TouchableOpacity>
            </Animated.View>
          )}

           {showNextEpisode && !isLocked && (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.nextEpisodeContainer}>
                <TouchableOpacity style={styles.nextEpisodeButton} onPress={() => { /* Logic to load next */ }}>
                    <Text style={styles.nextEpisodeText}>Next Episode</Text>
                    <Ionicons name="arrow-forward" size={16} color="#000" />
                </TouchableOpacity>
            </Animated.View>
          )}

          {/* Adaptive UI Warnings */}
          {isLowDataMode && showControls && !isLocked && (
              <View style={styles.warningContainer}>
                  <Ionicons name="cellular-outline" size={16} color="#FFD700" />
                  <Text style={styles.warningText}>Data Saver On</Text>
              </View>
          )}
          {isLowPowerMode && showControls && !isLocked && (
              <View style={[styles.warningContainer, { top: 80 }]}>
                  <Ionicons name="battery-dead-outline" size={16} color="#FFD700" />
                  <Text style={styles.warningText}>Low Power Mode</Text>
              </View>
          )}

          {/* LOCKED STATE OVERLAY */}
          {isLocked && showControls && (
             <Animated.View style={[styles.overlay, animatedControlsStyle]} pointerEvents="box-none">
                 <View style={styles.lockedContainer}>
                     <TouchableOpacity style={styles.unlockButton} onPress={() => setIsLocked(false)}>
                         <MaterialIcons name="lock-open" size={24} color="#000" />
                         <Text style={styles.unlockText}>Unlock</Text>
                     </TouchableOpacity>
                     <Text style={styles.lockedText}>Screen Locked</Text>
                 </View>
             </Animated.View>
          )}

          {/* UNLOCKED CONTROLS OVERLAY */}
          {!isLocked && (
          <Animated.View style={[styles.overlay, animatedControlsStyle]} pointerEvents={showControls ? 'auto' : 'none'}>
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.9)']}
                style={StyleSheet.absoluteFill}
              />

              {/* Top Bar */}
              <SafeAreaView style={styles.topBar} edges={['top']}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                  <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <Text style={styles.headerSubtitle}>S1:E1 • {subtitle}</Text>
                </View>
                <View style={styles.topRightActions}>
                    <TouchableOpacity style={styles.iconButton}>
                         <MaterialIcons name="cast" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
              </SafeAreaView>

              {/* Center Controls */}
              <View style={styles.centerControls}>
                <TouchableOpacity 
                    style={styles.skipButton} 
                    onPress={() => handleSkip(-10000)}
                >
                  <MaterialIcons name="replay-10" size={40} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.playPauseButton} 
                    onPress={handlePlayPause}
                >
                  {status?.isLoaded && status.isPlaying ? (
                    <Ionicons name="pause" size={45} color="#000" />
                  ) : (
                    <Ionicons name="play" size={45} color="#000" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.skipButton} 
                    onPress={() => handleSkip(10000)}
                >
                  <MaterialIcons name="forward-10" size={40} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Bottom Bar */}
              <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
                {/* Seek Bar */}
                <View style={styles.seekBarContainer}>
                     <Text style={styles.timeText}>
                        {status?.isLoaded ? formatTime(status.positionMillis) : '0:00'}
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarBuffered, { width: `${(getProgress() * 100) + 10}%` }]} />
                        <View style={[styles.progressBarFill, { width: `${getProgress() * 100}%` }]} />
                        <View style={[styles.progressBarKnob, { left: `${getProgress() * 100}%` }]} />
                    </View>
                    <Text style={styles.timeText}>
                        {status?.isLoaded && status.durationMillis ? formatTime(status.durationMillis) : '0:00'}
                    </Text>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.bottomActionButton} onPress={changePlaybackSpeed}>
                        <MaterialIcons name="speed" size={24} color="#fff" />
                        <Text style={styles.bottomActionText}>Speed ({playbackSpeed}x)</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.bottomActionButton} onPress={() => setIsLocked(true)}>
                        <MaterialIcons name="lock-outline" size={24} color="#fff" />
                        <Text style={styles.bottomActionText}>Lock</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bottomActionButton} onPress={() => setShowEpisodeDrawer(true)}>
                        <MaterialIcons name="video-library" size={24} color="#fff" />
                        <Text style={styles.bottomActionText}>Episodes</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.bottomActionButton} onPress={() => setShowQualityModal(true)}>
                        <MaterialIcons name="high-quality" size={24} color="#fff" />
                        <Text style={styles.bottomActionText}>Quality</Text>
                    </TouchableOpacity>

                     <TouchableOpacity style={styles.bottomActionButton} onPress={toggleResizeMode}>
                        <MaterialIcons name={videoResizeMode === ResizeMode.CONTAIN ? "fullscreen" : "fullscreen-exit"} size={26} color="#fff" />
                        <Text style={styles.bottomActionText}>{videoResizeMode === ResizeMode.CONTAIN ? 'Fill' : 'Fit'}</Text>
                    </TouchableOpacity>
                </View>
              </SafeAreaView>
          </Animated.View>
          )}
          
          {/* Loading Indicator */}
          {(!status?.isLoaded || status.isBuffering) && (
             <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#E50914" />
             </View>
          )}
        </View>
      </GestureDetector>

      {/* Episode Drawer Modal */}
      <Modal
        visible={showEpisodeDrawer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEpisodeDrawer(false)}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Episodes</Text>
                    <TouchableOpacity onPress={() => setShowEpisodeDrawer(false)}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={EPISODES}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.episodeItem}>
                            <Image source={{ uri: item.image }} style={styles.episodeImage} />
                            <View style={styles.episodeInfo}>
                                <Text style={styles.episodeTitle}>{item.id}. {item.title}</Text>
                                <Text style={styles.episodeDuration}>{item.duration}</Text>
                                <Text style={styles.episodeDesc} numberOfLines={2}>{item.desc}</Text>
                            </View>
                            <Ionicons name="play-circle-outline" size={28} color="#fff" />
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>

       {/* Video Quality Modal */}
       <Modal
        visible={showQualityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQualityModal(false)}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Video Quality</Text>
                    <TouchableOpacity onPress={() => setShowQualityModal(false)}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View>
                    {QUALITY_OPTIONS.map(opt => (
                        <TouchableOpacity 
                            key={opt} 
                            style={styles.optionItem}
                            onPress={() => handleQualityChange(opt)}
                        >
                            <Text style={[styles.optionText, videoQuality === opt && { color: '#E50914', fontWeight: 'bold' }]}>
                                {opt}
                            </Text>
                            {videoQuality === opt && <Ionicons name="checkmark" size={20} color="#E50914" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    padding: 8,
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#ccc',
    fontSize: 12,
  },
  topRightActions: {
      flexDirection: 'row',
      gap: 15,
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    alignItems: 'center',
    opacity: 0.9,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  seekBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    width: 40,
    textAlign: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarBuffered: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  progressBarKnob: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E50914',
    marginLeft: -7,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  bottomActionButton: {
    alignItems: 'center',
    gap: 4,
  },
  bottomActionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  rippleContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 5,
    paddingHorizontal: 50,
  },
  rippleSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  skipIntroContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 20,
  },
  skipIntroButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  skipIntroText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextEpisodeContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 20,
  },
  nextEpisodeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextEpisodeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  episodeItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  episodeImage: {
    width: 120,
    height: 68,
    borderRadius: 4,
    marginRight: 10,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  episodeDuration: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 2,
  },
  episodeDesc: {
    color: '#888',
    fontSize: 11,
  },
  warningContainer: {
      position: 'absolute',
      top: 50,
      left: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 8,
      borderRadius: 12,
      gap: 5,
      zIndex: 20,
  },
  warningText: {
      color: '#FFD700',
      fontSize: 12,
      fontWeight: '600',
  },
  lockedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  unlockButton: {
      backgroundColor: '#fff',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 30,
      gap: 8,
      marginBottom: 10,
  },
  unlockText: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 16,
  },
  lockedText: {
      color: '#fff',
      fontSize: 12,
      opacity: 0.8,
  },
  sectionHeader: {
      color: '#aaa',
      fontSize: 14,
      marginBottom: 10,
      fontWeight: '600',
  },
  optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      gap: 10,
  },
  optionText: {
      color: '#fff',
      fontSize: 16,
  },
});
