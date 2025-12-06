import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Action', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80' },
  { id: '2', name: 'Comedy', image: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=400&q=80' },
  { id: '3', name: 'Drama', image: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=400&q=80' },
  { id: '4', name: 'Sci-Fi', image: 'https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=400&q=80' },
  { id: '5', name: 'Horror', image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cd4?w=400&q=80' },
  { id: '6', name: 'Romance', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
];

const POPULAR_SEARCHES = ['Cyberpunk', 'Space Travel', 'Anime', 'Superheroes', 'Documentaries'];

import Loader from '../../src/components/Loader';

import ScreenTransition from '../../src/components/ScreenTransition';

import { TRENDING_NOW } from '../../src/data/mockData';

import contentService from '../../src/services/contentService';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce Search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsLoading(true);
        try {
          const results = await contentService.searchContent(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); // Faster debounce for "suggestion" feel

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleTagPress = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <ScreenTransition>
      <View style={styles.container}>
        <Loader isLoading={isLoading} />
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <BlurView intensity={20} tint="dark" style={styles.searchBlur}>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search movies, shows, genres..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </BlurView>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Search Results */}
            {searchQuery.length > 2 ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Results for "{searchQuery}"</Text>
                    {searchResults.length === 0 && !isLoading ? (
                        <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>No results found.</Text>
                    ) : (
                        <View style={styles.resultsGrid}>
                            {searchResults.map((item) => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={styles.resultCard}
                                    activeOpacity={0.7}
                                    onPress={() => router.push({
                                        pathname: '/details/[id]',
                                        params: { 
                                            id: item.id,
                                            title: item.title,
                                            subtitle: item.genre || 'Movie',
                                            video: item.videoUrl,
                                            image: item.thumbnailUrl,
                                            likes: '10K',
                                            comments: '500'
                                        }
                                    })}
                                >
                                    <Image source={{ uri: item.thumbnailUrl }} style={styles.resultImage} contentFit="cover" />
                                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardGradient}>
                                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            ) : (
                <>
                    {/* Popular Searches */}
                    <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Popular Searches</Text>
                    <View style={styles.tagsContainer}>
                        {POPULAR_SEARCHES.map((tag, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.tag}
                            onPress={() => handleTagPress(tag)}
                        >
                            <Text style={styles.tagText}>{tag}</Text>
                        </TouchableOpacity>
                        ))}
                    </View>
                    </View>

                    {/* Recommended for You */}
                    <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15 }}>
                        {TRENDING_NOW.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.recommendedCard}
                            activeOpacity={0.7}
                            onPress={() => router.push({
                            pathname: '/details/[id]',
                            params: { 
                                id: item.id,
                                title: item.title,
                                subtitle: 'Recommended',
                                video: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
                                image: item.image,
                                likes: '9.9K',
                                comments: '666'
                            }
                            })}
                        >
                            <Image source={{ uri: item.image }} style={styles.recommendedImage} contentFit="cover" />
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardGradient}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        ))}
                    </ScrollView>
                    </View>

                    {/* Categories */}
                    <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Browse Categories</Text>
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map((category) => (
                        <TouchableOpacity 
                            key={category.id} 
                            style={styles.categoryCard} 
                            activeOpacity={0.8}
                            onPress={() => handleTagPress(category.name)}
                        >
                            <Image source={{ uri: category.image }} style={styles.categoryImage} contentFit="cover" />
                            <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.categoryOverlay}
                            >
                            <Text style={styles.categoryName}>{category.name}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        ))}
                    </View>
                    </View>
                </>
            )}

          </ScrollView>
        </SafeAreaView>
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  tagText: {
    color: '#ccc',
    fontSize: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 55) / 2,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 10,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  recommendedCard: {
    width: 140,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  recommendedImage: {
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
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  resultCard: {
    width: (width - 55) / 2,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom: 15,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
});
