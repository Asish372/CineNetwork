import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl // Import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BENEFITS = [
  { id: '1', icon: 'film-outline', text: 'Unlimited Movies & TV Shows' },
  { id: '2', icon: 'phone-portrait-outline', text: 'Watch on Mobile & Tablet' },
  { id: '3', icon: 'download-outline', text: 'Download & Watch Offline' },
  { id: '4', icon: 'tv-outline', text: 'Cast to TV (Chromecast/AirPlay)' },
  { id: '5', icon: 'ban-outline', text: 'Ad-Free Experience' },
];

import Loader from '../../src/components/Loader';
import ScreenTransition from '../../src/components/ScreenTransition';
import contentService from '../../src/services/contentService'; // Import Service

import authService from '../../src/services/authService'; // Standard Import

export default function VipScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null);
  const [plans, setPlans] = React.useState<any[]>([]); // Dynamic Plans State
  const [isLoading, setIsLoading] = React.useState(false);

  // Background Animations
  const orb1Pos = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb2Pos = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb3Pos = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const [user, setUser] = React.useState<any>(null); // User state

  React.useEffect(() => {
    loadData();

    // Background Loop Animations
    const createFloatingAnimation = (animValue: Animated.ValueXY, duration: number, xRange: number, yRange: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: { x: xRange, y: yRange }, duration: duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(animValue, { toValue: { x: -xRange, y: -yRange }, duration: duration * 1.2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(animValue, { toValue: { x: 0, y: 0 }, duration: duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
    };

    Animated.parallel([
      createFloatingAnimation(orb1Pos, 6000, 50, 30),
      createFloatingAnimation(orb2Pos, 7000, -40, 60),
      createFloatingAnimation(orb3Pos, 8000, 30, -40),
    ]).start();
  }, []);

  const loadData = async () => {
      setIsLoading(true);
      try {
          // 1. Get User Status
          const userData = await authService.getMe();
          console.log("VIP Screen User Data:", JSON.stringify(userData, null, 2));

          setUser(userData);
          
          // DEBUG: Show Alert if user is loaded but not VIP, or any status
          const isVipStatus = userData && (userData.isVip || userData.subscription?.status === 'active');
          if (userData) {
             // alert(`Debug: VIP Status: ${isVipStatus}\nPlan: ${userData.subscription?.SubscriptionPlan?.name}`);
          }

          // 2. Get Plans (Regardless of status, maybe user wants to upgrade/see)
          const data = await contentService.getPlans();
          if (data && data.length > 0) {
              setPlans(data);
              setSelectedPlan(data[0].id);
          }
      } catch (e) {
          console.error("Failed to load data", e);
      } finally {
          setIsLoading(false);
      }
  };

  const isVip = user && (user.isVip || user.subscription?.status === 'active');
  const expirationDate = user?.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : 'Lifetime';

  return (
    <ScreenTransition>
      <View style={styles.container}>
        <Loader isLoading={isLoading} />
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        {/* Animated Background */}
        <LinearGradient colors={['#050505', '#101010', '#050505']} style={StyleSheet.absoluteFill} />
        
        {/* Orbs */}
        <Animated.View style={[styles.orb, styles.orb1, { transform: [{ translateX: orb1Pos.x }, { translateY: orb1Pos.y }] }]}>
          <LinearGradient colors={['#E50914', 'transparent']} start={{ x: 0.3, y: 0.3 }} end={{ x: 1, y: 1 }} style={styles.orbGradient} />
        </Animated.View>
        <Animated.View style={[styles.orb, styles.orb2, { transform: [{ translateX: orb2Pos.x }, { translateY: orb2Pos.y }] }]}>
          <LinearGradient colors={['#0044ff', 'transparent']} start={{ x: 0.7, y: 0.7 }} end={{ x: 0, y: 0 }} style={styles.orbGradient} />
        </Animated.View>
        <Animated.View style={[styles.orb, styles.orb3, { transform: [{ translateX: orb3Pos.x }, { translateY: orb3Pos.y }] }]}>
          <LinearGradient colors={['#800080', 'transparent']} start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }} style={styles.orbGradient} />
        </Animated.View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadData}
              tintColor="#FFD700"
              colors={['#FFD700']}
              progressBackgroundColor="#1a1a1a"
            />
          }
        >
          
          {/* Header */}
          <View style={styles.headerContainer}>
            <SafeAreaView edges={['top']} style={styles.headerContent}>
              <View style={styles.crownContainer}>
                <LinearGradient colors={['#FFD700', '#FDB931', '#FFD700']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.crownGradient}>
                  <Ionicons name={isVip ? "shield-checkmark" : "diamond"} size={40} color="#000" />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>{isVip ? "You are Premium" : "Go Membership"}</Text>
              <Text style={styles.headerSubtitle}>{isVip ? "Enjoy your unlimited access" : "Unlock the full experience"}</Text>
            </SafeAreaView>
          </View>

          {/* CONTENT SWITCH: VIP vs Non-VIP */}
          {isVip ? (
            <View style={styles.vipDashboard}>
               {/* Active Plan Card */}
               <View style={styles.activePlanCard}>
                  <LinearGradient
                    colors={['rgba(255, 215, 0, 0.1)', 'rgba(0,0,0,0)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.activePlanHeader}>
                      <Text style={styles.activePlanLabel}>CURRENT PLAN</Text>
                      <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>ACTIVE</Text>
                      </View>
                  </View>
                  <Text style={styles.activePlanName}>{user.subscription?.SubscriptionPlan?.name || "Gold Premium"}</Text>
                  
                  <View style={styles.planDetailsRow}>
                      <View>
                        <Text style={styles.planDetailLabel}>Valid Until</Text>
                        <Text style={styles.planDetailValue}>{expirationDate}</Text>
                      </View>
                      <View>
                        <Text style={styles.planDetailLabel}>Status</Text>
                        <Text style={{...styles.planDetailValue, color: '#4CAF50'}}>Active</Text>
                      </View>
                  </View>
               </View>

               {/* Enabled Benefits */}
               <View style={styles.benefitsContainer}>
                  <Text style={styles.sectionTitle}>Your Active Benefits</Text>
                  {BENEFITS.map((benefit) => (
                    <View key={benefit.id} style={styles.benefitItem}>
                      <View style={styles.benefitIcon}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      </View>
                      <Text style={styles.benefitText}>{benefit.text}</Text>
                    </View>
                  ))}
               </View>

               <TouchableOpacity style={styles.manageButton} onPress={() => { /* Maybe navigate to history or empty for now */ }}>
                   <Text style={styles.manageButtonText}>Manage Subscription</Text>
               </TouchableOpacity>

            </View>
          ) : (
            <>
              {/* Plans List for Non-VIP */}
              <View style={styles.plansContainer}>
                {plans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    activeOpacity={0.9}
                    onPress={() => setSelectedPlan(plan.id)}
                    style={[
                      styles.planCard,
                      selectedPlan === plan.id && styles.selectedPlanCard
                    ]}
                  >
                    <LinearGradient
                      colors={selectedPlan === plan.id ? ['rgba(229, 9, 20, 0.2)', 'rgba(0,0,0,0.6)'] : ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.4)']}
                      style={StyleSheet.absoluteFill}
                    />
                    
                    {plan.name.toLowerCase().includes('year') && (
                      <View style={styles.popularBadge}>
                        <LinearGradient colors={['#FFD700', '#FFA500']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.popularGradient}>
                          <Text style={styles.popularText}>BEST VALUE</Text>
                        </LinearGradient>
                      </View>
                    )}
                    
                    <View style={styles.planInfo}>
                      <Text style={[styles.planName, selectedPlan === plan.id && styles.selectedText]}>{plan.name}</Text>
                      <Text style={styles.saveText}>{plan.durationInDays} Days Access</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.price, selectedPlan === plan.id && styles.selectedText]}>₹{plan.price}</Text>
                    </View>
                    <View style={[styles.radioButton, selectedPlan === plan.id && styles.radioButtonSelected]}>
                      {selectedPlan === plan.id && <View style={styles.radioButtonInner} />}
                    </View>
                  </TouchableOpacity>
                ))}
                {plans.length === 0 && !isLoading && (
                    <Text style={{color: '#666', textAlign: 'center'}}>No plans available</Text>
                )}
              </View>

              {/* Benefits */}
              <View style={styles.benefitsContainer}>
                <Text style={styles.sectionTitle}>Premium Benefits</Text>
                {BENEFITS.map((benefit) => (
                  <View key={benefit.id} style={styles.benefitItem}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.benefitIcon}>
                      <Ionicons name={benefit.icon as any} size={20} color="#FFD700" />
                    </View>
                    <Text style={styles.benefitText}>{benefit.text}</Text>
                  </View>
                ))}
              </View>

              {/* Subscribe Button */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.subscribeButton} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.subscribeGradient}
                  >
                    <Text style={styles.subscribeText}>Subscribe Now</Text>
                    <Ionicons name="arrow-forward" size={20} color="#000" />
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  By subscribing, you agree to our Terms of Service. Cancel anytime.
                </Text>
              </View>
            </>
          )}

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
  orb: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.4,
  },
  orbGradient: {
    flex: 1,
    borderRadius: 200,
  },
  orb1: {
    top: -100,
    left: -50,
    width: 400,
    height: 400,
  },
  orb2: {
    bottom: -50,
    right: -100,
    width: 350,
    height: 350,
    opacity: 0.3,
  },
  orb3: {
    top: 300, // Approximate height/3
    left: width / 2 - 100,
    width: 200,
    height: 200,
    opacity: 0.2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownContainer: {
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  crownGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  planCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
  },
  popularGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  popularText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: 4,
  },
  selectedText: {
    color: '#fff',
  },
  saveText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginRight: 15,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ccc',
  },
  period: {
    fontSize: 12,
    color: '#888',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FFD700',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  benefitsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginLeft: 5,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  benefitText: {
    color: '#eee',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subscribeButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  subscribeGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  subscribeText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  vipDashboard: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  activePlanCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFD700',
    overflow: 'hidden',
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activePlanLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  activeBadgeText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activePlanName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  planDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 15,
  },
  planDetailLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  planDetailValue: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
      paddingVertical: 15,
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  manageButtonText: {
      color: '#fff',
      fontWeight: '600'
  }
});
