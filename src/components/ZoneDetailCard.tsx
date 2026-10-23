import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ParkingZone } from '../types/parking';
import { calculateParkingTariff } from '../utils/tariffCalculator';
import { getParkingStatusDescription } from '../utils/timeUtils';
import { MessagingService } from '../services/messagingService';
import { useParkingStore } from '../store/parkingStore';
import { useVehicleStore } from '../store/vehicleStore';
import { Ionicons } from '@expo/vector-icons';
import { findNearbyZones } from '../services/zoneLookupService';

interface Props {
  zone: ParkingZone;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export const ZoneDetailCard: React.FC<Props> = ({
  zone,
  isExpanded,
  onToggleExpand,
  onClose,
}) => {
  const [durationHours, setDurationHours] = useState<number>(1);
  const [isSending, setIsSending] = useState(false);

  const defaultVehicle = useVehicleStore((state) => state.defaultVehicle);
  const startSession = useParkingStore((state) => state.startSession);

  const tariff = calculateParkingTariff(zone, durationHours);
  const status = getParkingStatusDescription(zone.emirateId);

  // Available duration options
  const durationOptions = [1, 2, 3, 4].filter((h) => h <= zone.maxStayHours);

  // Nearby zones for boundary assistance
  const centerCoord = zone.polygonCoords[0] || { latitude: 25.242, longitude: 55.303 };
  const nearbyZones = findNearbyZones(centerCoord, 400).filter((z) => z.id !== zone.id);

  const handlePay = async (channel: 'whatsapp' | 'sms') => {
    if (!defaultVehicle) {
      Alert.alert(
        'Vehicle Required',
        'Please add your vehicle plate number in the My Car tab before submitting a parking ticket.'
      );
      return;
    }

    setIsSending(true);
    try {
      let result;
      if (channel === 'whatsapp') {
        result = await MessagingService.launchWhatsApp(defaultVehicle, zone, durationHours);
      } else {
        result = await MessagingService.launchSms(defaultVehicle, zone, durationHours);
      }

      if (result.success) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

        startSession({
          id: `session_${Date.now()}`,
          zone,
          vehicle: defaultVehicle,
          emirateId: zone.emirateId,
          startedAt: now.toISOString(),
          durationHours,
          expiresAt: expiresAt.toISOString(),
          paymentMethod: channel,
          amountPaid: tariff.totalCostAED,
          isActive: true,
        });
      } else if (result.error) {
        Alert.alert('Payment Error', result.error);
      }
    } finally {
      setIsSending(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. COLLAPSED MINI DOCK (Sits neatly just above bottom tab bar)
  // ─────────────────────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.miniDockContainer}
        onPress={onToggleExpand}
        activeOpacity={0.92}
      >
        <View style={styles.miniDockLeft}>
          <View style={styles.miniZoneBadge}>
            <Text style={styles.miniZoneText}>{zone.zoneCode}</Text>
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.miniAreaName} numberOfLines={1}>
              {zone.areaNameEn}
            </Text>
            <Text style={styles.miniTariffText}>
              {tariff.isFree ? 'FREE PARKING' : `AED ${tariff.hourlyRateAED.toFixed(2)} / hr`} •{' '}
              {zone.emirateId}
            </Text>
          </View>
        </View>

        <View style={styles.miniDockRight}>
          {/* Quick 1-Tap WhatsApp Pay Button */}
          {zone.emirateId === 'DXB' && (
            <TouchableOpacity
              style={styles.miniWhatsAppButton}
              onPress={(e) => {
                e.stopPropagation();
                handlePay('whatsapp');
              }}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
              <Text style={styles.miniWhatsAppText}>Pay</Text>
            </TouchableOpacity>
          )}

          {/* Quick Expand Chevron */}
          <TouchableOpacity style={styles.expandButton} onPress={onToggleExpand}>
            <Ionicons name="chevron-up" size={20} color="#2563EB" />
          </TouchableOpacity>

          {/* Dismiss button */}
          <TouchableOpacity style={styles.miniCloseButton} onPress={onClose}>
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. EXPANDED FULL MODAL DRAWER
  // ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.expandedContainer}>
      {/* Drag handle / collapse bar */}
      <TouchableOpacity style={styles.dragHandleContainer} onPress={onToggleExpand}>
        <View style={styles.dragHandle} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.zoneBadge}>
            <Text style={styles.zoneBadgeText}>ZONE {zone.zoneCode}</Text>
          </View>
          <View>
            <Text style={styles.areaName}>{zone.areaNameEn}</Text>
            <Text style={styles.emirateLabel}>
              {zone.emirateId === 'DXB' ? 'Dubai (RTA / Parkin)' : zone.emirateId}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity onPress={onToggleExpand} style={styles.iconCircleButton}>
            <Ionicons name="chevron-down" size={18} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.iconCircleButton}>
            <Ionicons name="close" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status banner */}
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: status.isPaid ? '#EFF6FF' : '#F0FDF4' },
        ]}
      >
        <Ionicons
          name={status.isPaid ? 'time-outline' : 'checkmark-circle-outline'}
          size={18}
          color={status.isPaid ? '#2563EB' : '#16A34A'}
        />
        <View style={{ marginLeft: 8, flex: 1 }}>
          <Text
            style={[
              styles.statusText,
              { color: status.isPaid ? '#1E40AF' : '#15803D' },
            ]}
          >
            {status.statusText}
          </Text>
          <Text style={styles.statusSubtext}>{status.detailText}</Text>
        </View>
      </View>

      {/* Duration selector */}
      <Text style={styles.sectionTitle}>Select Parking Duration</Text>
      <View style={styles.durationRow}>
        {durationOptions.map((hours) => (
          <TouchableOpacity
            key={hours}
            onPress={() => setDurationHours(hours)}
            style={[
              styles.durationChip,
              durationHours === hours && styles.durationChipActive,
            ]}
          >
            <Text
              style={[
                styles.durationChipText,
                durationHours === hours && styles.durationChipTextActive,
              ]}
            >
              {hours} hr{hours > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tariff summary */}
      <View style={styles.tariffCard}>
        <View style={styles.tariffRow}>
          <Text style={styles.tariffLabel}>Total Tariff</Text>
          <Text style={styles.tariffValue}>
            {tariff.isFree ? 'FREE' : `AED ${tariff.totalCostAED.toFixed(2)}`}
          </Text>
        </View>

        <View style={styles.fineProtectionRow}>
          <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
          <Text style={styles.fineProtectionText}>
            Protects against AED 150 non-payment fine
          </Text>
        </View>
      </View>

      {/* Payment Action Buttons */}
      <View style={styles.actionButtons}>
        {/* WhatsApp Button (Primary - Saves 0.30 fee) */}
        {zone.emirateId === 'DXB' && (
          <TouchableOpacity
            style={[styles.payButton, styles.whatsappButton]}
            onPress={() => handlePay('whatsapp')}
            disabled={isSending}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.payButtonText}>Pay via WhatsApp</Text>
              <Text style={styles.whatsappFeeSaveText}>Free • Saves AED 0.30 fee</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* SMS Button */}
        <TouchableOpacity
          style={[styles.payButton, styles.smsButton]}
          onPress={() => handlePay('sms')}
          disabled={isSending}
        >
          <Ionicons name="chatbox-ellipses-outline" size={20} color="#1E293B" />
          <Text style={[styles.payButtonText, { color: '#1E293B', marginLeft: 8 }]}>
            Pay via SMS ({zone.emirateId === 'DXB' ? '7275' : 'Send SMS'})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nearby Zone Alternatives (helps with boundary mistakes) */}
      {nearbyZones.length > 0 && (
        <View style={styles.nearbyContainer}>
          <Text style={styles.nearbyLabel}>Near the boundary? Also close to:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nearbyZones.map((alt) => (
              <TouchableOpacity
                key={alt.id}
                style={styles.altZoneBadge}
                onPress={() => useParkingStore.getState().setSelectedZone(alt)}
              >
                <Text style={styles.altZoneText}>Zone {alt.zoneCode}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ─── Collapsed Mini Dock ───
  miniDockContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniDockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  miniZoneBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniZoneText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  miniAreaName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  miniTariffText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  miniDockRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniWhatsAppButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  miniWhatsAppText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  expandButton: {
    backgroundColor: '#EFF6FF',
    padding: 6,
    borderRadius: 8,
  },
  miniCloseButton: {
    padding: 6,
  },

  // ─── Expanded Modal ───
  expandedContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  zoneBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emirateLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  iconCircleButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 13,
  },
  statusSubtext: {
    fontSize: 11,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  durationChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tariffCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tariffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tariffLabel: {
    fontSize: 14,
    color: '#475569',
  },
  tariffValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  fineProtectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fineProtectionText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButtons: {
    gap: 10,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  smsButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  whatsappFeeSaveText: {
    color: '#E0F2FE',
    fontSize: 11,
    fontWeight: '500',
  },
  nearbyContainer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  nearbyLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  altZoneBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  altZoneText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
});
