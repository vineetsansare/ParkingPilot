import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ParkingZone } from '../types/parking';
import { calculateParkingTariff } from '../utils/tariffCalculator';
import { getParkingStatusDescription } from '../utils/timeUtils';
import { MessagingService } from '../services/messagingService';
import { useParkingStore } from '../store/parkingStore';
import { useVehicleStore } from '../store/vehicleStore';
import { useAppTheme } from '../theme/ThemeContext';
import { LicensePlateView } from './LicensePlateView';

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
  const { theme, isDark, shadow3D, personaColor, driverPersona } = useAppTheme();
  const [durationHours, setDurationHours] = useState<number>(2);
  const [isSending, setIsSending] = useState(false);

  const defaultVehicle = useVehicleStore((state) => state.defaultVehicle);
  const startSession = useParkingStore((state) => state.startSession);

  const tariff = calculateParkingTariff(zone, durationHours);
  const status = getParkingStatusDescription(zone.emirateId);

  // Available duration options (1 to 4 hours, capped by maxStayHours)
  const durationOptions = [1, 2, 3, 4].filter((h) => h <= (zone.maxStayHours || 4));

  // Dynamic expiry time calculation based on selected duration
  const expiryTimeFormatted = useMemo(() => {
    const now = new Date();
    now.setHours(now.getHours() + durationHours);
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
    return `Valid until ${hours}:${minutes} ${ampm}`;
  }, [durationHours]);

  const handlePay = async (channel: 'whatsapp' | 'sms') => {
    if (!defaultVehicle) {
      Alert.alert(
        'Vehicle Required',
        'Please configure your vehicle plate number in the My Car tab before submitting a parking ticket.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Car', onPress: () => router.push('/vehicles') },
        ]
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

        Alert.alert(
          'Parking Dispatched',
          `Your parking request for Zone ${zone.zoneCode} (${durationHours}h) has been dispatched via ${
            channel === 'whatsapp' ? 'official WhatsApp' : 'SMS'
          }. View your active countdown in the History tab.`,
          [{ text: 'OK', onPress: () => onToggleExpand() }]
        );
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
        style={[
          styles.miniDockContainer,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF',
          },
        ]}
        onPress={onToggleExpand}
        activeOpacity={0.92}
      >
        <View style={styles.miniDockLeft}>
          <View
            style={[
              styles.miniZoneBadge,
              { backgroundColor: theme.primaryContainer || theme.mintPrimary },
            ]}
          >
            <Text style={styles.miniZoneText}>{zone.zoneCode}</Text>
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text
              style={[styles.miniAreaName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {zone.areaNameEn}
            </Text>
            <Text style={[styles.miniTariffText, { color: theme.textTertiary }]}>
              {tariff.isFree
                ? 'FREE PARKING'
                : `AED ${tariff.hourlyRateAED.toFixed(2)}/hr`} • {zone.emirateId}
            </Text>
          </View>
        </View>

        <View style={styles.miniDockRight}>
          {/* Quick Pay CTA */}
          <TouchableOpacity
            style={[
              styles.miniWhatsAppButton,
              { backgroundColor: theme.mintPrimary },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handlePay(zone.emirateId === 'DXB' ? 'whatsapp' : 'sms');
            }}
          >
            <Ionicons
              name={zone.emirateId === 'DXB' ? 'logo-whatsapp' : 'paper-plane'}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.miniWhatsAppText}>Pay</Text>
          </TouchableOpacity>

          {/* Expand Chevron */}
          <TouchableOpacity
            style={[styles.expandButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={onToggleExpand}
          >
            <Ionicons name="chevron-up" size={17} color={theme.mintPrimary} />
          </TouchableOpacity>

          {/* Dismiss button */}
          <TouchableOpacity
            style={[styles.miniCloseButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={16} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. EXPANDED FULL DRAWER (Stitch Oasis Precision Specification)
  // ─────────────────────────────────────────────────────────────
  return (
    <View
      style={[
        styles.expandedContainer,
        shadow3D,
        {
          backgroundColor: theme.surfacePrimary,
          borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF',
        },
      ]}
    >
      {/* Centered Pull Bar Handle */}
      <TouchableOpacity
        style={styles.dragHandleContainer}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={[styles.dragHandle, { backgroundColor: theme.borderDefault }]} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* 1. Zone Identification Header Card */}
        <View
          style={[
            styles.zoneHeaderCard,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.borderSubtle },
          ]}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.zoneCodeBadgeRow}>
              <Text
                style={[
                  styles.zoneCodeText,
                  { color: theme.mintPrimary, fontVariant: ['tabular-nums'] },
                ]}
              >
                {zone.zoneCode}
              </Text>
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: theme.mintPrimary },
                ]}
              >
                <Text style={styles.categoryPillText}>
                  {zone.isPremium ? 'PREMIUM' : 'STANDARD'}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.areaNameText, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {zone.areaNameEn}
            </Text>
            <View style={styles.authorityRow}>
              <Ionicons name="shield-checkmark" size={13} color={theme.mintPrimary} />
              <Text style={[styles.authorityText, { color: theme.textSecondary }]}>
                {zone.emirateId === 'DXB'
                  ? 'Dubai Parkin / RTA Official Zone'
                  : `${zone.emirateId} Official Municipal Zone`}
              </Text>
            </View>
          </View>

          <View style={styles.hourlyRateBlock}>
            <Text style={[styles.rateAmountText, { color: theme.textPrimary }]}>
              AED {tariff.hourlyRateAED.toFixed(2)}
            </Text>
            <Text style={[styles.perHourText, { color: theme.textTertiary }]}>PER HOUR</Text>
          </View>
        </View>

        {/* 2. Active Tariff Rules Alert Pill */}
        <View
          style={[
            styles.tariffRulesPill,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.borderSubtle },
          ]}
        >
          <View style={styles.tariffRulesLeft}>
            <Ionicons name="time-outline" size={16} color={theme.skyPrimary} />
            <Text style={[styles.tariffRulesText, { color: theme.textSecondary }]}>
              {status.isPaid ? 'Peak: 8:00 AM – 10:00 PM (Mon–Sat)' : 'Free Right Now'}
            </Text>
          </View>
          <View
            style={[
              styles.freeSunBadge,
              { backgroundColor: theme.mintPastel, borderColor: theme.mintBorder },
            ]}
          >
            <Text style={[styles.freeSunText, { color: theme.mintPrimary }]}>
              {zone.freeOnSunday ? 'FREE SUN' : 'PAID SUN'}
            </Text>
          </View>
        </View>

        {/* 3. Selected Vehicle Module */}
        <View style={styles.vehicleSectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>
              SELECTED VEHICLE
            </Text>
            <TouchableOpacity onPress={() => router.push('/vehicles')}>
              <Text style={[styles.manageCarsLink, { color: theme.mintPrimary }]}>
                Manage Cars
              </Text>
            </TouchableOpacity>
          </View>

          {defaultVehicle ? (
            <TouchableOpacity
              style={[
                styles.vehicleCardBox,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.borderSubtle },
              ]}
              onPress={() => router.push('/vehicles')}
              activeOpacity={0.7}
            >
              <View style={styles.vehicleCardLeft}>
                {/* UAE Dual-Cell Capsule Miniature */}
                <View style={styles.capsuleWrapper}>
                  <View style={styles.capsuleEmirateCell}>
                    <Text style={styles.capsuleEmirateText}>
                      {defaultVehicle.emirateCode}
                    </Text>
                    <Text style={styles.capsuleCodeText}>
                      {defaultVehicle.plateCode}
                    </Text>
                  </View>
                  <View style={styles.capsuleNumberCell}>
                    <Text
                      style={[
                        styles.capsuleNumberText,
                        { fontVariant: ['tabular-nums'] },
                      ]}
                    >
                      {defaultVehicle.plateNumber}
                    </Text>
                  </View>
                </View>

                <View style={styles.vehicleTextCol}>
                  <Text style={[styles.vehicleName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {defaultVehicle.displayName}
                  </Text>
                  <Text style={[styles.vehicleSub, { color: theme.textTertiary }]}>
                    Default Vehicle • Private
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={17} color={theme.textTertiary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.noVehiclePrompt,
                { backgroundColor: theme.sandPastel, borderColor: theme.sandBorder },
              ]}
              onPress={() => router.push('/vehicles')}
              activeOpacity={0.7}
            >
              <Ionicons name="car-outline" size={20} color={theme.sandPrimary} />
              <Text style={[styles.noVehicleText, { color: theme.sandPrimary }]}>
                + Add your vehicle plate to pay in 1 tap
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4. Quick Duration Stepper Pills */}
        <View style={styles.durationSectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>
              PARKING DURATION
            </Text>
            <Text style={[styles.expiryText, { color: theme.mintPrimary }]}>
              {expiryTimeFormatted}
            </Text>
          </View>

          <View style={styles.durationGrid}>
            {durationOptions.map((h) => {
              const isSelected = durationHours === h;
              const costForH = (tariff.hourlyRateAED * h).toFixed(0);

              return (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.durationPillBtn,
                    {
                      backgroundColor: isSelected
                        ? (driverPersona === 'pink' ? theme.pinkPrimary : theme.mintPrimary)
                        : theme.surfaceSecondary,
                      borderColor: isSelected ? 'transparent' : theme.borderSubtle,
                    },
                    isSelected && shadow3D,
                  ]}
                  onPress={() => setDurationHours(h)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.durationPillHours,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {h}h
                  </Text>
                  <Text
                    style={[
                      styles.durationPillCost,
                      {
                        color: isSelected
                          ? (driverPersona === 'pink' ? theme.pinkPastel : theme.primaryFixed)
                          : theme.textTertiary,
                      },
                    ]}
                  >
                    AED {costForH}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Estimated Cost Line Item with Radical Transparency */}
        <View
          style={[
            styles.costTransparencyRow,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.borderSubtle },
          ]}
        >
          <View style={styles.costTransparencyLeft}>
            <Ionicons name="information-circle-outline" size={16} color={theme.skyPrimary} />
            <Text style={[styles.costTransparencyText, { color: theme.textSecondary }]}>
              Includes 5% UAE VAT
            </Text>
          </View>
          <View style={styles.costTransparencyRight}>
            <Text style={[styles.totalLabel, { color: theme.textTertiary }]}>Estimated Total:</Text>
            <Text style={[styles.totalAmount, { color: theme.textPrimary }]}>
              AED {tariff.totalCostAED.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* 6. Dual Payment Actions (WhatsApp & SMS) */}
        <View style={styles.paymentActionsGroup}>
          {/* Primary Action: Official WhatsApp Bot (AED 0 Fee) */}
          <TouchableOpacity
            style={[
              styles.primaryPayButton,
              shadow3D,
              { backgroundColor: theme.mintPrimary },
            ]}
            onPress={() => handlePay('whatsapp')}
            disabled={isSending}
            activeOpacity={0.8}
          >
            <View style={styles.payButtonLeft}>
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryPayButtonText}>
                Pay via WhatsApp (Official RTA Bot)
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Secondary Action: Standard SMS Gateway (e.g. 7275) */}
          <TouchableOpacity
            style={[
              styles.secondaryPayButton,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.borderDefault },
            ]}
            onPress={() => handlePay('sms')}
            disabled={isSending}
            activeOpacity={0.7}
          >
            <View style={styles.payButtonLeft}>
              <Ionicons name="chatbox-ellipses" size={18} color={theme.skyPrimary} style={{ marginRight: 8 }} />
              <Text style={[styles.secondaryPayButtonText, { color: theme.textPrimary }]}>
                Send SMS to {zone.emirateId === 'AUH' ? '3009' : zone.emirateId === 'SHJ' ? '5566' : '7275'}
              </Text>
            </View>
            <Text style={[styles.smsPayloadPreview, { color: theme.textTertiary }]}>
              {defaultVehicle
                ? `${zone.zoneCode} ${defaultVehicle.plateNumber} ${durationHours}`
                : `${zone.zoneCode} ${durationHours}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7. Official Safeguard Disclaimer */}
        <Text style={[styles.safeguardDisclaimer, { color: theme.textTertiary }]}>
          Opens official municipal channel. Parking is activated only upon receipt of official SMS confirmation.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ─── Mini Dock Styles ───
  miniDockContainer: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
  },
  miniDockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  miniZoneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  miniZoneText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  miniAreaName: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniTariffText: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '500',
  },
  miniDockRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniWhatsAppButton: {
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
    fontSize: 12,
  },
  expandButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Expanded Drawer Styles ───
  expandedContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: 520,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  zoneHeaderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  zoneCodeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneCodeText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  areaNameText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  authorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  authorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  hourlyRateBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
    paddingLeft: 8,
  },
  rateAmountText: {
    fontSize: 20,
    fontWeight: '800',
  },
  perHourText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tariffRulesPill: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tariffRulesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tariffRulesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  freeSunBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  freeSunText: {
    fontSize: 10,
    fontWeight: '800',
  },
  vehicleSectionWrapper: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  manageCarsLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  vehicleCardBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  capsuleWrapper: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    height: 32,
    marginRight: 10,
  },
  capsuleEmirateCell: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  capsuleEmirateText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
  },
  capsuleCodeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  capsuleNumberCell: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capsuleNumberText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vehicleTextCol: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 13,
    fontWeight: '700',
  },
  vehicleSub: {
    fontSize: 11,
    marginTop: 1,
  },
  noVehiclePrompt: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noVehicleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  durationSectionWrapper: {
    marginBottom: 12,
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  durationGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  durationPillBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPillHours: {
    fontSize: 16,
    fontWeight: '800',
  },
  durationPillCost: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  costTransparencyRow: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costTransparencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  costTransparencyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  costTransparencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    fontSize: 11,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  paymentActionsGroup: {
    gap: 8,
    marginBottom: 10,
  },
  primaryPayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  payButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryPayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryPayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryPayButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  smsPayloadPreview: {
    fontSize: 11,
    fontWeight: '600',
  },
  safeguardDisclaimer: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 10,
  },
});
