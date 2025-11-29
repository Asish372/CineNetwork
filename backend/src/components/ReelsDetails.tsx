import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReelItem } from './ReelsPlayer';

const { width, height } = Dimensions.get('window');

interface ReelsDetailsProps {
  item: ReelItem;
  onPlay: () => void;
  totalEpisodes?: number;
}

export default function ReelsDetails({ item, onPlay, totalEpisodes = 87 }: ReelsDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const episodesPerPage = 20;
  const tabs = ['1-20', '21-40', '41-60', '61-80', '81-100'];

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
          onPress={onPlay} // For now, clicking an episode also plays (or could select it)
        >
          <Text style={[styles.episodeNum, isCurrent && styles.activeEpisodeNum]}>{i}</Text>
          {isCurrent && (
             <Ionicons name="play" size={12} color="#E50914" style={styles.playingIcon} />
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
    <View style={styles.container}>
      {/* Background Image with Blur */}
      <Image source={{ uri: item.image }} style={styles.backgroundImage} contentFit="cover" />
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', '#000']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity style={styles.shareButton}>
             <Ionicons name="share-social" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Info Section */}
          <View style={styles.mainInfo}>
            <Image source={{ uri: item.image }} style={styles.poster} contentFit="cover" />
            <View style={styles.infoText}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Ionicons name="heart" size={16} color="#E50914" />
                        <Text style={styles.statText}>{item.likes}</Text>
                    </View>
                    <View style={styles.stat}>
                        <Ionicons name="chatbubble" size={16} color="#fff" />
                        <Text style={styles.statText}>{item.comments}</Text>
                    </View>
                </View>
                <View style={styles.tagsRow}>
                   <View style={styles.tag}><Text style={styles.tagText}>U/A 16+</Text></View>
                   <View style={styles.tag}><Text style={styles.tagText}>Drama</Text></View>
                </View>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            A gripping tale of suspense and mystery. Unfold the secrets as you watch through the episodes. 
            {/* Using generic text as mock data description is limited */}
          </Text>

          {/* Play Button */}
          <TouchableOpacity style={styles.playButton} onPress={onPlay}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.playButtonText}>Watch</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Season Selector */}
          <View style={styles.seasonContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.seasonScrollContent}
            >
              {['Season 1', 'Season 2', 'Season 3'].map((season, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.seasonChip, selectedSeason === index && styles.activeSeasonChip]}
                  onPress={() => setSelectedSeason(index)}
                >
                  <Text style={[styles.seasonText, selectedSeason === index && styles.activeSeasonText]}>
                    {season}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.totalEps}>{totalEpisodes} Episodes</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  shareButton: {
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
  scrollContent: {
    paddingBottom: 40,
  },
  mainInfo: {
    flexDirection: 'row',
    padding: 20,
    gap: 20,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  infoText: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: '#eee',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E50914',
    marginHorizontal: 20,
    paddingVertical: 14,
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
    marginBottom: 24,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  seasonContainer: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  seasonScrollContent: {
    gap: 10,
    paddingRight: 20,
  },
  seasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    // Bubble 3D Effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  activeSeasonChip: {
    backgroundColor: '#E50914',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  seasonText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
  activeSeasonText: {
    color: '#fff',
  },
  totalEps: {
    color: '#888',
    fontSize: 12,
    marginTop: 10,
    marginLeft: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 24,
  },
  tabItem: {
    paddingBottom: 8,
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
    color: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 10,
    justifyContent: 'flex-start',
  },
  episodeItem: {
    width: (width - 30 - 40) / 5,
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderColor: '#E50914',
    borderWidth: 1,
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
    top: 6,
    right: 6,
  },
});
