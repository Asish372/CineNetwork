import { Ionicons } from '@expo/vector-icons';
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
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from '../../src/services/authService';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.sendSignupOtp({ fullName, email, phone, password });
            router.push({ 
                pathname: '/auth/otp', 
                params: { 
                    phone, 
                    mode: 'signup',
                    userData: JSON.stringify({ fullName, email, phone, password }) 
                } 
            });
        } catch (error: any) {
            console.error('Signup Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
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
                    {/* Logo Section */}
                    <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Image
                            source={require('../../assets/images/login-logo.png')}
                            style={styles.logo}
                            contentFit="contain"
                        />
                        <Text style={styles.appName}>CINE NETWORK</Text>
                    </Animated.View>

                    {/* Signup Form */}
                    <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                        <Text style={styles.headerText}>Create Account</Text>

                        {/* Inputs */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#666"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

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

                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="#666"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
                            </TouchableOpacity>
                        </View>

                        {/* Signup Button */}
                        <TouchableOpacity onPress={handleSignup} activeOpacity={0.8} style={styles.signupButton}>
                            <LinearGradient
                                colors={['#E50914', '#B20710']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? <ActivityIndicator color="#fff" /> : 'Sign Up'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.loginLink}>Login</Text>
                            </TouchableOpacity>
                        </View>

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
        paddingTop: 60,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    appName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 2,
    },
    formContainer: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
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
    signupButton: {
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#E50914',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    gradientButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        color: '#888',
    },
    loginLink: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
