import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../theme/ThemeContext';

export default function TabLayout() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const hasBottomInset = insets.bottom > 0;
  const tabHeight = Platform.OS === 'ios' 
    ? (hasBottomInset ? 52 + insets.bottom : 62)
    : 64;
  const paddingBottom = Platform.OS === 'ios'
    ? (hasBottomInset ? insets.bottom : 8)
    : 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.mintPrimary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: theme.surfacePrimary,
          borderTopColor: theme.borderDefault,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: paddingBottom,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={23} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'My Car',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'car' : 'car-outline'} size={24} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={23} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={23} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
