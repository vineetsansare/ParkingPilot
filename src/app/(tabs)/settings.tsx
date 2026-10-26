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

interface LegalItem {
  id: string;
  title: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  summary: string;
  detail: string;
}

const LEGAL_DISCLOSURES: LegalItem[] = [
  {
    id: 'cybercrime',
    title: 'Independent Utility Status',
    badge: 'UAE Cybercrimes Law',
    icon: 'shield-outline',
    summary: 'Not an official entity or government affiliate. Payments go directly to authorities.',
    detail:
      'Pursuant to UAE Federal Decree-Law No. (34) of 2021 Concerning the Fight Against Rumours and Cybercrimes (Articles 11 & 18):\n\n' +
      '• Parking Ticket Buddy is an independent software assistance tool.\n' +
      '• This app is NOT affiliated with, authorized, endorsed, or sponsored by Parkin PJSC, the Roads and Transport Authority (RTA) Dubai, the Integrated Transport Centre (ITC Abu Dhabi / Mawaqif), Sharjah Municipality, or Ajman Municipality.\n' +
      '• All trademark names, logos, zone codes, and municipal references remain the property of their respective official bodies.\n' +
      '• The app DOES NOT collect, hold, or intermediate monetary payments. When you tap "Pay", the app initiates a direct SMS (e.g. to 7275) or official WhatsApp chat (e.g. to +971 58 800 9090) through your native system messaging applications.',
  },
  {
    id: 'pdpl',
    title: 'On-Device Privacy Guarantee',
    badge: 'UAE PDPL Law No. 45/2021',
    icon: 'lock-closed-outline',
    summary: '100% on-device processing. Vehicle plates and GPS coordinates are never uploaded.',
    detail:
      'Pursuant to UAE Federal Decree-Law No. (45) of 2021 on Personal Data Protection (PDPL):\n\n' +
      '• Zero Remote Telemetry: Your vehicle registration plate numbers, parking session history, and precise GPS coordinates are processed and stored exclusively inside your device local SQLite database.\n' +
      '• No Cloud Tracking: We do not operate remote tracking servers, third-party analytics trackers, or user profiling databases.\n' +
      '• Full Data Erasure: You can permanently delete your saved vehicles and parking logs at any time from the app.',
  },
  {
    id: 'vat',
    title: '5% UAE VAT & Telecom Operator Fees',
    badge: 'Federal Decree-Law No. 8/2017',
    icon: 'receipt-outline',
    summary: 'Tariffs include 5% VAT. SMS carries AED 0.30 carrier fee; WhatsApp has 0 fee.',
    detail:
      'Pursuant to UAE Federal Decree-Law No. (8) of 2017 on Value Added Tax (VAT):\n\n' +
      '• All displayed parking tariff estimates are in UAE Dirhams (AED) and include the statutory 5% UAE Value Added Tax levied by municipal parking operators.\n' +
      '• SMS Telecom Fee: In accordance with UAE telecom regulations, sending an mParking SMS incurs an operator convenience surcharge of AED 0.30 billed by your telecom provider (e& / du).\n' +
      '• Fee-Free Alternative: WhatsApp payments dispatched via the official RTA Mahboub bot incur zero telecom SMS surcharge.',
  },
  {
    id: 'grace',
    title: 'Grace Periods & Public Holidays',
    badge: 'Dubai Executive Council Res. 5/2016',
    icon: 'time-outline',
    summary: '10-minute arrival grace period & official free parking on Sundays and statutory holidays.',
    detail:
      'Under Dubai Executive Council Resolution No. (5) of 2016 and Parkin PJSC operating guidelines:\n\n' +
      '• 10-Minute Arrival Grace Period: Motorists are afforded a 10-minute buffer upon parking before a valid ticket must be activated.\n' +
      '• 10-Minute Expiry Buffer: An additional 10-minute departure buffer applies upon ticket expiration.\n' +
      '• Free Parking Days: Public parking zones are free on Sundays (excluding multi-storey parking facilities) and during officially declared UAE public holidays (Eid Al Fitr, Eid Al Adha, UAE National Day, Islamic New Year, Prophet Birthday).\n' +
      '• Multi-Storey & Special Event Tariffs: Special event rates (e.g. World Trade Centre during exhibitions) or dedicated private/valet areas may follow independent tariff schedules.',
  },
  {
    id: 'sanad',
    title: 'People of Determination Exemptions',
    badge: 'UAE Federal Law No. 29/2006',
    icon: 'accessibility-outline',
    summary: 'Sanad permit holders enjoy complimentary designated parking privileges.',
    detail:
      'Under UAE Federal Law No. (29) of 2006 on the Rights of People of Determination:\n\n' +
      '• Holders of a valid People of Determination parking card (Sanad Card issued by the Ministry of Community Development or RTA) are entitled to free parking in all designated accessible public parking bays.\n' +
      '• The physical or digital Sanad permit must remain clearly displayed or registered with the official municipal transport portal to prevent automated inspection violations.',
  },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const isMonitoring = useParkingStore((state) => state.isMonitoring);
  const setIsMonitoring = useParkingStore((state) => state.setIsMonitoring);
  const setDetectedZone = useParkingStore((state) => state.setDetectedZone);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [preferWhatsApp, setPreferWhatsApp] = useState(true);
  const [expandedLegalId, setExpandedLegalId] = useState<string | null>(null);

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

      {/* Legal, Privacy & UAE Compliance Section */}
      <Text style={styles.sectionHeader}>UAE Legal & Regulatory Disclosures</Text>
      <View style={styles.card}>
        <Text style={styles.complianceIntro}>
          Parking Ticket Buddy complies strictly with UAE Federal Decrees, transport authority regulations, and personal data protection laws.
        </Text>

        {LEGAL_DISCLOSURES.map((item, index) => {
          const isExpanded = expandedLegalId === item.id;
          return (
            <View key={item.id}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.legalAccordionHeader}
                onPress={() => setExpandedLegalId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name={item.icon} size={18} color="#0F172A" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <View style={styles.legalHeaderBadgeRow}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <View style={styles.statuteBadge}>
                      <Text style={styles.statuteBadgeText}>{item.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.rowSubtitle} numberOfLines={isExpanded ? undefined : 2}>
                    {item.summary}
                  </Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.legalExpandedBody}>
                  <Text style={styles.legalExpandedText}>{item.detail}</Text>
                </View>
              )}
            </View>
          );
        })}
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
  complianceIntro: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  legalAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  legalHeaderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  statuteBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statuteBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D9488',
  },
  legalExpandedBody: {
    marginTop: 10,
    paddingLeft: 48,
    paddingRight: 8,
  },
  legalExpandedText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
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
