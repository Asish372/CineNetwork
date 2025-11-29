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

const PLANS = [
  { id: 'monthly', name: 'Monthly', price: '₹500', period: '/mo', save: '' },
  { id: 'yearly', name: 'Yearly', price: '₹4000', period: '/yr', save: 'Save ₹2000', popular: true },
];

import Loader from '../../src/components/Loader';

import ScreenTransition from '../../src/components/ScreenTransition';

export default function VipScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = React.useState('yearly');
  const [isLoading, setIsLoading] = React.useState(false);

  // Background Animations
  const orb1Pos = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb2Pos = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb3Pos = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Background Loop Animations
    const createFloatingAnimation = (animValue: Animated.ValueXY, duration: number, xRange: number, yRange: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: { x: xRange, y: yRange },
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: { x: -xRange, y: -yRange },
            duration: duration * 1.2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: { x: 0, y: 0 },
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createFloatingAnimation(orb1Pos, 6000, 50, 30),
      createFloatingAnimation(orb2Pos, 7000, -40, 60),
      createFloatingAnimation(orb3Pos, 8000, 30, -40),
    ]).start();

    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenTransition>
      <View style={styles.container}>
        <Loader isLoading={isLoading} />
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        {/* Animated Background */}
        <LinearGradient
          colors={['#050505', '#101010', '#050505']}
          style={StyleSheet.absoluteFill}
        />

        {/* Organic Background Orbs */}
        <Animated.View style={[styles.orb, styles.orb1, {
          transform: [{ translateX: orb1Pos.x }, { translateY: orb1Pos.y }]
        }]}>
          <LinearGradient
            colors={['#E50914', 'transparent']}
            start={{ x: 0.3, y: 0.3 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbGradient}
          />
        </Animated.View>

        <Animated.View style={[styles.orb, styles.orb2, {
          transform: [{ translateX: orb2Pos.x }, { translateY: orb2Pos.y }]
        }]}>
          <LinearGradient
            colors={['#0044ff', 'transparent']}
            start={{ x: 0.7, y: 0.7 }}
            end={{ x: 0, y: 0 }}
            style={styles.orbGradient}
          />
        </Animated.View>

        <Animated.View style={[styles.orb, styles.orb3, {
          transform: [{ translateX: orb3Pos.x }, { translateY: orb3Pos.y }]
        }]}>
          <LinearGradient
            colors={['#800080', 'transparent']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbGradient}
          />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header / Hero */}
          <View style={styles.headerContainer}>
            <SafeAreaView edges={['top']} style={styles.headerContent}>
              <View style={styles.crownContainer}>
                <LinearGradient
                  colors={['#FFD700', '#FDB931', '#FFD700']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.crownGradient}
                >
                  <Ionicons name="diamond" size={40} color="#000" />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>Go Membership</Text>
              <Text style={styles.headerSubtitle}>Unlock the full experience</Text>
            </SafeAreaView>
          </View>

          {/* Plans */}
          <View style={styles.plansContainer}>
            {PLANS.map((plan) => (
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
                
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <LinearGradient
                      colors={['#FFD700', '#FFA500']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.popularGradient}
                    >
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </LinearGradient>
                  </View>
                )}
                
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, selectedPlan === plan.id && styles.selectedText]}>{plan.name}</Text>
                  {plan.save ? <Text style={styles.saveText}>{plan.save}</Text> : null}
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.price, selectedPlan === plan.id && styles.selectedText]}>{plan.price}</Text>
                  <Text style={[styles.period, selectedPlan === plan.id && styles.selectedText]}>{plan.period}</Text>
                </View>
                <View style={[styles.radioButton, selectedPlan === plan.id && styles.radioButtonSelected]}>
                  {selectedPlan === plan.id && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            ))}
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
});
