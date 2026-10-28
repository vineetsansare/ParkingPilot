import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Share,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useParkingStore } from '../../store/parkingStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { ParkingSession } from '../../types/parking';
import { useAppTheme } from '../../theme/ThemeContext';
import { ActiveSessionTracker } from '../../components/ActiveSessionTracker';
import { LicensePlateView } from '../../components/LicensePlateView';

type FilterType = 'all' | 'confirmed' | 'pending' | 'cancelled';

interface HistoryItem {
  id: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  emirateCode: 'DXB' | 'AUH' | 'SHJ' | 'AJM';
  plateCode: string;
  plateNumber: string;
  zoneCode: string;
  zoneArea: string;
  zoneSub: string;
  amount: number;
  isEstimated?: boolean;
  timeRange: string;
  durationLabel: string;
  tariffBreakdown: string;
  statusBadgeText: string;
  carrierText: string;
  recipient: string;
  smsPayload: string;
  carrierResponse: string;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, shadow3D } = useAppTheme();

  const activeSessionFromStore = useParkingStore((state) => state.activeSession);
  const defaultVehicle = useVehicleStore((state) => state.defaultVehicle);

  // Demo active session toggle so user can preview and interact with the Active Session Tracker
  const [showDemoActiveSession, setShowDemoActiveSession] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [selectedInspectionItem, setSelectedInspectionItem] = useState<HistoryItem | null>(null);

  // Build active session instance (either from store or interactive demo session)
  const activeSessionToRender: ParkingSession | null =
    activeSessionFromStore ||
    (showDemoActiveSession
      ? {
          id: 'PK-7842',
          zone: {
            id: '318C',
            emirateId: 'DXB',
            zoneCode: '318C',
            areaNameEn: 'Al Wasl Commercial',
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
          vehicle: defaultVehicle || {
            id: 'v_hero',
            emirateCode: 'DXB',
            plateCode: 'B',
            plateNumber: '49201',
            displayName: 'Tesla Model 3',
            isDefault: true,
          },
          emirateId: 'DXB',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          durationHours: 2,
          expiresAt: new Date(Date.now() + 6135000).toISOString(),
          paymentMethod: 'sms',
          amountPaid: 8.4,
          isActive: true,
        }
      : null);

  // Curated UAE Parking History Items matching Stitch specifications
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    {
      id: 'session-1',
      status: 'confirmed',
      emirateCode: 'DXB',
      plateCode: 'B',
      plateNumber: '49201',
      zoneCode: '318C',
      zoneArea: 'Al Wasl Commercial',
      zoneSub: 'Dubai Parkin Municipal Area',
      amount: 8.4,
      timeRange: 'Today, 2:30 PM → 4:30 PM (2 hrs)',
      durationLabel: '2 hrs',
      tariffBreakdown: 'Tariff AED 8.00 + 40 fils carrier fee',
      statusBadgeText: 'Confirmed Official SMS 7275',
      carrierText: 'Carrier: du Mobile Gateway',
      recipient: '7275 (DUBAI PARKIN)',
      smsPayload: '49201 B 318C 2',
      carrierResponse:
        'Ticket Confirmed: Zone 318C valid until 16:30. Cost AED 8.40 (incl. carrier fee). Ref #PKN-88129-D.',
    },
    {
      id: 'session-2',
      status: 'pending',
      emirateCode: 'DXB',
      plateCode: 'B',
      plateNumber: '49201',
      zoneCode: '332B',
      zoneArea: 'Jumeirah Beach Road',
      zoneSub: 'Roadside Premium Standard',
      amount: 4.4,
      isEstimated: true,
      timeRange: 'Yesterday, 5:10 PM (1 hr)',
      durationLabel: '1 hr',
      tariffBreakdown: 'Tariff AED 4.00 + 40 fils carrier fee',
      statusBadgeText: 'SMS Dispatched — Awaiting Receipt',
      carrierText: 'Carrier: e& Telecom Dispatch',
      recipient: '7275 (DUBAI PARKIN)',
      smsPayload: '49201 B 332B 1',
      carrierResponse:
        'Awaiting operator acknowledgment. Check your device SMS inbox for confirmation receipt.',
    },
    {
      id: 'session-3',
      status: 'confirmed',
      emirateCode: 'AUH',
      plateCode: '5',
      plateNumber: '18402',
      zoneCode: 'Corniche 1',
      zoneArea: 'Corniche Sector 1',
      zoneSub: 'Abu Dhabi ITC Mawaqif Standard',
      amount: 6.0,
      timeRange: 'Oct 28, 11:00 AM → 1:00 PM (2 hrs)',
      durationLabel: '2 hrs',
      tariffBreakdown: 'Mawaqif Standard Tariff AED 3.00/hr (No Carrier Surcharge)',
      statusBadgeText: 'WhatsApp Parkin Bot',
      carrierText: 'Gateway: Official Mahboub Bot (+971 58 800 9090)',
      recipient: '+971 58 800 9090 (RTA / Parkin WhatsApp)',
      smsPayload: 'PARK AUH5 18402 2H',
      carrierResponse:
        'Digital Receipt #ITC-9481: Abu Dhabi Mawaqif session verified until 13:00. Total AED 6.00 paid via Apple Pay.',
    },
    {
      id: 'session-4',
      status: 'cancelled',
      emirateCode: 'SHJ',
      plateCode: 'SHJ',
      plateNumber: '63910',
      zoneCode: 'Al Majaz',
      zoneArea: 'Al Majaz Waterfront',
      zoneSub: 'Sharjah Municipality Public Parking',
      amount: 0.0,
      timeRange: 'Oct 24, 7:45 PM • 10m Grace Period',
      durationLabel: 'Grace',
      tariffBreakdown: 'Driver departed within 10-minute municipal grace window',
      statusBadgeText: 'Cancelled by Driver',
      carrierText: 'Action: Early Relocation Voided',
      recipient: '5566 (SHARJAH MUNICIPALITY)',
      smsPayload: 'SHJ 63910 1',
      carrierResponse: 'Session cancelled by user before dispatch billing cutoff. Void fee: AED 0.00.',
    },
  ]);

  // Calculations for Bento Metrics
  const totalSpend = historyItems.reduce((sum, item) => sum + item.amount, 164.8);
  const totalSettledCount = historyItems.filter((i) => i.status === 'confirmed').length + 37;

  // Filter & Search logic
  const filteredItems = historyItems.filter((item) => {
    const matchesFilter = currentFilter === 'all' || item.status === currentFilter;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesFilter;

    const matchesSearch =
      item.zoneCode.toLowerCase().includes(query) ||
      item.zoneArea.toLowerCase().includes(query) ||
      item.plateNumber.toLowerCase().includes(query) ||
      item.plateCode.toLowerCase().includes(query) ||
      item.emirateCode.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const handleMarkAsReceived = (itemId: string) => {
    setHistoryItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'confirmed',
              isEstimated: false,
              statusBadgeText: 'Confirmed Official SMS 7275',
              carrierResponse:
                'Ticket Confirmed: Zone verified by driver. Cost AED 4.40. Ref #PKN-99412-D.',
            }
          : item
      )
    );
    Alert.alert('Session Verified', 'Ticket receipt has been marked as confirmed.');
  };

  const handleExport = async (type: 'CSV' | 'PDF') => {
    try {
      const csvContent =
        'Date,Zone,Plate,Amount,Status,Carrier\n' +
        historyItems
          .map(
            (i) =>
              `"${i.timeRange}","${i.zoneCode}","${i.emirateCode} ${i.plateCode} ${i.plateNumber}",AED ${i.amount.toFixed(2)},${i.status},"${i.carrierText}"`
          )
          .join('\n');

      await Share.share({
        message: `Parking Pilot UAE - ${type} Ledger Export\n\n${csvContent}`,
        title: `Parking Pilot UAE ${type} Ledger`,
      });
    } catch {
      // Ignore dismiss
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.canvas, paddingTop: insets.top + 8 }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.appTitle, { color: theme.textPrimary }]}>PARKING PILOT</Text>
            <View style={[styles.livePill, { backgroundColor: theme.primaryFixed }]}>
              <View style={[styles.liveDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.liveText, { color: theme.onPrimaryFixed }]}>Live</Text>
            </View>
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>History & Ledger</Text>
        </View>

        {/* Demo Tracker Toggle Button */}
        <TouchableOpacity
          style={[
            styles.demoTrackerBtn,
            {
              backgroundColor: showDemoActiveSession ? theme.primary : theme.surfaceContainer,
            },
          ]}
          onPress={() => setShowDemoActiveSession(!showDemoActiveSession)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="timer-outline"
            size={16}
            color={showDemoActiveSession ? '#FFFFFF' : theme.primary}
          />
          <Text
            style={[
              styles.demoTrackerText,
              { color: showDemoActiveSession ? '#FFFFFF' : theme.primary },
            ]}
          >
            {showDemoActiveSession ? 'Hide Live' : 'Test Tracker'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Render Dedicated Active Session Tracker at Top */}
        {activeSessionToRender && (
          <ActiveSessionTracker
            session={activeSessionToRender}
            onEndSession={() => setShowDemoActiveSession(false)}
          />
        )}

        {/* Metric Overview Bento (Stitch Screen 3) */}
        <View style={styles.bentoSection}>
          {/* Card A: Total Spend */}
          <View
            style={[
              styles.bentoCard,
              shadow3D,
              {
                backgroundColor: theme.surfacePrimary,
                borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
              },
            ]}
          >
            <View style={styles.bentoCardHeader}>
              <View style={styles.bentoTitleRow}>
                <Ionicons name="wallet-outline" size={16} color={theme.primary} />
                <Text style={[styles.bentoLabel, { color: theme.textSecondary }]}>
                  TOTAL RECORDED SPEND
                </Text>
              </View>
              <View style={[styles.bentoBadge, { backgroundColor: theme.surfaceContainerLow }]}>
                <Text style={[styles.bentoBadgeText, { color: theme.primary }]}>Actual Ledger</Text>
              </View>
            </View>

            <Text style={[styles.bentoBigNumber, { color: theme.textPrimary }]}>
              AED {totalSpend.toFixed(2)}
            </Text>

            <View style={styles.bentoSubtextRow}>
              <View style={[styles.tinyGreenDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.bentoSubtext, { color: theme.textSecondary }]}>
                {totalSettledCount} settled vehicle parking sessions
              </Text>
            </View>
          </View>

          {/* Card B: Fines Avoided Estimate */}
          <View
            style={[
              styles.bentoCard,
              shadow3D,
              {
                backgroundColor: theme.surfacePrimary,
                borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
              },
            ]}
          >
            <View style={styles.bentoCardHeader}>
              <View style={styles.bentoTitleRow}>
                <Ionicons name="shield-checkmark-outline" size={16} color={theme.secondary} />
                <Text style={[styles.bentoLabel, { color: theme.textSecondary }]}>
                  FINES AVOIDED (EST.)
                </Text>
              </View>
              <View style={[styles.bentoBadge, { backgroundColor: theme.surfaceContainerHigh }]}>
                <Text style={[styles.bentoBadgeText, { color: theme.secondary }]}>Proactive Alerts</Text>
              </View>
            </View>

            <Text style={[styles.bentoBigNumber, { color: theme.primary }]}>AED 1,200</Text>

            <View style={[styles.bentoNoticeBox, { backgroundColor: theme.surfaceContainerLow }]}>
              <Text style={[styles.bentoNoticeText, { color: theme.textSecondary }]}>
                <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Notice: </Text>
                Illustrative estimate based on AED 150 standard late-penalty tier — not cash savings.
              </Text>
            </View>
          </View>
        </View>

        {/* Filter & Search Section */}
        <View style={styles.searchSection}>
          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: theme.surfacePrimary, borderColor: theme.borderDefault }]}>
            <Ionicons name="search" size={18} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search zone (e.g. 318C), plate, or emirate..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Segmented Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
            {[
              { key: 'all', label: `All (${historyItems.length})` },
              { key: 'confirmed', label: 'Confirmed (38)' },
              { key: 'pending', label: 'Pending / Unverified (2)' },
              { key: 'cancelled', label: 'Cancelled (1)' },
            ].map((tab) => {
              const active = currentFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? theme.primary : theme.surfacePrimary,
                      borderColor: active ? theme.primary : theme.borderDefault,
                    },
                  ]}
                  onPress={() => setCurrentFilter(tab.key as FilterType)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: active ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Activity List Cards */}
        {filteredItems.length > 0 ? (
          <View style={styles.activityList}>
            {filteredItems.map((item) => {
              const isConfirmed = item.status === 'confirmed';
              const isPending = item.status === 'pending';
              const isCancelled = item.status === 'cancelled';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.sessionCard,
                    shadow3D,
                    {
                      backgroundColor: theme.surfacePrimary,
                      borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
                      opacity: isCancelled ? 0.88 : 1,
                    },
                  ]}
                >
                  {/* Top Row: Plate Badge + Status Pill */}
                  <View style={styles.sessionCardTop}>
                    <LicensePlateView
                      emirateCode={item.emirateCode}
                      plateCode={item.plateCode}
                      plateNumber={item.plateNumber}
                      scale={0.72}
                      showShadow={false}
                    />

                    {/* Status Pill */}
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: isConfirmed
                            ? theme.primaryFixed
                            : isPending
                            ? 'rgba(0, 99, 152, 0.12)'
                            : theme.surfaceContainerHigh,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: isConfirmed
                              ? theme.primary
                              : isPending
                              ? theme.secondary
                              : theme.textTertiary,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          {
                            color: isConfirmed
                              ? theme.onPrimaryFixed
                              : isPending
                              ? theme.secondary
                              : theme.textSecondary,
                          },
                        ]}
                      >
                        {item.statusBadgeText}
                      </Text>
                    </View>
                  </View>

                  {/* Zone Information */}
                  <View style={styles.sessionZoneRow}>
                    <View style={styles.sessionZoneLeft}>
                      <Text style={[styles.sessionZoneTitle, { color: theme.textPrimary }]}>
                        {item.zoneCode} • {item.zoneArea}
                      </Text>
                      <Text style={[styles.sessionZoneSub, { color: theme.textSecondary }]}>
                        {item.zoneSub}
                      </Text>
                    </View>
                    <View style={styles.sessionPriceCol}>
                      <Text
                        style={[
                          styles.sessionPriceText,
                          {
                            color: isCancelled ? theme.textTertiary : theme.primary,
                            textDecorationLine: isCancelled ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        AED {item.amount.toFixed(2)}
                      </Text>
                      <Text style={[styles.settledBadge, { color: isPending ? theme.secondary : theme.textSecondary }]}>
                        {isPending ? 'Estimated' : isCancelled ? 'Void' : 'Settled'}
                      </Text>
                    </View>
                  </View>

                  {/* Pending Audit Safeguard Notice (if pending) */}
                  {isPending && (
                    <View style={[styles.pendingWarningBox, { backgroundColor: 'rgba(0, 99, 152, 0.08)' }]}>
                      <Ionicons name="alert-circle" size={16} color={theme.secondary} style={{ marginTop: 1 }} />
                      <Text style={[styles.pendingWarningText, { color: theme.secondary }]}>
                        <Text style={{ fontWeight: '700' }}>Audit safeguard: </Text>
                        Check your native device SMS inbox to ensure official ticket approval code was returned by 7275.
                      </Text>
                    </View>
                  )}

                  {/* Time & Tariff Breakdown Details */}
                  <View style={[styles.timeBreakdownBox, { backgroundColor: theme.surfaceContainerLow }]}>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={14} color={theme.textTertiary} />
                      <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                        {item.timeRange}
                      </Text>
                    </View>
                    <Text style={[styles.tariffNote, { color: theme.textPrimary }]}>
                      {item.tariffBreakdown}
                    </Text>
                  </View>

                  {/* Action Footer */}
                  <View style={styles.cardActionFooter}>
                    <View style={styles.carrierTagRow}>
                      <Ionicons name="chatbox-ellipses-outline" size={13} color={theme.primary} />
                      <Text style={[styles.carrierTagText, { color: theme.textSecondary }]}>
                        {item.carrierText}
                      </Text>
                    </View>

                    <View style={styles.footerBtnsGroup}>
                      {isPending && (
                        <TouchableOpacity
                          style={[styles.markReceivedBtn, { backgroundColor: theme.primary }]}
                          onPress={() => handleMarkAsReceived(item.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                          <Text style={styles.markReceivedText}>Mark Received</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.viewSmsBtn, { backgroundColor: theme.surfaceContainerHigh }]}
                        onPress={() => setSelectedInspectionItem(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.viewSmsText, { color: theme.textPrimary }]}>View SMS Log</Text>
                        <Ionicons name="chevron-forward" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* Empty State */
          <View style={[styles.emptyStateBox, { backgroundColor: theme.surfacePrimary, borderColor: theme.borderDefault }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.surfaceContainer }]}>
              <Ionicons name="search-outline" size={28} color={theme.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No sessions found</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Try tweaking your plate letters, zone code, or filter status.
            </Text>
            <TouchableOpacity
              style={[styles.resetFilterBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                setSearchQuery('');
                setCurrentFilter('all');
              }}
            >
              <Text style={styles.resetFilterBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Export Actions & Disclaimer Footer */}
        <View style={styles.exportSection}>
          <View style={styles.exportBtnsRow}>
            <TouchableOpacity
              style={[styles.exportPrimaryBtn, shadow3D, { backgroundColor: theme.primary }]}
              onPress={() => handleExport('CSV')}
              activeOpacity={0.85}
            >
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text style={styles.exportPrimaryText}>Export Log (CSV Ledger)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportSecondaryBtn, { backgroundColor: theme.surfacePrimary, borderColor: theme.borderDefault }]}
              onPress={() => handleExport('PDF')}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={18} color={theme.textPrimary} />
              <Text style={[styles.exportSecondaryText, { color: theme.textPrimary }]}>Download PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Municipal Safeguard Box */}
          <View style={[styles.municipalNoticeBox, { backgroundColor: theme.surfaceContainerLow }]}>
            <Ionicons name="shield-outline" size={18} color={theme.textTertiary} style={{ marginTop: 1 }} />
            <View style={styles.municipalNoticeContent}>
              <Text style={[styles.municipalNoticeTitle, { color: theme.textPrimary }]}>
                Municipal Verification Safeguard
              </Text>
              <Text style={[styles.municipalNoticeBody, { color: theme.textSecondary }]}>
                Session records reflect outbound SMS triggers created locally on this device, paired with confirmed driver acknowledgments. Parking Pilot is a driver-assistance utility and not an official governmental collection gateway. Always respect zone signages.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Carrier Payload Inspection Bottom Sheet Modal */}
      <Modal
        visible={!!selectedInspectionItem}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInspectionItem(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setSelectedInspectionItem(null)}>
            <View style={styles.backdropDismiss} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.surfacePrimary,
                paddingBottom: Math.max(insets.bottom, 20) + 16,
              },
            ]}
          >
            <View style={[styles.dragHandle, { backgroundColor: theme.borderDefault }]} />

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="chatbubbles" size={20} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Official Carrier Payload</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedInspectionItem(null)}
                style={[styles.modalCloseButton, { backgroundColor: theme.surfaceContainer }]}
              >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedInspectionItem && (
              <View style={styles.payloadBoxGroup}>
                <View style={[styles.payloadCard, { backgroundColor: theme.surfaceContainerLow }]}>
                  <View style={styles.payloadRowHeader}>
                    <Text style={[styles.payloadLabel, { color: theme.textTertiary }]}>
                      RECIPIENT: {selectedInspectionItem.recipient}
                    </Text>
                    <Text style={[styles.payloadLabel, { color: theme.textTertiary }]}>SENT: 14:30:12</Text>
                  </View>
                  <View style={[styles.payloadBodyBox, { backgroundColor: theme.surfacePrimary }]}>
                    <Text style={[styles.payloadBodyText, { color: theme.primary }]}>
                      {selectedInspectionItem.smsPayload}
                    </Text>
                  </View>

                  <View style={[styles.payloadRowHeader, { marginTop: 10 }]}>
                    <Text style={[styles.payloadLabel, { color: theme.textTertiary }]}>
                      RETURN RESPONSE: RECEIVED
                    </Text>
                    <Text style={[styles.payloadLabel, { color: theme.textTertiary }]}>14:30:29</Text>
                  </View>
                  <View style={[styles.payloadBodyBox, { backgroundColor: theme.surfacePrimary }]}>
                    <Text style={[styles.payloadResponseText, { color: theme.textSecondary }]}>
                      {selectedInspectionItem.carrierResponse}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.dismissBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setSelectedInspectionItem(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dismissBtnText}>Dismiss Inspector</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  demoTrackerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 5,
  },
  demoTrackerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bentoSection: {
    gap: 10,
    marginBottom: 16,
  },
  bentoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  bentoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bentoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  bentoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  bentoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bentoBigNumber: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  bentoSubtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tinyGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bentoSubtext: {
    fontSize: 12,
  },
  bentoNoticeBox: {
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  bentoNoticeText: {
    fontSize: 11,
    lineHeight: 15,
  },
  searchSection: {
    gap: 10,
    marginBottom: 14,
  },
  searchBar: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterPillsScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityList: {
    gap: 12,
    marginBottom: 16,
  },
  sessionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  sessionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sessionZoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sessionZoneLeft: {
    flex: 1,
    marginRight: 8,
  },
  sessionZoneTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sessionZoneSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sessionPriceCol: {
    alignItems: 'flex-end',
  },
  sessionPriceText: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  settledBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  pendingWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  pendingWarningText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  timeBreakdownBox: {
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  tariffNote: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  carrierTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  carrierTagText: {
    fontSize: 11,
  },
  footerBtnsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  markReceivedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 4,
  },
  markReceivedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  viewSmsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  viewSmsText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyStateBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  resetFilterBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  exportSection: {
    gap: 12,
    marginBottom: 16,
  },
  exportBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  exportPrimaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  exportPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  exportSecondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  exportSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  municipalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  municipalNoticeContent: {
    flex: 1,
  },
  municipalNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  municipalNoticeBody: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payloadBoxGroup: {
    gap: 12,
  },
  payloadCard: {
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  payloadRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payloadLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  payloadBodyBox: {
    padding: 10,
    borderRadius: 8,
  },
  payloadBodyText: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  payloadResponseText: {
    fontSize: 12,
    lineHeight: 16,
  },
  dismissBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
