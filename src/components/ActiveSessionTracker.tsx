import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { ParkingSession } from '../types/parking';
import { useAppTheme } from '../theme/ThemeContext';
import { LicensePlateView } from './LicensePlateView';
import { useParkingStore } from '../store/parkingStore';

interface ActiveSessionTrackerProps {
  session: ParkingSession;
  onEndSession?: () => void;
}

export const ActiveSessionTracker: React.FC<ActiveSessionTrackerProps> = ({
  session,
  onEndSession,
}) => {
  const { theme, isDark, shadow3D } = useAppTheme();
  const endSessionInStore = useParkingStore((state) => state.endSession);

  // Parse expiry timestamp
  const expiryDate = new Date(session.expiresAt);
  const startDate = new Date(session.startedAt);
  const totalDurationMs = Math.max(1000, expiryDate.getTime() - startDate.getTime());

  // Countdown timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const diff = Math.floor((expiryDate.getTime() - Date.now()) / 1000);
    return Math.max(0, diff > 0 ? diff : 6135); // default fallback to 1h 42m 15s if expired
  });

  const [selectedExtHours, setSelectedExtHours] = useState<1 | 2>(1);
  const [showSmsCode, setShowSmsCode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format HH:MM:SS
  const hours = Math.floor(secondsRemaining / 3600);
  const mins = Math.floor((secondsRemaining % 3600) / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // SVG Ring Progress Calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius; // ~364.42
  const totalDurationSeconds = Math.max(1, Math.floor(totalDurationMs / 1000));
  const progressRatio = Math.min(1, Math.max(0, secondsRemaining / totalDurationSeconds));
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Expiry time string (e.g. 04:30 PM)
  const expiryFormatted = expiryDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate 15m and 5m alert times
  const tMinus15 = new Date(expiryDate.getTime() - 15 * 60000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const tMinus5 = new Date(expiryDate.getTime() - 5 * 60000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate extension rate & new end time
  const extCost = (selectedExtHours * (session.zone?.tariffPeakHourly || 4)).toFixed(2);
  const newEndFormatted = new Date(
    expiryDate.getTime() + selectedExtHours * 3600000
  ).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const smsRecipient = '7275';
  const smsCode = `${session.vehicle?.plateCode || 'B'}${session.vehicle?.plateNumber || '49201'} ${session.zone?.zoneCode || '318C'} ${selectedExtHours}`;

  const handleSendExtension = () => {
    const url = `sms:${smsRecipient}?body=${encodeURIComponent(smsCode)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open SMS', `Please manually send "${smsCode}" to ${smsRecipient}`);
    });
  };

  const handleEarlyDeparture = () => {
    Alert.alert(
      'I Moved My Car',
      `Have you moved your vehicle? This will dismiss upcoming alarms for Zone ${session.zone?.zoneCode || '318C'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Departure',
          style: 'destructive',
          onPress: () => {
            endSessionInStore();
            if (onEndSession) onEndSession();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top State Badge & Meta Header */}
      <View style={[styles.topBadgeRow, { backgroundColor: theme.surfaceContainerLow }]}>
        <View style={styles.liveIndicatorGroup}>
          <View style={styles.pingContainer}>
            <View style={[styles.pingDot, { backgroundColor: theme.primary }]} />
            <View style={[styles.solidDot, { backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.liveTrackerText, { color: theme.primary }]}>
            LIVE ACTIVE TRACKER
          </Text>
        </View>

        <View style={[styles.sessionBadge, { backgroundColor: theme.surfaceContainer }]}>
          <Ionicons name="car-outline" size={13} color={theme.textSecondary} />
          <Text style={[styles.sessionBadgeText, { color: theme.textSecondary }]}>
            Session #{session.id.slice(0, 7)}
          </Text>
        </View>
      </View>

      {/* Elevated Active Timer Card */}
      <View
        style={[
          styles.timerCard,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        {/* Active Pill */}
        <View style={[styles.activePill, { backgroundColor: theme.primaryFixed }]}>
          <Ionicons name="time" size={14} color={theme.primary} />
          <Text style={[styles.activePillText, { color: theme.onPrimaryFixed }]}>
            ACTIVE ESTIMATED SESSION
          </Text>
        </View>

        {/* Circular Countdown Progress Ring */}
        <View style={styles.ringWrapper}>
          <Svg width={150} height={150} style={styles.svgRing}>
            {/* Background Track */}
            <Circle
              cx={75}
              cy={75}
              r={radius}
              stroke={theme.surfaceContainer}
              strokeWidth={9}
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <Circle
              cx={75}
              cy={75}
              r={radius}
              stroke={theme.primary}
              strokeWidth={9}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              transform="rotate(-90 75 75)"
            />
          </Svg>

          <View style={styles.ringCenterText}>
            <Text style={[styles.countdownNumber, { color: theme.textPrimary }]}>
              {timeFormatted}
            </Text>
            <Text style={[styles.remainingLabel, { color: theme.textSecondary }]}>
              REMAINING
            </Text>
          </View>
        </View>

        {/* Session End Callout */}
        <View style={styles.endTimeCallout}>
          <Text style={[styles.endTimeLabel, { color: theme.textSecondary }]}>
            Session ends strictly at
          </Text>
          <View style={[styles.endTimePill, { backgroundColor: theme.surfaceContainerHigh }]}>
            <Text style={[styles.endTimeText, { color: theme.textPrimary }]}>
              {expiryFormatted} Today
            </Text>
          </View>
        </View>

        {/* SMS Status Verification Callout */}
        <View style={[styles.smsVerificationBox, { backgroundColor: theme.surfaceContainerLow }]}>
          <Ionicons name="warning-outline" size={18} color={theme.tertiary} style={{ marginTop: 1 }} />
          <View style={styles.smsVerificationContent}>
            <Text style={[styles.smsVerificationTitle, { color: theme.tertiary }]}>
              OFFICIAL SMS STATUS VERIFICATION
            </Text>
            <Text style={[styles.smsVerificationBody, { color: theme.textSecondary }]}>
              Confirmation dispatch routed via SMS 7275. Always verify receipt of the official RTA / Parkin SMS response before treating parking as authorized.
            </Text>
          </View>
        </View>
      </View>

      {/* Parking Details Bento Grid */}
      <View
        style={[
          styles.detailsCard,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <View style={styles.detailsHeader}>
          <Text style={[styles.detailsSectionTitle, { color: theme.textPrimary }]}>
            Session Specifications
          </Text>
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={14} color={theme.primary} />
            <Text style={[styles.verifiedText, { color: theme.primary }]}>RTA Dubai</Text>
          </View>
        </View>

        {/* Plate Display Row */}
        {session.vehicle && (
          <View style={[styles.plateRowWrap, { backgroundColor: theme.surfaceContainerLow }]}>
            <Text style={[styles.specRowLabel, { color: theme.textSecondary }]}>Registered Plate</Text>
            <LicensePlateView
              emirateCode={session.vehicle.emirateCode}
              plateCode={session.vehicle.plateCode}
              plateNumber={session.vehicle.plateNumber}
              scale={0.75}
              showShadow={false}
            />
          </View>
        )}

        {/* Specifications List */}
        <View style={styles.specList}>
          {/* Zone & Area */}
          <View style={styles.specItem}>
            <View style={styles.specItemLeft}>
              <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.specItemLabel, { color: theme.textSecondary }]}>Zone & Area</Text>
            </View>
            <View style={styles.specItemRight}>
              <Text style={[styles.specItemVal, { color: theme.textPrimary }]}>
                {session.zone?.zoneCode || '318C'} · Commercial
              </Text>
              <Text style={[styles.specItemSub, { color: theme.textSecondary }]}>
                {session.zone?.areaNameEn || 'Al Wasl Road, Jumeirah'}
              </Text>
            </View>
          </View>

          {/* Duration */}
          <View style={styles.specItem}>
            <View style={styles.specItemLeft}>
              <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.specItemLabel, { color: theme.textSecondary }]}>Total Duration</Text>
            </View>
            <View style={styles.specItemRight}>
              <Text style={[styles.specItemVal, { color: theme.textPrimary }]}>
                {session.durationHours || 2} Hours Booked
              </Text>
              <Text style={[styles.specItemSub, { color: theme.textSecondary }]}>
                {new Date(session.startedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} → {expiryFormatted}
              </Text>
            </View>
          </View>

          {/* Tariff */}
          <View style={styles.specItem}>
            <View style={styles.specItemLeft}>
              <Ionicons name="cash-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.specItemLabel, { color: theme.textSecondary }]}>Tariff Calculation</Text>
            </View>
            <View style={styles.specItemRight}>
              <Text style={[styles.specItemVal, { color: theme.textPrimary }]}>
                AED {(session.amountPaid || 8.4).toFixed(2)} Settled
              </Text>
              <Text style={[styles.specItemSub, { color: theme.textSecondary }]}>
                AED 4.00/hr + 40 fils carrier fee
              </Text>
            </View>
          </View>

          {/* Provider Gateway */}
          <View style={styles.specItem}>
            <View style={styles.specItemLeft}>
              <Ionicons name="send-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.specItemLabel, { color: theme.textSecondary }]}>Provider Gateway</Text>
            </View>
            <View style={styles.specItemRight}>
              <Text style={[styles.specItemVal, { color: theme.secondary }]}>
                {session.paymentMethod === 'whatsapp' ? 'WhatsApp Bot (+971 58 800 9090)' : 'SMS 7275 (Dubai RTA)'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Proactive Expiry Alarms Card */}
      <View
        style={[
          styles.detailsCard,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <View style={styles.detailsHeader}>
          <View style={styles.alarmTitleGroup}>
            <View style={[styles.alarmIconWrap, { backgroundColor: theme.surfaceContainer }]}>
              <Ionicons name="notifications" size={15} color={theme.secondary} />
            </View>
            <Text style={[styles.detailsSectionTitle, { color: theme.textPrimary }]}>
              Proactive Expiry Alarms
            </Text>
          </View>
          <Text style={[styles.alarmStatusPill, { color: theme.primary }]}>SCHEDULED</Text>
        </View>

        <View style={styles.alarmGrid}>
          <View style={[styles.alarmBox, { backgroundColor: theme.surfaceContainerLow }]}>
            <Ionicons name="alarm-outline" size={18} color={theme.primary} />
            <View>
              <Text style={[styles.alarmBoxTitle, { color: theme.textPrimary }]}>T - 15 Minutes</Text>
              <Text style={[styles.alarmBoxSub, { color: theme.textSecondary }]}>{tMinus15} Alert</Text>
            </View>
          </View>

          <View style={[styles.alarmBox, { backgroundColor: theme.surfaceContainerLow }]}>
            <Ionicons name="alert-circle-outline" size={18} color={theme.tertiary} />
            <View>
              <Text style={[styles.alarmBoxTitle, { color: theme.textPrimary }]}>T - 5 Minutes</Text>
              <Text style={[styles.alarmBoxSub, { color: theme.textSecondary }]}>{tMinus5} Urgent</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.alarmFooterNotice, { color: theme.textSecondary }]}>
          Local device notifications will sound even with network instability.
        </Text>
      </View>

      {/* Extend Parking Panel */}
      <View
        style={[
          styles.detailsCard,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <View style={styles.extendHeaderRow}>
          <View>
            <Text style={[styles.detailsSectionTitle, { color: theme.textPrimary }]}>
              Extend Parking
            </Text>
            <Text style={[styles.extendSubtitle, { color: theme.textSecondary }]}>
              Explicit manual driver authorization required
            </Text>
          </View>
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
        </View>

        {/* Extension Options Grid */}
        <View style={styles.extOptionsGrid}>
          <TouchableOpacity
            style={[
              styles.extOptionBtn,
              {
                backgroundColor: selectedExtHours === 1 ? theme.primary : theme.surfaceContainerLow,
              },
            ]}
            onPress={() => setSelectedExtHours(1)}
            activeOpacity={0.8}
          >
            <View style={styles.extOptTop}>
              <Text style={[styles.extOptTitle, { color: selectedExtHours === 1 ? '#FFFFFF' : theme.textPrimary }]}>
                + 1 Hour
              </Text>
              {selectedExtHours === 1 && (
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={[styles.extOptPrice, { color: selectedExtHours === 1 ? '#FFFFFF' : theme.textPrimary }]}>
              AED 4.00
            </Text>
            <Text style={[styles.extOptUntil, { color: selectedExtHours === 1 ? 'rgba(255,255,255,0.85)' : theme.textSecondary }]}>
              Until {new Date(expiryDate.getTime() + 3600000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.extOptionBtn,
              {
                backgroundColor: selectedExtHours === 2 ? theme.primary : theme.surfaceContainerLow,
              },
            ]}
            onPress={() => setSelectedExtHours(2)}
            activeOpacity={0.8}
          >
            <View style={styles.extOptTop}>
              <Text style={[styles.extOptTitle, { color: selectedExtHours === 2 ? '#FFFFFF' : theme.textPrimary }]}>
                + 2 Hours
              </Text>
              {selectedExtHours === 2 && (
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={[styles.extOptPrice, { color: selectedExtHours === 2 ? '#FFFFFF' : theme.textPrimary }]}>
              AED 8.00
            </Text>
            <Text style={[styles.extOptUntil, { color: selectedExtHours === 2 ? 'rgba(255,255,255,0.85)' : theme.textSecondary }]}>
              Until {new Date(expiryDate.getTime() + 7200000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Safeguard Notice */}
        <View style={[styles.safeguardBox, { backgroundColor: theme.surfaceContainerLow }]}>
          <Ionicons name="shield-outline" size={16} color={theme.secondary} style={{ marginTop: 1 }} />
          <Text style={[styles.safeguardText, { color: theme.textSecondary }]}>
            We never auto-charge. Tapping below securely prepares your native SMS app to dispatch the official extension code to 7275.
          </Text>
        </View>

        {/* Extension Action Button */}
        <TouchableOpacity
          style={[styles.authorizeBtn, { backgroundColor: theme.primary }]}
          onPress={handleSendExtension}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
          <Text style={styles.authorizeBtnText}>
            Authorize & Send Extension (+{selectedExtHours} hr)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prepared SMS Transparency Accordion */}
      <View
        style={[
          styles.detailsCard,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setShowSmsCode(!showSmsCode)}
          activeOpacity={0.7}
        >
          <View style={styles.accordionLeft}>
            <Ionicons name="code-slash-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.accordionTitle, { color: theme.textPrimary }]}>
              View Prepared SMS Code
            </Text>
          </View>
          <Ionicons
            name={showSmsCode ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {showSmsCode && (
          <View style={styles.accordionBody}>
            <View style={[styles.smsPayloadCard, { backgroundColor: theme.inverseSurface }]}>
              <View>
                <Text style={[styles.smsPayloadHeader, { color: theme.surfaceContainerHighest }]}>
                  DISPATCHED COMMAND
                </Text>
                <Text style={[styles.smsPayloadBody, { color: theme.primaryFixed }]}>
                  {smsCode}
                </Text>
              </View>
              <View style={[styles.recipientChip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={[styles.recipientText, { color: theme.inverseOnSurface }]}>
                  To {smsRecipient}
                </Text>
              </View>
            </View>
            <Text style={[styles.smsPayloadNote, { color: theme.textSecondary }]}>
              Standard UAE carrier network charge of 40 fils per SMS applies upon transmission.
            </Text>
          </View>
        )}
      </View>

      {/* Session Termination (Early Departure) */}
      <View style={styles.terminationSection}>
        <TouchableOpacity
          style={[styles.departureBtn, { backgroundColor: theme.surfaceContainerHigh }]}
          onPress={handleEarlyDeparture}
          activeOpacity={0.7}
        >
          <Ionicons name="car-outline" size={18} color={theme.textPrimary} />
          <Text style={[styles.departureBtnText, { color: theme.textPrimary }]}>
            I Moved My Car (Cancel Reminders)
          </Text>
        </TouchableOpacity>
        <Text style={[styles.departureSubtext, { color: theme.textSecondary }]}>
          Halts subsequent alarms. Does not refund active municipal fees.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    gap: 12,
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  liveIndicatorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pingContainer: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.4,
  },
  solidDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveTrackerText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 4,
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
    marginBottom: 10,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  ringWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  svgRing: {
    position: 'absolute',
  },
  ringCenterText: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  remainingLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  endTimeCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  endTimeLabel: {
    fontSize: 13,
  },
  endTimePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  endTimeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  smsVerificationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginTop: 14,
    width: '100%',
  },
  smsVerificationContent: {
    flex: 1,
  },
  smsVerificationTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  smsVerificationBody: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailsSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  plateRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  specRowLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  specList: {
    gap: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specItemLabel: {
    fontSize: 13,
  },
  specItemRight: {
    alignItems: 'flex-end',
  },
  specItemVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  specItemSub: {
    fontSize: 11,
    marginTop: 1,
  },
  alarmTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alarmIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmStatusPill: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  alarmGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  alarmBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  alarmBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  alarmBoxSub: {
    fontSize: 11,
    marginTop: 1,
  },
  alarmFooterNotice: {
    fontSize: 11,
    marginTop: 8,
    lineHeight: 15,
  },
  extendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  extendSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  extOptionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  extOptionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
  },
  extOptTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extOptTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  extOptPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 2,
    fontVariant: ['tabular-nums'],
  },
  extOptUntil: {
    fontSize: 11,
  },
  safeguardBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 10,
  },
  safeguardText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  authorizeBtn: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  authorizeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  accordionBody: {
    marginTop: 10,
    gap: 6,
  },
  smsPayloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
  },
  smsPayloadHeader: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  smsPayloadBody: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  recipientChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recipientText: {
    fontSize: 11,
    fontWeight: '600',
  },
  smsPayloadNote: {
    fontSize: 11,
    lineHeight: 15,
  },
  terminationSection: {
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  departureBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  departureBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  departureSubtext: {
    fontSize: 11,
    textAlign: 'center',
  },
});
