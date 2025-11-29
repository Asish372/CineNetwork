import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Custom Animated VIP Icon Component with 3D Gold Effect
const VipIcon = ({ focused }: { focused: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    if (focused) {
      pulse.start();
    } else {
      pulse.stop();
      scaleAnim.setValue(1);
    }

    return () => pulse.stop();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <MaskedView
        style={{ height: 28, width: 28 }}
        maskElement={
          <View style={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="diamond" size={28} color="black" />
          </View>
        }
      >
        <LinearGradient
          colors={['#BF953F', '#FCF6BA', '#B38728', '#FBF5B7', '#AA771C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </MaskedView>
    </Animated.View>
  );
};

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  // Tab Bar Dimensions
  const TAB_BAR_WIDTH = width - 40; // Full width minus padding
  const TAB_BAR_HEIGHT = 65;
  const TAB_WIDTH = TAB_BAR_WIDTH / state.routes.length;
  const PADDING = 5;

  // Animation for the active pill
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      friction: 6,
      tension: 50,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabBarContent}>
          <Animated.View
            style={[
              styles.activePill,
              {
                width: TAB_WIDTH - (PADDING * 2),
                transform: [{ translateX }],
              },
            ]}
          >
            <LinearGradient
              colors={['#ff4d4d', '#E50914', '#8f0000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Shine effect */}
            <LinearGradient
              colors={['rgba(255,255,255,0.4)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.5 }}
              style={styles.pillShine}
            />
          </Animated.View>

          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Determine Icon
            let iconName: any;
            if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
            else if (route.name === 'shorts') iconName = isFocused ? 'albums' : 'albums-outline';
            else if (route.name === 'search') iconName = isFocused ? 'search' : 'search-outline';
            else if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

            const color = isFocused ? '#fff' : '#888'; // White for active (on red pill), Gray for inactive

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.tabButton}
                activeOpacity={1}
              >
                {route.name === 'vip' ? (
                  <VipIcon focused={isFocused} />
                ) : (
                  <Ionicons name={iconName} size={24} color={color} />
                )}
                {/* Optional: Hide labels for cleaner look, or show them */}
                <Text style={[styles.tabLabel, { color }]}>
                  {options.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="shorts"
        options={{
          title: 'Shorts',
        }}
      />
      <Tabs.Screen
        name="vip"
        options={{
          title: 'VIP',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 5,
  },
  activePill: {
    position: 'absolute',
    height: 60,
    borderRadius: 30,
    top: 5,
    left: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden', // Ensure gradient stays inside
  },
  pillShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1, // Ensure touchable is above pill
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
