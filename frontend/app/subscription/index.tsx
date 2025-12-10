import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import contentService from '../../src/services/contentService';
// import { Colors } from '../../src/constants/Colors'; // Deleted

const Colors = {
  primary: '#E50914', // Netflix Red
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await contentService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan) => {
    Alert.alert(
      'Confirm Subscription',
      `Subscribe to ${plan.name} for ₹${plan.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => {
             // Mock Payment
             Alert.alert('Success', 'Welcome to Premium!');
             router.back();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section */}
        <View style={styles.hero}>
           <Text style={styles.heroTitle}>Unlock Premium Access</Text>
           <Text style={styles.heroSubtitle}>Watch Ad-free, 4K resolution, and download your favorite movies.</Text>
        </View>

        {/* Plans Grid */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity 
                key={plan.id} 
                style={[
                    styles.planCard, 
                    selectedPlan?.id === plan.id && styles.selectedCard,
                    plan.name.toLowerCase().includes('gold') && { borderColor: '#FFD700' }
                ]}
                onPress={() => setSelectedPlan(plan)}
                activeOpacity={0.9}
            >
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              
              {/* Badge */}
              {plan.name.toLowerCase().includes('gold') && (
                 <View style={styles.badge}>
                    <Text style={styles.badgeText}>BEST VALUE</Text>
                 </View>
              )}

              <View style={styles.cardContent}>
                  <Text style={[styles.planName, plan.name.toLowerCase().includes('gold') && { color: '#FFD700' }]}>{plan.name}</Text>
                  <Text style={styles.planPrice}>₹{plan.price}<Text style={styles.planDuration}> / {plan.durationInDays} days</Text></Text>
                  
                  <View style={styles.separator} />
                  
                  {/* Features */}
                  {(plan.features || []).map((feature, i) => (
                      <View key={i} style={styles.featureRow}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                          <Text style={styles.featureText}>{feature}</Text>
                      </View>
                  ))}
              </View>

              {/* Radio Selection Visual */}
              <View style={[styles.radio, selectedPlan?.id === plan.id && styles.radioSelected]}>
                  {selectedPlan?.id === plan.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.footer}>
         <TouchableOpacity 
            style={[styles.subscribeButton, !selectedPlan && styles.disabledButton]}
            disabled={!selectedPlan}
            onPress={() => selectedPlan && handleSubscribe(selectedPlan)}
         >
            <Text style={styles.subscribeText}>
                {selectedPlan ? `Subscribe to ${selectedPlan.name}` : 'Select a Plan'}
            </Text>
         </TouchableOpacity>
         <Text style={styles.disclaimer}>Recurring billing. Cancel anytime.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  plansContainer: {
    padding: 20,
    gap: 15,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(229, 9, 20, 0.05)',
  },
  cardContent: {
    padding: 20,
    zIndex: 1,
  },
  planName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planPrice: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  planDuration: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'normal',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 15,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  featureText: {
    color: '#ccc',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 16,
    zIndex: 2,
  },
  badgeText: {
    color: 'black',
    fontSize: 10,
    fontWeight: 'bold',
  },
  radio: {
     position: 'absolute',
     top: 20,
     right: 20,
     width: 24,
     height: 24,
     borderRadius: 12,
     borderWidth: 2,
     borderColor: '#666',
     justifyContent: 'center',
     alignItems: 'center',
     zIndex: 2,
  },
  radioSelected: {
     borderColor: Colors.primary,
  },
  radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: Colors.primary,
  },
  footer: {
     position: 'absolute',
     bottom: 0,
     left: 0,
     right: 0,
     backgroundColor: 'black',
     padding: 20,
     paddingBottom: 40,
     borderTopWidth: 1,
     borderTopColor: 'rgba(255,255,255,0.1)',
  },
  subscribeButton: {
      backgroundColor: Colors.primary,
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 10,
  },
  disabledButton: {
      backgroundColor: '#333',
  },
  subscribeText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
  disclaimer: {
      color: '#666',
      fontSize: 12,
      textAlign: 'center',
  }
});
