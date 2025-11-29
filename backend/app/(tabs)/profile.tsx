import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MENU_ITEMS = [
  { id: '1', icon: 'person-outline', label: 'Account Settings' },
  { id: '2', icon: 'card-outline', label: 'Subscription Plan', badge: 'VIP' },
  { id: '3', icon: 'notifications-outline', label: 'Notifications' },
  { id: '4', icon: 'shield-checkmark-outline', label: 'Parental Controls' },
  { id: '5', icon: 'help-circle-outline', label: 'Help & Support' },
];

import Loader from '../../src/components/Loader';

import ScreenTransition from '../../src/components/ScreenTransition';

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenTransition>
      <View style={styles.container}>
        <Loader isLoading={isLoading} />
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header / Profile Info */}
          <LinearGradient
            colors={['#1a1a1a', '#000']}
            style={styles.header}
          >
            <SafeAreaView edges={['top']}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80' }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                  <View style={styles.editBadge}>
                    <Ionicons name="pencil" size={12} color="#fff" />
                  </View>
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>Asish</Text>
                  <Text style={styles.userEmail}>hello.asish@example.com</Text>
                  <View style={styles.vipBadge}>
                    <Ionicons name="diamond" size={12} color="#FFD700" />
                    <Text style={styles.vipText}>VIP Member</Text>
                  </View>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>My List</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Watched</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>5</Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          {/* Menu Options */}
          <View style={styles.menuContainer}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.label === 'Subscription Plan') {
                    router.push('/vip');
                  }
                }}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={22} color="#888" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}



            {/* Logout */}
            <TouchableOpacity style={[styles.menuItem, styles.logoutButton]}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="log-out-outline" size={22} color="#E50914" />
              </View>
              <Text style={[styles.menuLabel, styles.logoutText]}>Log Out</Text>
            </TouchableOpacity>
            
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>

        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E50914',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E50914',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
    color: '#aaa',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 6,
  },
  vipText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#333',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#1a1a1a',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  menuBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 10,
  },
  menuBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#888',
  },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    backgroundColor: 'rgba(229, 9, 20, 0.05)',
  },
  logoutText: {
    color: '#E50914',
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    color: '#888',
  },
});
