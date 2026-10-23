import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useParkingStore } from '../../store/parkingStore';
import { NotificationService } from '../../services/notificationService';
import { SEED_PARKING_ZONES } from '../../database/seedData';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const isMonitoring = useParkingStore((state) => state.isMonitoring);
  const setIsMonitoring = useParkingStore((state) => state.setIsMonitoring);
  const setDetectedZone = useParkingStore((state) => state.setDetectedZone);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [preferWhatsApp, setPreferWhatsApp] = useState(true);

  const handleSimulateParking = async () => {
    // Al Karama Zone 318C
    const karamaZone = SEED_PARKING_ZONES.find((z) => z.zoneCode === '318C');
    if (karamaZone) {
      setDetectedZone(karamaZone, { latitude: 25.242, longitude: 55.303 });
      await NotificationService.sendParkingDetectedNotification(karamaZone);
      Alert.alert(
        'Simulated Parking Event',
        'Simulated car stall in Zone 318C (Al Karama)! A local push notification has been sent to your device.'
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure automated detection and preferences</Text>
      </View>

      {/* Detection Section */}
      <Text style={styles.sectionHeader}>Automated Detection</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="navigate-outline" size={20} color="#2563EB" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.rowTitle}>Auto Parking Detection</Text>
              <Text style={styles.rowSubtitle}>
                Wakes in background when driving stops to identify your zone
              </Text>
            </View>
          </View>
          <Switch
            value={isMonitoring}
            onValueChange={setIsMonitoring}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={isMonitoring ? '#2563EB' : '#F1F5F9'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="notifications-outline" size={20} color="#16A34A" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Text style={styles.rowSubtitle}>
                Alerts you before the 10-minute arrival grace period expires
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
            thumbColor={notificationsEnabled ? '#16A34A' : '#F1F5F9'}
          />
        </View>
      </View>

      {/* Payment Preference Section */}
      <Text style={styles.sectionHeader}>Payment Method</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#15803D" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.rowTitle}>Prefer WhatsApp (RTA Mahboub)</Text>
              <Text style={styles.rowSubtitle}>
                Direct bot checkout without the AED 0.30 telecom SMS fee
              </Text>
            </View>
          </View>
          <Switch
            value={preferWhatsApp}
            onValueChange={setPreferWhatsApp}
            trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
            thumbColor={preferWhatsApp ? '#16A34A' : '#F1F5F9'}
          />
        </View>
      </View>

      {/* Test / Simulation Section */}
      <Text style={styles.sectionHeader}>Developer & Testing Tools</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.simulationButton} onPress={handleSimulateParking}>
          <Ionicons name="play-circle-outline" size={20} color="#2563EB" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.simulationTitle}>Simulate Parking in Zone 318C</Text>
            <Text style={styles.simulationSubtitle}>
              Simulates parking in Al Karama to verify notifications & SMS composer
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🅿️ Parking Ticket Buddy v1.0.0</Text>
        <Text style={styles.footerSubtext}>
          Offline-first spatial zone matching • Covering Dubai, Abu Dhabi, Sharjah & Ajman
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  simulationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simulationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  simulationSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
