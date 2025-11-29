import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Arrival',
    message: 'Season 4 of "Stranger Things" is now available!',
    time: '2m ago',
    icon: 'film-outline',
    color: '#E50914',
    read: false,
  },
  {
    id: '2',
    title: 'Subscription',
    message: 'Your VIP plan expires in 3 days. Renew now to keep watching.',
    time: '1h ago',
    icon: 'card-outline',
    color: '#FFD700',
    read: false,
  },
  {
    id: '3',
    title: 'Trending',
    message: '"Inception" is trending in your region.',
    time: '5h ago',
    icon: 'trending-up-outline',
    color: '#0044ff',
    read: true,
  },
  {
    id: '4',
    title: 'System Update',
    message: 'We have improved the video player performance.',
    time: '1d ago',
    icon: 'settings-outline',
    color: '#333',
    read: true,
  },
];

interface NotificationPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isVisible, onClose }: NotificationPanelProps) {
  const [showModal, setShowModal] = React.useState(isVisible);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [isVisible]);

  if (!showModal) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Blur Background */}
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.panelContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: fadeAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(30,30,30,0.95)', 'rgba(10,10,10,0.98)']}
                style={styles.panelGradient}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Notifications</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* List */}
                <FlatList
                  data={MOCK_NOTIFICATIONS}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.itemContainer, !item.read && styles.unreadItem]}>
                      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                        <Ionicons name={item.icon} size={20} color={item.color} />
                      </View>
                      <View style={styles.textContainer}>
                        <View style={styles.titleRow}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <Text style={styles.itemTime}>{item.time}</Text>
                        </View>
                        <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
                      </View>
                      {!item.read && <View style={styles.dot} />}
                    </TouchableOpacity>
                  )}
                />
                
                {/* Footer */}
                <TouchableOpacity style={styles.footer}>
                  <Text style={styles.footerText}>Mark all as read</Text>
                </TouchableOpacity>

              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end', // Align to right
    paddingTop: 60, // Below header
    paddingRight: 16,
  },
  panelContainer: {
    width: width * 0.85,
    maxWidth: 350,
    height: 500,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  panelGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  unreadItem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemTime: {
    fontSize: 10,
    color: '#888',
  },
  itemMessage: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E50914',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
});
