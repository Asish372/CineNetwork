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
  View,
  Vibration,
  Pressable
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../src/services/api'; 
import contentService from '../../src/services/contentService';
import playbackService from '../../src/services/playbackService';

// Backend Endpoints
const API_BASE = api.defaults.baseURL; // http://192.168.0.103:5000/api
const TOKEN_ENDPOINT = `${API_BASE}/secure/get-token`;
// Proxy Base: Use backend proxy to validate token
const PROXY_BASE = `${API_BASE}/secure/stream`; 

// --- Utils: parse time & VTT ---
function parseTimeToMs(t: string) {
  const s = t.replace(",", ".").trim();
  const parts = s.split(':').map(Number);
  let ms = 0;
  if (parts.length === 3) ms = (parts[0]*3600 + parts[1]*60 + parts[2]) * 1000;
  else if (parts.length === 2) ms = (parts[0]*60 + parts[1]) * 1000;
  if (s.includes('.')) {
    const frac = s.split('.').pop();
    ms = Math.round(ms + Number("0." + frac) * 1000);
  }
  return ms;
}

async function fetchVTT(url: string, token: string | null) {
  if (!url) return [];
  try {
    const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
    const txt = await res.text();
    const lines = txt.split(/\r?\n/);
    const cues = [];
    let i = 0;
    while (i < lines.length) {
      if (!lines[i].trim()) { i++; continue; }
      // find time line
      if (!lines[i].includes('-->')) { i++; continue; }
      const [start, end] = lines[i].split('-->').map(s => s.trim());
      i++;
      let text = "";
      while (i < lines.length && lines[i].trim()) {
        text += (text ? "\n" : "") + lines[i];
        i++;
      }
      cues.push({ start: parseTimeToMs(start), end: parseTimeToMs(end), text });
    }
    return cues;
  } catch (e) {
    console.warn("VTT fetch/parse failed", e);
    return [];
  }
}

// --- parse master playlist for variants (returns array of {label, uri}) ---
async function parseMasterPlaylist(url: string, token: string | null) {
  try {
    const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
    const txt = await res.text();
    const lines = txt.split(/\r?\n/);
    const variants = [];
    for (let i=0;i<lines.length;i++) {
      const line = lines[i];
      if (line && line.startsWith('#EXT-X-STREAM-INF:')) {
        // find RESOLUTION or BANDWIDTH
        const attrs = line.replace('#EXT-X-STREAM-INF:', '').split(',');
        const resolution = attrs.find(a => a.includes('RESOLUTION'));
        const bw = attrs.find(a => a.includes('BANDWIDTH'));
        const label = resolution ? resolution.split('=')[1] : (bw ? `bw:${bw.split('=')[1]}` : `variant${variants.length+1}`);
        // next non-empty line is URI
        let j = i+1; while (j<lines.length && !lines[j].trim()) j++;
        if (j<lines.length) {
          // resolve relative URI
          const uri = new URL(lines[j].trim(), url).toString();
          variants.push({ label: label.replace(/"/g,''), uri });
        }
      }
    }
    return variants;
  } catch (e) {
    console.warn("Master playlist parse error", e);
    return [];
  }
}

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video>(null);
  
  const { id } = params;
  const contentId = Array.isArray(id) ? id[0] : id;

  const [token, setToken] = useState<string | null>(null);
  const [qualities, setQualities] = useState<any[]>([]); // manual options
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [masterUrl, setMasterUrl] = useState<string>(''); // Original Master URL
  const [cues, setCues] = useState<any[]>([]);
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

  // Animation
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Token & Master URL
  useEffect(() => {
    let mounted = true;
    (async () => {
        try {
            // Get Stream URL first
            const streamUrl = await contentService.getStreamUrl(contentId as string);
            if (!streamUrl) throw new Error("No stream URL");
            
            if (mounted) {
                setMasterUrl(streamUrl);

                // CHECK: Is this HLS or Direct MP4?
                const isHLS = streamUrl.includes('.m3u8');
                
                if (isHLS) {
                    // Proxy logic: Construct Proxy URL for Master
                    // The master playlist is fetched via Proxy so backend can validate token and fetch from storage
                    // BUT wait, our backend proxy logic expects /secure/stream/VIDEO_ID/FILE_NAME
                    // streamUrl is http://.../VIDEO_ID/master.m3u8
                    // We need to transform this to PROXY_BASE/VIDEO_ID/master.m3u8
                    
                    // Extract video ID and filename
                    const parts = streamUrl.split('/');
                    const filename = parts.pop();
                    const vidId = parts.pop();
                    const proxyUrl = `${PROXY_BASE}/${vidId}/${filename}`;
                    
                    setCurrentUrl(proxyUrl);
                } else {
                    // Direct MP4 (Legacy/External)
                    // Use URL directly, no token handling needed if public
                    console.log("Playing Direct MP4:", streamUrl);
                    setCurrentUrl(streamUrl);
                    // For direct playback, we don't need the secure token for the video request itself 
                    // if it's external (e.g., Google Storage).
                    // If it's internal secure MP4, we might need it, but for now assuming external as per seed.
                }
            }

            // Fetch Token (Still fetch it for consistencies or future secure MP4)
            const r = await fetch(TOKEN_ENDPOINT);
            const j = await r.json();
            if (mounted) setToken(j.token);

        } catch (e) {
            console.warn("Setup failed", e);
            Alert.alert("Error", "Unable to load video.");
        } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [contentId]);

  // 2. Parse Manifest (Qualities)
  useEffect(() => {
    if (!token || !currentUrl) return;
    (async () => {
      try {
        const q = await parseMasterPlaylist(currentUrl, token);
        setQualities(q);
        
        // Setup orientation
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (e) { console.warn(e); }
    })();
    
    return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, [token, currentUrl]);

  // 3. Subtitle Sync
  useEffect(() => {
    const pos = status.positionMillis ?? 0;
    if (!cues || cues.length === 0) { setSubtitle(''); return; }
    const c = cues.find((cc: any) => pos >= cc.start && pos <= cc.end);
    setSubtitle(c ? c.text : '');
  }, [status.positionMillis, cues]);

  // 4. Token Refresh
  useEffect(() => {
    if (!token) return;
    const iv = setInterval(async () => {
      if (isRefreshingToken) return;
      setIsRefreshingToken(true);
      try {
        const r = await fetch(TOKEN_ENDPOINT);
        const j = await r.json();
        setToken(j.token);
      } catch (e) { console.warn("token refresh failed", e); }
      setIsRefreshingToken(false);
    }, 90_000); // 90s
    return () => clearInterval(iv);
  }, [token]);

  // Controls Logic
  const resetControlsTimer = () => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setShowControls(true);
    Animated.timing(controlsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    controlsTimer.current = setTimeout(() => {
      if (status?.isPlaying) {
        Animated.timing(controlsOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setShowControls(false));
      }
    }, 4000);
  };

  // Double-tap skip
  const lastTap = useRef(0);
  const handleTap = async (side: "left" | "right") => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (videoRef.current && status.positionMillis != null) {
        const skipAmount = side === "right" ? 10000 : -10000;
        const newPos = Math.max(0, status.positionMillis + skipAmount);
        await videoRef.current.setPositionAsync(newPos);
        resetControlsTimer();
      }
    }
    lastTap.current = now;
    // Single tap toggles controls
    toggleControls(); 
  };

  const toggleControls = () => {
    if (showControls) {
       Animated.timing(controlsOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setShowControls(false));
    } else {
       resetControlsTimer();
    }
  };

  const skip = async (amount: number) => {
    if (!videoRef.current || !status?.isLoaded) return;
    resetControlsTimer();
    const newPos = status.positionMillis + amount;
    await videoRef.current.setPositionAsync(newPos);
  };

  const switchQuality = async (uri: string) => {
    try {
      setLoading(true);
      if (videoRef.current) {
          await videoRef.current.pauseAsync();
           // Construct proxy URL for variant if needed, 
           // but normally the master playlist uses relative paths which parseMasterPlaylist converts to absolute.
           // Since parseMasterPlaylist uses the 'url' arg as base, and consistent with proxyUrl, 
           // the 'uri' here should already be pointing to the proxy if parseMasterPlaylist resolves correctly against the proxy base.
          await videoRef.current.loadAsync({ 
              uri: uri,
              headers: token ? { Authorization: `Bearer ${token}` } : {}
          }, { shouldPlay: true });
      }
      setCurrentUrl(uri);
    } catch (e) {
      console.warn("switchQuality failed", e);
      Alert.alert("Quality switch failed");
    } finally { setLoading(false); }
  };

  const formatTime = (millis: number) => {
    if (!millis) return "00:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentUrl || !token) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E50914" />
          </View>
      );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar hidden={true} />
      
      <View style={styles.container}>
        <View style={styles.videoContainer}>
            <Video
            ref={videoRef}
            source={{
                uri: currentUrl,
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls={false}
            shouldPlay
            onPlaybackStatusUpdate={(s) => {
                setStatus(s);
                if (s.isLoaded && s.isPlaying && showControls) {
                    // logic moved to timer
                }
            }}
            onError={(e) => console.warn("player error", e)}
            />
            {/* Double Tap & Controls Check Overlay */}
             <View style={StyleSheet.absoluteFill}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <Pressable style={{ flex: 1 }} onPress={() => handleTap("left")} />
                    <Pressable style={{ flex: 1 }} onPress={() => handleTap("right")} />
                </View>
            </View>

             {subtitle ? (
                <View style={styles.subtitleBox}>
                    <Text style={styles.subtitleText}>{subtitle}</Text>
                </View>
            ) : null}
        </View>

        {/* Controls Overlay */}
        <Animated.View 
            style={[
                StyleSheet.absoluteFill, 
                { opacity: controlsOpacity, zIndex: 100 },
                !showControls && { pointerEvents: 'none' }
            ]}
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                style={styles.controlsContainer}
            >
                <SafeAreaView style={styles.controlsContent}>
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <Ionicons name="arrow-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.videoTitle}>Secure Playback</Text>
                    </View>

                    {/* Center Controls */}
                    <View style={styles.centerControls}>
                         <TouchableOpacity onPress={() => skip(-10000)} style={styles.skipButton}>
                            <MaterialIcons name="replay-10" size={40} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => {
                            if (status.isPlaying) videoRef.current?.pauseAsync();
                            else videoRef.current?.playAsync();
                            resetControlsTimer();
                        }} style={styles.playButton}>
                            <Ionicons 
                                name={status?.isPlaying ? "pause" : "play"} 
                                size={50} 
                                color="#000" 
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
                                {formatTime(isDragging ? dragPosition : (status?.positionMillis || 0))}
                            </Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={status?.durationMillis || 0}
                                value={isDragging ? dragPosition : (status?.positionMillis || 0)}
                                onSlidingStart={() => {
                                    setIsDragging(true);
                                    if (controlsTimer.current) clearTimeout(controlsTimer.current);
                                }}
                                onValueChange={setDragPosition}
                                onSlidingComplete={async (value) => {
                                    await videoRef.current?.setPositionAsync(value);
                                    setIsDragging(false);
                                    resetControlsTimer();
                                }}
                                minimumTrackTintColor="#E50914"
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor="#E50914"
                            />
                            <Text style={styles.timeText}>
                                {formatTime(status?.durationMillis || 0)}
                            </Text>
                        </View>

                        <View style={styles.qualitiesRow}>
                            {qualities.length > 0 ? (
                                qualities.map((q, i) => (
                                    <TouchableOpacity key={i} style={styles.qualityBtn} onPress={() => switchQuality(q.uri)}>
                                        <Text style={styles.qualityText}>{q.label}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.qualityText}>Auto</Text>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </Animated.View>
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#E50914" />
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000',  justifyContent: 'center' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  videoContainer: { width: '100%', height: '100%' },
  video: { width: '100%', height: '100%' },
  controlsContainer: { flex: 1 },
  controlsContent: { flex: 1, justifyContent: 'space-between', padding: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: 8 },
  videoTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 15 },
  centerControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40 },
  playButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  skipButton: { padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 30 },
  bottomBar: { gap: 15 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slider: { flex: 1, height: 40 },
  timeText: { color: '#fff', fontSize: 12, width: 45, textAlign: 'center' },
  qualitiesRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  qualityBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#666', borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.4)' },
  qualityText: { color: '#fff', fontSize: 12 },
  subtitleBox: { position: "absolute", bottom: 20, left: 20, right: 20, alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", padding: 8, borderRadius: 6 },
  subtitleText: { color: "white", textAlign: "center", fontSize: 16 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 50 }
});
