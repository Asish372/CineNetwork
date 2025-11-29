import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  // Entry Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Background Animations
  const orb1Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb2Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb3Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

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

  }, []);

  const handleGenerateOTP = () => {
    // Implement OTP generation logic here
    console.log('Generate OTP for:', email);
    // Navigate to OTP screen or show success message
    // router.push('/auth/otp'); 
  };

  return (
    <View style={styles.container}>
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

      {/* Content Overlay */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, zIndex: 10 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Image
              source={require('../../assets/images/login-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>CINE NETWORK</Text>

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive an OTP</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity onPress={handleGenerateOTP} activeOpacity={0.8}>
              <LinearGradient
                colors={['#E50914', '#B20710']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Generate OTP</Text>
              </LinearGradient>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    top: height / 3,
    left: width / 2 - 100,
    width: 200,
    height: 200,
    opacity: 0.2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center', // Center align header content
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    marginTop: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
