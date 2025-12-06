import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { ResizeMode, Video, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  Alert,
  TouchableWithoutFeedback,
  View,
  Vibration,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import contentService from '../../src/services/contentService';
import playbackService from '../../src/services/playbackService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video>(null);
  
  // Params
  const {
    id,
    title: initialTitle,
    video: initialVideo,
    position: initialPosition,
  } = params;
  
  const contentId = Array.isArray(id) ? id[0] : id;

  // State
  const [videoUrl, setVideoUrl] = useState(initialVideo as string);
  const [videoTitle, setVideoTitle] = useState(initialTitle as string);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false); // Start in false to ensure sync
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  
  // Animation
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Load Content if URL missing
  useEffect(() => {
    if (!videoUrl && contentId) {
      loadContentDetails();
    }
  }, [contentId, videoUrl]);

  const loadContentDetails = async () => {
    try {
      const content = await contentService.getContentById(contentId as string);
      if (content) {
        setVideoUrl(content.videoUrl);
        setVideoTitle(content.title);
      }
    } catch (error) {
      console.log('Failed to load content details:', error);
    }
  };

  // Orientation & Lifecycle
  useEffect(() => {
    // Force Landscape on mount
    const lockLandscape = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      // Check immediately after locking
      const current = await ScreenOrientation.getOrientationAsync();
      const isLandscape = 
        current === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
        current === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      setIsFullscreen(isLandscape);
    };
    lockLandscape();

    // Listen for orientation changes
    const subscription = ScreenOrientation.addOrientationChangeListener((evt) => {
      console.log('Orientation changed:', evt.orientationInfo.orientation);
      const isLandscape = 
        evt.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
        evt.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      setIsFullscreen(isLandscape);
      setOrientation(evt.orientationInfo.orientation);
    });

    // Reset controls timer
    resetControlsTimer();

    // Back Handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExit();
      return true;
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      backHandler.remove();
    };
  }, []);

  // Controls Visibility Logic
  const resetControlsTimer = () => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    controlsTimer.current = setTimeout(() => {
      if (status?.isLoaded && status.isPlaying) {
        hideControls();
      }
    }, 4000) as unknown as NodeJS.Timeout;
  };

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  };

  const toggleControls = () => {
    if (showControls) {
      hideControls();
    } else {
      resetControlsTimer();
    }
  };

  // Playback Logic
  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (status?.isLoaded) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
        resetControlsTimer(); // Keep controls visible when paused
      } else {
        await videoRef.current.playAsync();
        resetControlsTimer();
      }
    }
  };

  const handleSeek = async (value: number) => {
    if (!videoRef.current || !status?.isLoaded) return;
    resetControlsTimer();
    await videoRef.current.setPositionAsync(value);
  };

  const skip = async (amount: number) => {
    if (!videoRef.current || !status?.isLoaded) return;
    resetControlsTimer();
    const newPos = status.positionMillis + amount;
    await videoRef.current.setPositionAsync(newPos);
  };

  // Orientation Toggle
  const toggleOrientation = async () => {
    // Haptic Feedback
    Vibration.vibrate(50);

    try {
      if (isFullscreen) {
        // Switch to Portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } else {
        // Switch to Landscape (Left)
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
      }
    } catch (error) {
      console.log("Orientation toggle error:", error);
    }
  };

  const handleExit = async () => {
    // Save progress
    if (videoRef.current && status?.isLoaded) {
        try {
            await playbackService.savePosition(contentId as string, status.positionMillis);
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    }
    router.back();
  };

  // Format Time
  const formatTime = (millis: number) => {
    if (!millis) return "00:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Gestures
  const doubleTapLeft = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
        skip(-10000);
    })
    .runOnJS(true);

  const doubleTapRight = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
        skip(10000);
    })
    .runOnJS(true);

  const singleTap = Gesture.Tap()
    .onEnd(() => {
        toggleControls();
    })
    .runOnJS(true);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar hidden={true} />
      
      <View style={styles.container}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl || "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onPlaybackStatusUpdate={setStatus}
          onLoad={async () => {
             if (initialPosition) {
                 await videoRef.current?.playFromPositionAsync(parseInt(initialPosition as string, 10));
             }
          }}
        />

        {/* Gesture Layer */}
        <View style={StyleSheet.absoluteFill}>
            <GestureDetector gesture={Gesture.Exclusive(doubleTapLeft, doubleTapRight, singleTap)}>
                <View style={styles.gestureArea} />
            </GestureDetector>
        </View>

        {/* Controls Overlay */}
        <Animated.View 
            style={[
                StyleSheet.absoluteFill, 
                { opacity: controlsOpacity, zIndex: 100, elevation: 100 },
                !showControls && { pointerEvents: 'none' }
            ]}
            pointerEvents={showControls ? "box-none" : "none"}
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                style={styles.controlsContainer}
            >
                <SafeAreaView style={styles.controlsContent}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={handleExit} style={styles.iconButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.videoTitle} numberOfLines={1}>{videoTitle}</Text>
                    <View style={{ width: 40 }} /> 
                </View>

                {/* Center Controls */}
                <View style={styles.centerControls}>
                    <TouchableOpacity onPress={() => skip(-10000)} style={styles.skipButton}>
                        <MaterialIcons name="replay-10" size={40} color="#fff" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
                        <Ionicons 
                            name={status?.isLoaded && status.isPlaying ? "pause" : "play"} 
                            size={50} 
                            color="#000" 
                            style={{ marginLeft: status?.isLoaded && status.isPlaying ? 0 : 4 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => skip(10000)} style={styles.skipButton}>
                        <MaterialIcons name="forward-10" size={40} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <View style={styles.sliderRow}>
                        <Text style={styles.timeText}>
                            {formatTime(isDragging ? dragPosition : (status?.isLoaded ? status.positionMillis : 0))}
                        </Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={status?.isLoaded ? status.durationMillis || 0 : 0}
                            value={isDragging ? dragPosition : (status?.isLoaded ? status.positionMillis : 0)}
                            onSlidingStart={() => {
                                setIsDragging(true);
                                if (controlsTimer.current) clearTimeout(controlsTimer.current);
                            }}
                            onValueChange={(value) => {
                                setDragPosition(value);
                            }}
                            onSlidingComplete={async (value) => {
                                await handleSeek(value);
                                setIsDragging(false);
                            }}
                            minimumTrackTintColor="#E50914"
                            maximumTrackTintColor="rgba(255,255,255,0.3)"
                            thumbTintColor="#E50914"
                        />
                        <Text style={styles.timeText}>
                            {status?.isLoaded ? formatTime(status.durationMillis || 0) : "00:00"}
                        </Text>
                    </View>
                    
                    <View style={styles.bottomActions}>
                         <TouchableOpacity style={styles.actionButton}>
                            <MaterialIcons name="subtitles" size={20} color="#fff" />
                            <Text style={styles.actionText}>Audio & Subs</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialIcons name="hd" size={20} color="#fff" />
                            <Text style={styles.actionText}>Quality</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={toggleOrientation} 
                            style={styles.iconButton}
                            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                        >
                            <MaterialIcons 
                                name={isFullscreen ? "fullscreen-exit" : "fullscreen"} 
                                size={28} 
                                color="#fff" 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>
            </LinearGradient>
        </Animated.View>

        {/* Loading Indicator */}
        {(!status?.isLoaded || status.isBuffering) && (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        )}

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  gestureArea: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  controlsContainer: {
    flex: 1,
  },
  controlsContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconButton: {
    padding: 8,
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  skipButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
  },
  bottomBar: {
    gap: 10,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    width: 45,
    textAlign: 'center',
  },
  bottomActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
  },
  actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
  },
  actionText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
  },
  loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 5,
      pointerEvents: 'none',
  },
});
