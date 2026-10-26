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
  // 1. COLLAPSED MINI DOCK (Sits just above bottom tab bar)
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
              {tariff.isFree
                ? 'FREE PARKING'
                : `AED ${tariff.hourlyRateAED.toFixed(2)} / hr`} •{' '}
              {zone.emirateId === 'DXB' ? 'On-street' : zone.emirateId}
            </Text>
          </View>
        </View>

        <View style={styles.miniDockRight}>
          {/* Quick Pay CTA */}
          <TouchableOpacity
            style={styles.miniWhatsAppButton}
            onPress={(e) => {
              e.stopPropagation();
              handlePay(zone.emirateId === 'DXB' ? 'whatsapp' : 'sms');
            }}
          >
            <Ionicons
              name={zone.emirateId === 'DXB' ? 'logo-whatsapp' : 'paper-plane'}
              size={15}
              color="#FFFFFF"
            />
            <Text style={styles.miniWhatsAppText}>Pay</Text>
          </TouchableOpacity>

          {/* Quick Expand Chevron */}
          <TouchableOpacity style={styles.expandButton} onPress={onToggleExpand}>
            <Ionicons name="chevron-up" size={18} color="#0D9488" />
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
  // 2. EXPANDED FULL MODAL DRAWER (Parkin App Production Style)
  // ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.expandedContainer}>
      {/* Drag handle / collapse bar */}
      <TouchableOpacity style={styles.dragHandleContainer} onPress={onToggleExpand}>
        <View style={styles.dragHandle} />
      </TouchableOpacity>

      {/* Header with Zone Badge, Name, and Close */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.parkinZoneBadge}>
            <Text style={styles.parkinZoneBadgeText}>{zone.zoneCode}</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
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

      {/* Status & Rate summary (Parkin style) */}
      <View style={styles.infoMetaRow}>
        <View style={styles.infoMetaItem}>
          <Ionicons name="location-sharp" size={16} color="#0D9488" />
          <Text style={styles.infoMetaText}>
            On street • {tariff.isPeak ? 'Peak' : 'Off-peak'}{' '}
            <Text style={{ fontWeight: '800' }}>
              AED {tariff.hourlyRateAED.toFixed(2)}/hr
            </Text>
          </Text>
        </View>

        <View style={styles.infoMetaItem}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.infoMetaText}>
            {status.isPaid ? '08:00 – 22:00 (Paid)' : 'Free Right Now'}
          </Text>
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

      {/* Peak and Off-peak Hours Visual Timeline (Parkin App Pattern) */}
      <View style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>Peak and Off-peak hours</Text>
        <View style={styles.timelineBar}>
          {/* 12am - 8am: Off-peak / Free (Cyan) */}
          <View style={[styles.timelineSegment, { flex: 8, backgroundColor: '#99F6E4' }]} />
          {/* 8am - 10am: Peak (Peach/Coral) */}
          <View style={[styles.timelineSegment, { flex: 2, backgroundColor: '#FCA5A5' }]} />
          {/* 10am - 4pm: Off-peak (Cyan) */}
          <View style={[styles.timelineSegment, { flex: 6, backgroundColor: '#99F6E4' }]} />
          {/* 4pm - 8pm: Peak (Peach/Coral) */}
          <View style={[styles.timelineSegment, { flex: 4, backgroundColor: '#FCA5A5' }]} />
          {/* 8pm - 12am: Off-peak (Cyan) */}
          <View style={[styles.timelineSegment, { flex: 4, backgroundColor: '#99F6E4' }]} />
        </View>

        <View style={styles.timelineLabels}>
          <Text style={styles.timelineTimeText}>12 am</Text>
          <Text style={styles.timelineTimeText}>8 am</Text>
          <Text style={styles.timelineTimeText}>10 am</Text>
          <Text style={styles.timelineTimeText}>4 pm</Text>
          <Text style={styles.timelineTimeText}>8 pm</Text>
          <Text style={styles.timelineTimeText}>11:59 pm</Text>
        </View>

        <View style={styles.timelineLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2DD4BF' }]} />
            <Text style={styles.legendText}>Off-peak hours</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F87171' }]} />
            <Text style={styles.legendText}>Peak hours</Text>
          </View>
        </View>
      </View>

      {/* Tariff summary */}
      <View style={styles.tariffCard}>
        <View style={styles.tariffRow}>
          <View>
            <Text style={styles.tariffLabel}>Total Ticket Price</Text>
            <Text style={styles.vatSubtext}>Inclusive of 5% UAE VAT</Text>
          </View>
          <Text style={styles.tariffValue}>
            {tariff.isFree ? 'FREE' : `AED ${tariff.totalCostAED.toFixed(2)}`}
          </Text>
        </View>

        <View style={styles.fineProtectionRow}>
          <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
          <Text style={styles.fineProtectionText}>
            Protects against AED 150 non-payment fine (10m grace period)
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
          <Ionicons name="chatbox-ellipses-outline" size={20} color="#0F172A" />
          <Text style={[styles.payButtonText, { color: '#0F172A', marginLeft: 8 }]}>
            Pay via SMS ({zone.emirateId === 'DXB' ? '7275' : 'Send SMS'})
          </Text>
        </TouchableOpacity>
      </View>

      {/* UAE Regulatory & Independent Disclaimer */}
      <View style={styles.legalComplianceNotice}>
        <Ionicons name="information-circle-outline" size={13} color="#94A3B8" />
        <Text style={styles.legalComplianceNoticeText}>
          Independent utility tool. Payments are dispatched directly to official transport authorities (RTA 7275 / WhatsApp).
        </Text>
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
    backgroundColor: '#00C49F', // Parkin signature cyan-green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniZoneText: {
    color: '#0F172A',
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
    backgroundColor: '#00C49F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  miniWhatsAppText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13,
  },
  expandButton: {
    backgroundColor: '#F0FDFA',
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
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parkinZoneBadge: {
    backgroundColor: '#00C49F', // Parkin cyan
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  parkinZoneBadgeText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 16,
  },
  areaName: {
    fontSize: 17,
    fontWeight: '800',
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
  infoMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  infoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoMetaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
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
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  durationChipTextActive: {
    color: '#0D9488',
    fontWeight: '800',
  },

  // ─── Timeline Bar ───
  timelineCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  timelineBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 6,
  },
  timelineSegment: {
    height: '100%',
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timelineTimeText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timelineLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  tariffCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
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
  vatSubtext: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  tariffValue: {
    fontSize: 20,
    fontWeight: '900',
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
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
  legalComplianceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  legalComplianceNoticeText: {
    fontSize: 10,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 14,
  },
  nearbyContainer: {
    marginTop: 12,
    paddingTop: 8,
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
