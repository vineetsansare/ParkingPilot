import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationService } from '../services/notificationService';
import { ParkingDetectionService } from '../services/parkingDetectionService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize notifications and background parking observer
    const setupServices = async () => {
      await NotificationService.initialize();
      await ParkingDetectionService.startBackgroundMonitoring();
    };

    setupServices();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="alert"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Parking Zone Alert',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
