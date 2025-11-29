import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
const OTP_LENGTH = 4;

export default function OtpScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const orb1Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb2Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    // Entry Animation
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

    // Background Orbs Animation
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
      createFloatingAnimation(orb1Pos, 6000, 40, 40),
      createFloatingAnimation(orb2Pos, 7000, -40, -40),
    ]).start();

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Auto-focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInputIndex(index + 1);
    }

    // Move to previous input if backspace
    if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInputIndex(index - 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInputIndex(index - 1);
    }
  };

  const { phone, mode, userData, email } = useLocalSearchParams();
  console.log('OTP Screen Params:', { phone, mode, userData, email });
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    console.log('Handle Verify - Mode:', mode);
    Keyboard.dismiss();
    const otpCode = otp.join('');
    if (otpCode.length === OTP_LENGTH) {
      setLoading(true);
      try {
        if (mode === 'signup') {
            const parsedUserData = typeof userData === 'string' ? JSON.parse(userData) : userData;
            await authService.verifySignup(parsedUserData, otpCode);
            Alert.alert('Success', 'Account created successfully. Please login.', [
                { text: 'OK', onPress: () => router.replace('/auth/login') }
            ]);
        } else if (mode === 'forgot-password') {
            const targetEmail = Array.isArray(email) ? email[0] : email;
            
            console.log('Frontend Verifying Forgot Password:', { email: targetEmail, otpCode });
            
            if (!targetEmail) {
                Alert.alert('Error', 'System Error: Email missing. Please try again.');
                return;
            }

            await authService.verifyForgotPasswordOtp(targetEmail, otpCode);
            router.replace({ pathname: '/auth/reset-password', params: { email: targetEmail, otp: otpCode } });
        } else {
            await authService.verifyLoginOtp(phone as string, otpCode);
            router.replace('/(tabs)');
        }
      } catch (error: any) {
        console.error('Verify Error Details:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP';
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    try {
      if (mode === 'signup') {
          const parsedUserData = typeof userData === 'string' ? JSON.parse(userData) : userData;
          await authService.sendSignupOtp(parsedUserData);
      } else if (mode === 'forgot-password') {
          const { email } = useLocalSearchParams();
          await authService.sendForgotPasswordOtp(email as string);
      } else {
          await authService.sendLoginOtp(phone as string);
      }
      setTimer(30);
      Alert.alert('Success', 'OTP resent successfully');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#050505', '#1a1a1a', '#050505']}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Orbs */}
      <Animated.View style={[styles.orb, styles.orb1, {
        transform: [{ translateX: orb1Pos.x }, { translateY: orb1Pos.y }]
      }]}>
        <LinearGradient
          colors={['#E50914', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGradient}
        />
      </Animated.View>

      <Animated.View style={[styles.orb, styles.orb2, {
        transform: [{ translateX: orb2Pos.x }, { translateY: orb2Pos.y }]
      }]}>
        <LinearGradient
          colors={['#0044ff', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGradient}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
            
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={40} color="#E50914" />
              </View>
            </View>

            <Text style={styles.title}>Verification</Text>
            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to your device to verify your identity.
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={[
                  styles.otpInputWrapper,
                  activeInputIndex === index && styles.otpInputActive
                ]}>
                  <TextInput
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    onFocus={() => setActiveInputIndex(index)}
                    selectionColor="#E50914"
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerify}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E50914', '#B20710']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyGradient}
              >
                <Text style={styles.verifyText}>
                  {loading ? <ActivityIndicator color="#fff" /> : 'Verify Code'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive code? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Resend Now</Text>
                </TouchableOpacity>
              )}
            </View>

          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.3,
  },
  orbGradient: {
    flex: 1,
    borderRadius: 150,
  },
  orb1: {
    top: -50,
    right: -50,
  },
  orb2: {
    bottom: -50,
    left: -50,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blurContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.6)',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  iconContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  otpInputWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputActive: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.05)',
  },
  otpInput: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    width: '100%',
    height: '100%',
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  verifyGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  verifyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    color: '#888',
    fontSize: 14,
  },
  timerText: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '600',
  },
  resendLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
