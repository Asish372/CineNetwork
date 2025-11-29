import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from '../../src/services/authService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [isEmail, setIsEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');

  // Entry Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Background Animations
  const orb1Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb2Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb3Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Toggle Animation
  const toggleAnim = useRef(new Animated.Value(0)).current; // 0 for Phone, 1 for Email
  const formFadeAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: isEmail ? 1 : 0,
      friction: 5,
      tension: 40,
      useNativeDriver: false, // layout animation
    }).start();

    // Fade out, switch, fade in
    formFadeAnim.setValue(0);
    Animated.timing(formFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isEmail]);

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      if (isEmail) {
        if (!email || !password) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
        await authService.login({ email, password });
        router.replace('/(tabs)');
      } else {
        if (!phone) {
          Alert.alert('Error', 'Please enter your phone number');
          return;
        }
        await authService.sendLoginOtp(phone);
        router.push({ pathname: '/auth/otp', params: { phone, mode: 'login' } });
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const CONTAINER_PADDING = 24;
  const FORM_PADDING = 20;
  const TOGGLE_PADDING = 4;
  const TOGGLE_CONTAINER_WIDTH = width - (CONTAINER_PADDING * 2) - (FORM_PADDING * 2);
  const PILL_WIDTH = (TOGGLE_CONTAINER_WIDTH - (TOGGLE_PADDING * 2)) / 2;

  const toggleX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [TOGGLE_PADDING, TOGGLE_CONTAINER_WIDTH / 2] 
  });

  const phoneColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000', '#888'] // Active text black (on white pill), inactive gray
  });

  const emailColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#888', '#000']
  });

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
        style={{ flex: 1, zIndex: 10, justifyContent: 'center' }}
      >
        <View
          style={styles.staticContent}
        >
          {/* Logo Section */}
          <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Image
              source={require('../../assets/images/login-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.appName}>CINE NETWORK</Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Animated Toggle Switch */}
            <View style={styles.toggleContainer}>
              <Animated.View style={[styles.activeTogglePill, { 
                transform: [{ translateX: toggleX }],
                width: PILL_WIDTH 
              }]} />
              
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsEmail(false)}
                activeOpacity={1}
              >
                <Animated.Text style={[styles.toggleText, { color: phoneColor }]}>Phone</Animated.Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsEmail(true)}
                activeOpacity={1}
              >
                <Animated.Text style={[styles.toggleText, { color: emailColor }]}>Email</Animated.Text>
              </TouchableOpacity>
            </View>

            {/* Inputs with Transition */}
            <Animated.View style={{ opacity: formFadeAnim }}>
              {isEmail ? (
                <>
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
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#666"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={styles.forgotPass}
                    onPress={() => router.push('/auth/forgot-password')}
                  >
                    <Text style={styles.forgotPassText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#666"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}
            </Animated.View>


            {/* Login Button */}
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
              <LinearGradient
                colors={['#E50914', '#B20710']} // Netflix-ish red gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? <ActivityIndicator color="#fff" /> : (isEmail ? 'Login' : 'Send OTP')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="google" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="facebook" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </View>
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
  staticContent: {
    width: '100%',
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30, // Reduced margin
  },
  logo: {
    width: 80, // Reduced size
    height: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)', // Slight overlay for readability
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)', // Glassmorphic background
    borderRadius: 30, // More rounded
    padding: 4,
    marginBottom: 24,
    position: 'relative',
    height: 50, // Slightly taller
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  activeTogglePill: {
    position: 'absolute',
    top: 4,
    left: 0, // Animated via transform
    // width is set dynamically
    height: 42,
    backgroundColor: '#fff', // White pill
    borderRadius: 25,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 16,
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
  eyeIcon: {
    paddingHorizontal: 16,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPassText: {
    color: '#E50914',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 10,
    fontSize: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#888',
  },
  signupLink: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
