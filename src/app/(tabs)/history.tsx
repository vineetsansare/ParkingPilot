import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useParkingStore } from '../../store/parkingStore';
import { ParkingSession } from '../../types/parking';
import { useAppTheme } from '../../theme/ThemeContext';
import { GradientCard3D } from '../../components/common/GradientCard3D';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, shadow3D, personaColor, personaPastel, personaBorder, driverPersona } = useAppTheme();
  const pastSessions = useParkingStore((state) => state.pastSessions);
  const [filter, setFilter] = useState<'ALL' | 'whatsapp' | 'sms'>('ALL');

  // Fallback demo data if no sessions recorded yet
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

  const filteredSessions = displaySessions.filter((s) => {
    if (filter === 'ALL') return true;
    return s.paymentMethod === filter;
  });

  const totalFinesAvoided = displaySessions.length * 150;
  const totalPaid = displaySessions.reduce((sum, s) => sum + s.amountPaid, 0);

  const renderSessionItem = ({ item }: { item: ParkingSession }) => {
    const dateFormatted = new Date(item.startedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isWhatsApp = item.paymentMethod === 'whatsapp';

    return (
      <View
        style={[
          styles.card,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF',
          },
        ]}
      >
        {/* Top Meta Row: Zone Badge, Vehicle Chip, and Price */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.badgeGroup}>
            <View
              style={[
                styles.zoneBadge,
                { backgroundColor: theme.skyPastel, borderColor: theme.skyBorder },
              ]}
            >
              <Text style={[styles.zoneBadgeText, { color: theme.skyPrimary }]}>
                ZONE {item.zone.zoneCode}
              </Text>
            </View>

            {item.vehicle && (
              <View
                style={[
                  styles.vehicleBadge,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Ionicons
                  name="car"
                  size={11}
                  color={theme.textTertiary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.vehicleBadgeText, { color: theme.textSecondary }]}>
                  {item.emirateId} {item.vehicle.plateCode} {item.vehicle.plateNumber}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.amountText, { color: theme.textPrimary }]}>
            AED {item.amountPaid.toFixed(2)}
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.cardDivider, { backgroundColor: theme.divider }]} />

        {/* Content Row: Area name (safe with truncation) + Time + Payment Method */}
        <View style={styles.cardContentRow}>
          <View style={styles.areaInfoCol}>
            <Text
              style={[styles.areaName, { color: theme.textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.zone.areaNameEn}
            </Text>
            <View style={styles.timeRow}>
              <Ionicons
                name="time-outline"
                size={12}
                color={theme.textTertiary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.dateText, { color: theme.textTertiary }]}>
                {dateFormatted} • {item.durationHours} hr{item.durationHours > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.methodPill,
              {
                backgroundColor: isWhatsApp ? '#DCFCE7' : theme.skyPastel,
                borderColor: isWhatsApp ? '#86EFAC' : theme.skyBorder,
              },
            ]}
          >
            <Ionicons
              name={isWhatsApp ? 'logo-whatsapp' : 'chatbox-ellipses'}
              size={12}
              color={isWhatsApp ? '#16A34A' : theme.skyPrimary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.methodText,
                { color: isWhatsApp ? '#15803D' : theme.skyPrimary },
              ]}
            >
              {isWhatsApp ? 'WhatsApp' : 'SMS'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.canvas, paddingTop: insets.top + 12 },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Parking History</Text>
        <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
          Track your tickets and fines avoided
        </Text>
      </View>

      {/* 3D Savings Summary Banner with Driver Persona Gradient */}
      <GradientCard3D style={styles.savingsCardWrapper}>
        <View style={styles.savingsCardInner}>
          <View style={styles.savingsColumn}>
            <Text style={[styles.savingsLabel, { color: theme.textSecondary }]}>
              Fines Avoided
            </Text>
            <Text style={[styles.savingsValue, { color: theme.mintPrimary }]}>
              AED {totalFinesAvoided}
            </Text>
            <Text style={[styles.savingsSubtext, { color: theme.textTertiary }]}>
              Saved this month
            </Text>
          </View>

          <View style={[styles.savingsDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />

          <View style={styles.savingsColumn}>
            <Text style={[styles.savingsLabel, { color: theme.textSecondary }]}>
              Total Spent
            </Text>
            <Text style={[styles.savingsValue, { color: theme.textPrimary }]}>
              AED {totalPaid.toFixed(2)}
            </Text>
            <Text style={[styles.savingsSubtext, { color: theme.textTertiary }]}>
              {displaySessions.length} ticket{displaySessions.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
      </GradientCard3D>

      {/* Filter Tabs & Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Recent Sessions
        </Text>
        <View style={styles.filterGroup}>
          {(['ALL', 'whatsapp', 'sms'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setFilter(mode)}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    filter === mode ? theme.mintPastel : theme.surfaceSecondary,
                  borderColor:
                    filter === mode ? theme.mintBorder : theme.borderSubtle,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color:
                      filter === mode ? theme.mintPrimary : theme.textTertiary,
                    fontWeight: filter === mode ? '700' : '500',
                  },
                ]}
              >
                {mode === 'ALL' ? 'All' : mode === 'whatsapp' ? 'WhatsApp' : 'SMS'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSessionItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 80,
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Ionicons name="receipt-outline" size={32} color={theme.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Sessions Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
              {filter === 'ALL'
                ? 'Your active and past parking tickets will appear here automatically.'
                : `No parking tickets paid via ${filter === 'whatsapp' ? 'WhatsApp' : 'SMS'}.`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  savingsCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  savingsCardInner: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  savingsDivider: {
    width: 1,
    height: 44,
  },
  savingsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  savingsValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 4,
    letterSpacing: -0.5,
  },
  savingsSubtext: {
    fontSize: 11,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  filterGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    marginRight: 10,
  },
  zoneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  zoneBadgeText: {
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  vehicleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardDivider: {
    height: 1,
    marginVertical: 10,
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaInfoCol: {
    flex: 1,
    minWidth: 0, // Critical for React Native flex child text truncation!
    marginRight: 12,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    flexShrink: 0,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
