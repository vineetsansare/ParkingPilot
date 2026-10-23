import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useParkingStore } from '../store/parkingStore';
import { ZoneDetailCard } from '../components/ZoneDetailCard';
import { Ionicons } from '@expo/vector-icons';
import { SEED_PARKING_ZONES } from '../database/seedData';

export default function ParkingAlertModal() {
  const router = useRouter();
  const detectedZone = useParkingStore((state) => state.detectedZone);

  // Fallback to Al Karama Zone 318C if none active
  const activeZone =
    detectedZone ||
    SEED_PARKING_ZONES.find((z) => z.zoneCode === '318C') ||
    SEED_PARKING_ZONES[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} />
      <View style={styles.modalContent}>
        <ZoneDetailCard zone={activeZone} onClose={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    width: '100%',
  },
});
