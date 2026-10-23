import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useParkingStore } from '../../store/parkingStore';
import { ParkingSession } from '../../types/parking';
import { UAE_EMIRATES } from '../../constants/uaeParking';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const pastSessions = useParkingStore((state) => state.pastSessions);

  // Demo fallback data if empty
  const displaySessions: ParkingSession[] =
    pastSessions.length > 0
      ? pastSessions
      : [
          {
            id: 'sample_1',
            zone: {
              id: '318C',
              emirateId: 'DXB',
              zoneCode: '318C',
              areaNameEn: 'Al Karama (Residential)',
              zoneCategory: 'C',
              tariffOffpeakHourly: 2,
              tariffPeakHourly: 4,
              maxStayHours: 4,
              paidStart: '08:00',
              paidEnd: '22:00',
              freeOnSunday: true,
              freeOnFriday: false,
              polygonCoords: [],
            },
            vehicle: {
              id: 'v1',
              plateCode: 'A',
              plateNumber: '12345',
              emirateCode: 'DXB',
              isDefault: true,
              displayName: 'My Car',
            },
            emirateId: 'DXB',
            startedAt: new Date(Date.now() - 86400000).toISOString(),
            durationHours: 2,
            expiresAt: new Date(Date.now() - 86400000 + 7200000).toISOString(),
            paymentMethod: 'whatsapp',
            amountPaid: 4.0,
            isActive: false,
          },
        ];

  const totalFinesAvoided = displaySessions.length * 150;
  const totalPaid = displaySessions.reduce((sum, s) => sum + s.amountPaid, 0);

  const renderSessionItem = ({ item }: { item: ParkingSession }) => {
    const dateFormatted = new Date(item.startedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.zoneBadge}>
            <Text style={styles.zoneBadgeText}>ZONE {item.zone.zoneCode}</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.areaName}>{item.zone.areaNameEn}</Text>
            <Text style={styles.dateText}>{dateFormatted}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.amountText}>AED {item.amountPaid.toFixed(2)}</Text>
          <View style={styles.methodTag}>
            <Ionicons
              name={item.paymentMethod === 'whatsapp' ? 'logo-whatsapp' : 'chatbox'}
              size={12}
              color={item.paymentMethod === 'whatsapp' ? '#16A34A' : '#2563EB'}
            />
            <Text
              style={[
                styles.methodText,
                { color: item.paymentMethod === 'whatsapp' ? '#16A34A' : '#2563EB' },
              ]}
            >
              {item.paymentMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Parking History</Text>
        <Text style={styles.subtitle}>Track your tickets and fines avoided</Text>
      </View>

      {/* Savings Summary Banner */}
      <View style={styles.savingsCard}>
        <View style={styles.savingsColumn}>
          <Text style={styles.savingsLabel}>Fines Avoided</Text>
          <Text style={styles.savingsValue}>AED {totalFinesAvoided}</Text>
          <Text style={styles.savingsSubtext}>Saved this month</Text>
        </View>

        <View style={styles.savingsDivider} />

        <View style={styles.savingsColumn}>
          <Text style={styles.savingsLabel}>Total Spent</Text>
          <Text style={[styles.savingsValue, { color: '#0F172A' }]}>
            AED {totalPaid.toFixed(2)}
          </Text>
          <Text style={styles.savingsSubtext}>{displaySessions.length} tickets</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Parking Sessions</Text>

      <FlatList
        data={displaySessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSessionItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  savingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  savingsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  savingsDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  savingsLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  savingsValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16A34A',
    marginVertical: 4,
  },
  savingsSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  zoneBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoneBadgeText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 12,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  methodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});
