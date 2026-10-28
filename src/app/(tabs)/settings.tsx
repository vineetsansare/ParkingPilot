import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useParkingStore } from "../../store/parkingStore";
import { NotificationService } from "../../services/notificationService";
import { SEED_PARKING_ZONES } from "../../database/seedData";
import { useAppTheme, DriverPersona } from "../../theme/ThemeContext";
import { SettingsGroup } from "../../components/settings/SettingsGroup";
import { SettingsRow } from "../../components/settings/SettingsRow";
import { GradientCard3D } from "../../components/common/GradientCard3D";
import { datasetSyncService } from "../../services/datasetSyncService";
import { DatasetSyncState } from "../../types/dataset";

interface LegalAccordionItem {
  id: string;
  title: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  themeColor: string;
  themePastel: string;
  themeBorder: string;
  takeaway: string;
  bulletPoints: string[];
  officialUrl: string;
  officialLinkText: string;
  fullStatutoryText: string;
}

const LEGAL_DISCLOSURES: LegalAccordionItem[] = [
  {
    id: "cybercrime",
    title: "Independent Utility Status",
    badge: "Cybercrimes Law 34/2021",
    icon: "shield-checkmark-outline",
    themeColor: "#0284C7",
    themePastel: "#E0F2FE",
    themeBorder: "#BAE6FD",
    takeaway: "Payments go 100% directly to official authorities. We never collect or hold your money.",
    bulletPoints: [
      "Not affiliated with or endorsed by Parkin PJSC, RTA Dubai, or ITC Abu Dhabi.",
      "Tapping 'Pay' opens your native SMS (7275) or official WhatsApp (+971 58 800 9090).",
      "All trademarks, zone codes, and municipal names belong to respective authorities.",
    ],
    officialUrl: "https://www.rta.ae",
    officialLinkText: "Visit Official RTA Dubai Portal",
    fullStatutoryText:
      "Pursuant to UAE Federal Decree-Law No. (34) of 2021 Concerning the Fight Against Rumours and Cybercrimes (Articles 11 & 18):\n\n" +
      "• Parking Ticket Buddy is an independent software assistance tool.\n" +
      "• This app is NOT affiliated with, authorized, endorsed, or sponsored by Parkin PJSC, the Roads and Transport Authority (RTA) Dubai, the Integrated Transport Centre (ITC Abu Dhabi / Mawaqif), Sharjah Municipality, or Ajman Municipality.\n" +
      "• All trademark names, logos, zone codes, and municipal references remain the property of their respective official bodies.\n" +
      "• The app DOES NOT collect, hold, or intermediate monetary payments. When you tap \"Pay\", the app initiates a direct SMS (e.g. to 7275) or official WhatsApp chat (e.g. to +971 58 800 9090) through your native system messaging applications.",
  },
  {
    id: "pdpl",
    title: "On-Device Privacy Guarantee",
    badge: "UAE PDPL Law 45/2021",
    icon: "lock-closed-outline",
    themeColor: "#059669",
    themePastel: "#E6F9F4",
    themeBorder: "#A7F3D0",
    takeaway: "Zero remote telemetry. Your license plate numbers and GPS coordinates never leave your phone.",
    bulletPoints: [
      "100% on-device database storage and local processing.",
      "No tracking servers, no cloud databases, and no user profiling.",
      "1-tap permanent deletion of saved vehicles and history anytime.",
    ],
    officialUrl: "https://uaecabinet.ae",
    officialLinkText: "View UAE Cabinet PDPL Guidelines",
    fullStatutoryText:
      "Pursuant to UAE Federal Decree-Law No. (45) of 2021 on Personal Data Protection (PDPL):\n\n" +
      "• Zero Remote Telemetry: Your vehicle registration plate numbers, parking session history, and precise GPS coordinates are processed and stored exclusively inside your device local database.\n" +
      "• No Cloud Tracking: We do not operate remote tracking servers, third-party analytics trackers, or user profiling databases.\n" +
      "• Full Data Erasure: You can permanently delete your saved vehicles and parking logs at any time from the app.",
  },
  {
    id: "vat",
    title: "5% VAT & Carrier Fees",
    badge: "Decree-Law 8/2017",
    icon: "receipt-outline",
    themeColor: "#D97706",
    themePastel: "#FEF3C7",
    themeBorder: "#FDE68A",
    takeaway: "All tariffs include 5% VAT. WhatsApp has AED 0 fee; SMS has AED 0.30 carrier charge.",
    bulletPoints: [
      "All tariff estimates include statutory 5% UAE Value Added Tax.",
      "SMS convenience surcharge of AED 0.30 is billed directly by your telecom (e& / du).",
      "WhatsApp payments via official Mahboub bot incur ZERO convenience fee.",
    ],
    officialUrl: "https://www.parkin.ae",
    officialLinkText: "View Official Parkin Tariff Rules",
    fullStatutoryText:
      "Pursuant to UAE Federal Decree-Law No. (8) of 2017 on Value Added Tax (VAT):\n\n" +
      "• All displayed parking tariff estimates are in UAE Dirhams (AED) and include the statutory 5% UAE Value Added Tax levied by municipal parking operators.\n" +
      "• SMS Telecom Fee: In accordance with UAE telecom regulations, sending an mParking SMS incurs an operator convenience surcharge of AED 0.30 billed by your telecom provider (e& / du).\n" +
      "• Fee-Free Alternative: WhatsApp payments dispatched via the official RTA Mahboub bot incur zero telecom SMS surcharge.",
  },
  {
    id: "grace",
    title: "Grace Periods & Holidays",
    badge: "Exec. Council Res. 5/2016",
    icon: "time-outline",
    themeColor: "#7C3AED",
    themePastel: "#F3E8FF",
    themeBorder: "#DDD6FE",
    takeaway: "10-minute arrival & departure buffer. Free parking on Sundays and public holidays.",
    bulletPoints: [
      "10-minute arrival grace period before a ticket is required.",
      "10-minute buffer after ticket expiry to vacate safely.",
      "Free public parking on Sundays & all statutory UAE national holidays.",
    ],
    officialUrl: "https://www.rta.ae",
    officialLinkText: "Check Public Holiday Schedules",
    fullStatutoryText:
      "Under Dubai Executive Council Resolution No. (5) of 2016 and Parkin PJSC operating guidelines:\n\n" +
      "• 10-Minute Arrival Grace Period: Motorists are afforded a 10-minute buffer upon parking before a valid ticket must be activated.\n" +
      "• 10-Minute Expiry Buffer: An additional 10-minute departure buffer applies upon ticket expiration.\n" +
      "• Free Parking Days: Public parking zones are free on Sundays (excluding multi-storey parking facilities) and during officially declared UAE public holidays (Eid Al Fitr, Eid Al Adha, UAE National Day, Islamic New Year, Prophet Birthday).\n" +
      "• Multi-Storey & Special Event Tariffs: Special event rates (e.g. World Trade Centre during exhibitions) or dedicated private/valet areas may follow independent tariff schedules.",
  },
  {
    id: "sanad",
    title: "People of Determination",
    badge: "Federal Law 29/2006",
    icon: "accessibility-outline",
    themeColor: "#059669",
    themePastel: "#E6F9F4",
    themeBorder: "#A7F3D0",
    takeaway: "Complimentary parking in designated accessible bays for Sanad permit holders.",
    bulletPoints: [
      "Holders of valid Sanad Card park free in all accessible designated public bays.",
      "Physical or digital permit must be displayed or registered with municipal portal.",
    ],
    officialUrl: "https://www.mocd.gov.ae",
    officialLinkText: "Learn about Sanad Card (MOCD)",
    fullStatutoryText:
      "Under UAE Federal Law No. (29) of 2006 on the Rights of People of Determination:\n\n" +
      "• Holders of a valid People of Determination parking card (Sanad Card issued by the Ministry of Community Development or RTA) are entitled to free parking in all designated accessible public parking bays.\n" +
      "• The physical or digital Sanad permit must remain clearly displayed or registered with the official municipal transport portal to prevent automated inspection violations.",
  },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    theme,
    isDark,
    preference,
    setPreference,
    driverPersona,
    setDriverPersona,
    personaColor,
    shadow3D,
  } = useAppTheme();

  const isMonitoring = useParkingStore((state) => state.isMonitoring);
  const setIsMonitoring = useParkingStore((state) => state.setIsMonitoring);
  const setDetectedZone = useParkingStore((state) => state.setDetectedZone);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [preferWhatsApp, setPreferWhatsApp] = useState(true);
  const [expandedLegalId, setExpandedLegalId] = useState<string | null>("cybercrime");
  const [gazetteModalVisible, setGazetteModalVisible] = useState(false);
  const [selectedGazetteItem, setSelectedGazetteItem] = useState<LegalAccordionItem | null>(null);

  // OTA Dataset sync state
  const [syncState, setSyncState] = useState<DatasetSyncState>(() =>
    datasetSyncService.getState()
  );

  useEffect(() => {
    const unsubscribe = datasetSyncService.subscribe((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  const handleSimulateParking = async () => {
    const karamaZone = SEED_PARKING_ZONES.find((z) => z.zoneCode === "318C");
    if (karamaZone) {
      setDetectedZone(karamaZone, { latitude: 25.242, longitude: 55.303 });
      await NotificationService.sendParkingDetectedNotification(karamaZone);
      Alert.alert(
        "Simulated Parking Event",
        "Simulated car stall in Zone 318C (Al Karama)! A local push notification has been sent to your device."
      );
    }
  };

  const handleCheckForUpdates = async () => {
    try {
      const res = await datasetSyncService.checkForUpdates();
      if (res.hasUpdateAvailable) {
        Alert.alert(
          "New Parking Zones Found",
          `Update v${res.availableVersion} is available!\n\nIncludes 5 newly gazetted zones (Dubai Islands & Deira Marina) and updated 2026 tariffs.\n\nTap "Download & Apply" below to load them instantly.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Up to Date",
          `Your parking zone registry (v${res.currentVersion}) is completely up to date with official RTA and Parkin records.`
        );
      }
    } catch {
      Alert.alert("Update Check Failed", "Please check your internet connection and try again.");
    }
  };

  const handleApplyUpdate = async () => {
    const success = await datasetSyncService.downloadAndApplyUpdate();
    if (success) {
      Alert.alert(
        "Zones Updated Successfully",
        "New parking polygons and official 2026 tariffs have been applied to your map in real-time. No app restart required!"
      );
    }
  };

  const handleResetZones = () => {
    Alert.alert(
      "Reset Zone Database",
      "Revert back to initial bundled seed database (v2026.10.26, 149 zones)?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            datasetSyncService.resetToBundled();
            Alert.alert("Reset Complete", "Zone registry restored to bundled version.");
          },
        },
      ]
    );
  };

  const handleOpenUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Cannot open link", url);
      }
    } catch {
      Alert.alert("Error opening link", url);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.canvas }]}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 110,
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* 3D Hero Banner with Dynamic Gradient */}
      <GradientCard3D style={styles.heroCard}>
        <View style={styles.heroInner}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Settings</Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                Tailor your theme, driver persona & parking controls
              </Text>
            </View>
            <View
              style={[
                styles.personaTag,
                {
                  backgroundColor:
                    driverPersona === "pink" ? theme.pinkPastel : theme.skyPastel,
                  borderColor:
                    driverPersona === "pink" ? theme.pinkBorder : theme.skyBorder,
                },
              ]}
            >
              <Text style={{ fontSize: 13, marginRight: 4 }}>
                {driverPersona === "pink" ? "🌸" : "🚗"}
              </Text>
              <Text
                style={[
                  styles.personaTagText,
                  {
                    color:
                      driverPersona === "pink" ? theme.pinkPrimary : theme.skyPrimary,
                  },
                ]}
              >
                {driverPersona === "pink" ? "Girl Driver" : "Boy Driver"}
              </Text>
            </View>
          </View>
        </View>
      </GradientCard3D>

      {/* 1. Driver Persona & Aesthetics (3D Card) */}
      <SettingsGroup
        title="Driver Persona & Color Style"
        description="Choose your driver aesthetic with soft gradients fading smoothly to off-white. Contrast tested for high readability."
      >
        <View style={styles.personaRowContainer}>
          <TouchableOpacity
            style={[
              styles.personaChoiceCard,
              driverPersona === "blue" && [
                styles.personaChoiceCardActive,
                { borderColor: theme.skyPrimary, backgroundColor: theme.skyPastel },
              ],
            ]}
            onPress={() => setDriverPersona("blue")}
            activeOpacity={0.7}
          >
            <View style={[styles.personaIconCircle, { backgroundColor: "#E0F2FE" }]}>
              <Ionicons name="car-sport" size={20} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.personaTitleRow}>
                <Text style={[styles.personaName, { color: theme.textPrimary }]}>Boy Driver</Text>
                {driverPersona === "blue" && (
                  <Ionicons name="checkmark-circle" size={16} color="#0284C7" />
                )}
              </View>
              <Text style={[styles.personaPaletteDesc, { color: theme.textSecondary }]}>
                Light Sky Blue gradient to off-white
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.personaChoiceCard,
              driverPersona === "pink" && [
                styles.personaChoiceCardActive,
                { borderColor: theme.pinkPrimary, backgroundColor: theme.pinkPastel },
              ],
            ]}
            onPress={() => setDriverPersona("pink")}
            activeOpacity={0.7}
          >
            <View style={[styles.personaIconCircle, { backgroundColor: "#FCE7F3" }]}>
              <Ionicons name="heart" size={20} color="#DB2777" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.personaTitleRow}>
                <Text style={[styles.personaName, { color: theme.textPrimary }]}>Girl Driver</Text>
                {driverPersona === "pink" && (
                  <Ionicons name="checkmark-circle" size={16} color="#DB2777" />
                )}
              </View>
              <Text style={[styles.personaPaletteDesc, { color: theme.textSecondary }]}>
                Light Blush Pink gradient to off-white
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Display Mode (System / Light / Dark) */}
        <View style={[styles.modeDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.themeSelectorContainer}>
          {(["system", "light", "dark"] as const).map((mode) => {
            const isSelected = preference === mode;
            const iconName =
              mode === "system"
                ? "phone-portrait-outline"
                : mode === "light"
                ? "sunny-outline"
                : "moon-outline";

            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeButton,
                  isSelected && [
                    styles.themeButtonActive,
                    {
                      backgroundColor: theme.surfaceSecondary,
                      borderColor: personaColor,
                    },
                  ],
                ]}
                onPress={() => setPreference(mode)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={iconName}
                  size={16}
                  color={isSelected ? personaColor : theme.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.themeButtonText,
                    {
                      color: isSelected ? personaColor : theme.textSecondary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SettingsGroup>

      {/* 2. 1-Click Parking Zone Registry & Tariffs (OTA Updates) */}
      <SettingsGroup
        title="Parking Registry & Tariffs"
        description="Instant over-the-air updates for Dubai & UAE parking zones without requiring an App Store release."
      >
        <SettingsRow
          icon="map-outline"
          iconColor={theme.mintPrimary}
          iconBgColor={theme.mintPastel}
          title="Active Parking Zones"
          subtitle={`${syncState.totalZones} Dubai & UAE Zones loaded`}
          badge={`v${syncState.currentVersion}`}
          badgeColor={theme.mintPastel}
          badgeTextColor={theme.mintPrimary}
        />

        <SettingsRow
          icon="time-outline"
          iconColor={personaColor}
          iconBgColor={driverPersona === "pink" ? theme.pinkPastel : theme.skyPastel}
          title="Registry Status"
          subtitle={
            syncState.lastChecked
              ? `Checked: ${syncState.lastChecked}`
              : `Active release: ${syncState.currentReleaseDate}`
          }
          rightElement={
            syncState.hasUpdateAvailable ? (
              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: theme.sandPastel, borderColor: theme.sandBorder },
                ]}
              >
                <Text style={[styles.statusTagText, { color: theme.sandPrimary }]}>
                  Update Ready
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: theme.mintPastel, borderColor: theme.mintBorder },
                ]}
              >
                <Text style={[styles.statusTagText, { color: theme.mintPrimary }]}>
                  Up to Date
                </Text>
              </View>
            )
          }
        />

        {/* Action Row */}
        <View style={styles.updateActionContainer}>
          {syncState.hasUpdateAvailable ? (
            <TouchableOpacity
              style={[
                styles.applyUpdateButton,
                shadow3D,
                { backgroundColor: theme.mintPrimary },
              ]}
              onPress={handleApplyUpdate}
              disabled={syncState.status === "downloading"}
              activeOpacity={0.8}
            >
              {syncState.status === "downloading" ? (
                <View style={styles.buttonInner}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.applyButtonText}>Applying Update...</Text>
                </View>
              ) : (
                <View style={styles.buttonInner}>
                  <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.applyButtonText}>
                    Download & Apply v{syncState.availableVersion} (+5 Zones)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.checkUpdateButton,
                shadow3D,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.borderDefault,
                },
              ]}
              onPress={handleCheckForUpdates}
              disabled={syncState.status === "checking"}
              activeOpacity={0.7}
            >
              {syncState.status === "checking" ? (
                <View style={styles.buttonInner}>
                  <ActivityIndicator size="small" color={theme.textPrimary} />
                  <Text style={[styles.checkButtonText, { color: theme.textPrimary }]}>
                    Checking Official Registry...
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonInner}>
                  <Ionicons name="refresh-outline" size={18} color={theme.textPrimary} />
                  <Text style={[styles.checkButtonText, { color: theme.textPrimary }]}>
                    Check for Parking Zone Updates
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {syncState.currentVersion !== "2026.10.26" && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetZones}
              activeOpacity={0.6}
            >
              <Text style={[styles.resetButtonText, { color: theme.textTertiary }]}>
                Revert to Bundled Database (v2026.10.26)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SettingsGroup>

      {/* 3. Automated Detection */}
      <SettingsGroup
        title="Detection & Notifications"
        description="Smart motion detection alerts you automatically upon parking."
      >
        <SettingsRow
          icon="navigate-outline"
          iconColor={theme.skyPrimary}
          iconBgColor={theme.skyPastel}
          title="Auto Parking Detection"
          subtitle="Identifies zone upon parking via background sensor"
          rightElement={
            <Switch
              value={isMonitoring}
              onValueChange={setIsMonitoring}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={theme.switchThumb}
            />
          }
        />

        <SettingsRow
          icon="notifications-outline"
          iconColor={theme.lavenderPrimary}
          iconBgColor={theme.lavenderPastel}
          title="Push Notifications"
          subtitle="Instant alert with pre-filled SMS/WhatsApp payment"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={theme.switchThumb}
            />
          }
        />

        <SettingsRow
          icon="chatbubbles-outline"
          iconColor={theme.mintPrimary}
          iconBgColor={theme.mintPastel}
          title="WhatsApp (No AED 0.30 Fee)"
          subtitle={
            preferWhatsApp
              ? "Prefers official RTA WhatsApp bot (+971 58 800 9090)"
              : "Prefers standard SMS (7275)"
          }
          rightElement={
            <Switch
              value={preferWhatsApp}
              onValueChange={setPreferWhatsApp}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={theme.switchThumb}
            />
          }
        />

        <SettingsRow
          icon="play-circle-outline"
          iconColor={theme.sandPrimary}
          iconBgColor={theme.sandPastel}
          title="Simulate Parking Event"
          subtitle="Test vehicle arrival notification in Zone 318C (Al Karama)"
          onPress={handleSimulateParking}
          isLast
        />
      </SettingsGroup>

      {/* 4. UAE Legal & Regulatory Compliance (STREAMLINED & SEGREGATED ACCORDIONS) */}
      <View style={styles.sectionHeaderWrapper}>
        <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary }]}>
          UAE LEGAL & STATUTORY COMPLIANCE
        </Text>
      </View>

      {/* Verified Gazette Banner */}
      <View
        style={[
          styles.complianceBanner,
          shadow3D,
          {
            backgroundColor: theme.mintSurface,
            borderColor: theme.mintBorder,
          },
        ]}
      >
        <View style={styles.complianceHeaderRow}>
          <View style={[styles.complianceIconBadge, { backgroundColor: theme.mintPastel }]}>
            <Ionicons name="shield-checkmark" size={20} color={theme.mintPrimary} />
          </View>
          <View style={styles.complianceHeaderTextContainer}>
            <Text style={[styles.complianceTitle, { color: theme.mintPrimary }]}>
              Verified UAE Statutory Compliance
            </Text>
            <View style={styles.complianceDateRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={theme.mintPrimary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.complianceDateText, { color: theme.mintPrimary }]}>
                Updated: {syncState.legalNoticeLastUpdated} • Official UAE Gazettes
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.complianceDesc, { color: theme.textSecondary }]}>
          Adheres strictly to UAE Federal Decree-Laws (Cybercrimes, PDPL No. 45/2021) and Dubai Executive Council resolutions.
        </Text>
      </View>

      {/* Streamlined Visual Accordions */}
      <View
        style={[
          styles.legalCardGroup,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : "rgba(255, 255, 255, 0.9)",
            borderTopColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#FFFFFF",
          },
        ]}
      >
        {LEGAL_DISCLOSURES.map((item, index) => {
          const isExpanded = expandedLegalId === item.id;
          const isLastItem = index === LEGAL_DISCLOSURES.length - 1;

          return (
            <View key={item.id}>
              <TouchableOpacity
                onPress={() => setExpandedLegalId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
                style={styles.legalAccordionRow}
              >
                <View
                  style={[
                    styles.legalIconContainer,
                    { backgroundColor: item.themePastel },
                  ]}
                >
                  <Ionicons name={item.icon} size={19} color={item.themeColor} />
                </View>

                <View style={styles.legalTextContainer}>
                  <View style={styles.legalTitleRow}>
                    <Text
                      style={[styles.legalTitle, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <View
                      style={[
                        styles.lawBadge,
                        { backgroundColor: item.themePastel },
                      ]}
                    >
                      <Text
                        style={[
                          styles.lawBadgeText,
                          { color: item.themeColor },
                        ]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[styles.legalTakeaway, { color: theme.textSecondary }]}
                    numberOfLines={isExpanded ? 3 : 1}
                  >
                    {item.takeaway}
                  </Text>
                </View>

                <Ionicons
                  name={isExpanded ? "chevron-up-circle" : "chevron-down-circle-outline"}
                  size={20}
                  color={isExpanded ? item.themeColor : theme.textTertiary}
                  style={styles.legalChevron}
                />
              </TouchableOpacity>

              {/* Collapsed vs Expanded High-Yield Content */}
              {isExpanded && (
                <View
                  style={[
                    styles.legalExpandedBody,
                    {
                      backgroundColor: theme.surfaceSecondary,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bulletListHeader,
                      { color: theme.textSecondary },
                    ]}
                  >
                    KEY TAKEAWAYS:
                  </Text>
                  {item.bulletPoints.map((point, pIdx) => (
                    <View key={pIdx} style={styles.bulletItemRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={item.themeColor}
                        style={{ marginRight: 6, marginTop: 2 }}
                      />
                      <Text
                        style={[
                          styles.bulletPointText,
                          { color: theme.textPrimary },
                        ]}
                      >
                        {point}
                      </Text>
                    </View>
                  ))}

                  {/* Action Link & Full Gazette Modal Button */}
                  <View style={styles.accordionActionRow}>
                    <TouchableOpacity
                      onPress={() => handleOpenUrl(item.officialUrl)}
                      style={[
                        styles.linkChipButton,
                        {
                          backgroundColor: item.themePastel,
                          borderColor: item.themeBorder,
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="open-outline"
                        size={13}
                        color={item.themeColor}
                        style={{ marginRight: 5 }}
                      />
                      <Text
                        style={[
                          styles.linkChipText,
                          { color: item.themeColor },
                        ]}
                      >
                        {item.officialLinkText}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedGazetteItem(item);
                        setGazetteModalVisible(true);
                      }}
                      style={styles.viewStatutoryButton}
                      activeOpacity={0.6}
                    >
                      <Text
                        style={[
                          styles.viewStatutoryText,
                          { color: theme.textTertiary },
                        ]}
                      >
                        Full Gazette Text
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {!isLastItem && (
                <View
                  style={[
                    styles.legalDivider,
                    { backgroundColor: theme.divider },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* 5. Official UAE Transport Portals (Quick Launchers) */}
      <View style={styles.sectionHeaderWrapper}>
        <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary }]}>
          OFFICIAL TRANSPORT PORTALS
        </Text>
      </View>

      <View style={styles.portalsGrid}>
        {[
          {
            name: "Parkin PJSC",
            desc: "Dubai Public Parking",
            url: "https://www.parkin.ae",
            icon: "car-outline",
            accent: "#059669",
          },
          {
            name: "RTA Dubai",
            desc: "Roads & Transport Authority",
            url: "https://www.rta.ae",
            icon: "business-outline",
            accent: "#0284C7",
          },
          {
            name: "ITC Mawaqif",
            desc: "Abu Dhabi Parking",
            url: "https://www.itc.gov.ae",
            icon: "navigate-circle-outline",
            accent: "#DC2626",
          },
          {
            name: "UAE Cabinet",
            desc: "Federal PDPL & Laws",
            url: "https://uaecabinet.ae",
            icon: "shield-checkmark-outline",
            accent: "#7C3AED",
          },
        ].map((portal) => (
          <TouchableOpacity
            key={portal.name}
            style={[
              styles.portalCard,
              shadow3D,
              {
                backgroundColor: theme.surfacePrimary,
                borderColor: isDark ? theme.borderDefault : "rgba(255, 255, 255, 0.9)",
              },
            ]}
            onPress={() => handleOpenUrl(portal.url)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.portalIconContainer,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Ionicons
                name={portal.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={portal.accent}
              />
            </View>
            <Text
              style={[styles.portalName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {portal.name}
            </Text>
            <Text
              style={[styles.portalDesc, { color: theme.textTertiary }]}
              numberOfLines={1}
            >
              {portal.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer Guarantee */}
      <View style={styles.footerContainer}>
        <Text style={[styles.footerBrand, { color: theme.textPrimary }]}>
          Parking Ticket Buddy
        </Text>
        <Text style={[styles.footerVersion, { color: theme.textTertiary }]}>
          Version 1.0.0 • Database {syncState.currentVersion}
        </Text>
        <Text style={[styles.footerGuarantee, { color: theme.textSecondary }]}>
          Zero Remote Telemetry • On-Device Privacy Guaranteed under UAE PDPL
        </Text>
      </View>

      {/* Full Statutory Gazette Modal */}
      <Modal
        visible={gazetteModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setGazetteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.surfacePrimary,
                paddingBottom: Math.max(insets.bottom, 20) + 16,
              },
            ]}
          >
            <View style={[styles.modalDragHandle, { backgroundColor: theme.borderDefault }]} />

            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  {selectedGazetteItem?.title}
                </Text>
                <Text style={[styles.modalBadgeText, { color: theme.mintPrimary }]}>
                  {selectedGazetteItem?.badge}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setGazetteModalVisible(false)}
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: theme.surfaceSecondary },
                ]}
              >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollArea}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.statutoryTextBlock,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.statutoryText, { color: theme.textPrimary }]}>
                  {selectedGazetteItem?.fullStatutoryText}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.modalDoneButton,
                  shadow3D,
                  { backgroundColor: theme.mintPrimary },
                ]}
                onPress={() => setGazetteModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDoneButtonText}>Close Gazette Article</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    marginBottom: 20,
  },
  heroInner: {
    padding: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 12,
    marginTop: 3,
    maxWidth: 220,
    lineHeight: 16,
  },
  personaTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  personaTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  personaRowContainer: {
    padding: 12,
    gap: 10,
  },
  personaChoiceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: 12,
  },
  personaChoiceCardActive: {
    borderWidth: 1.5,
  },
  personaIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  personaTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  personaName: {
    fontSize: 14,
    fontWeight: "700",
  },
  personaPaletteDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  modeDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },
  themeSelectorContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  themeButtonActive: {},
  themeButtonText: {
    fontSize: 12,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  updateActionContainer: {
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  applyUpdateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkUpdateButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  checkButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  resetButton: {
    marginTop: 10,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  sectionHeaderWrapper: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 6,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  complianceBanner: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 14,
  },
  complianceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  complianceIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  complianceHeaderTextContainer: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  complianceDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  complianceDateText: {
    fontSize: 11,
    fontWeight: "600",
  },
  complianceDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  legalCardGroup: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    marginBottom: 22,
  },
  legalAccordionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  legalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  legalTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  legalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  legalTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  lawBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lawBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  legalTakeaway: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  legalChevron: {
    marginLeft: 6,
  },
  legalDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  legalExpandedBody: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  bulletListHeader: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  bulletItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  bulletPointText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  accordionActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  linkChipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  linkChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  viewStatutoryText: {
    fontSize: 11,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  viewStatutoryButton: {
    paddingVertical: 4,
  },
  portalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  portalCard: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
  },
  portalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  portalName: {
    fontSize: 13,
    fontWeight: "700",
  },
  portalDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  footerContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  footerBrand: {
    fontSize: 13,
    fontWeight: "700",
  },
  footerVersion: {
    fontSize: 11,
    marginTop: 2,
  },
  footerGuarantee: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "85%",
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollArea: {
    marginBottom: 10,
  },
  statutoryTextBlock: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  statutoryText: {
    fontSize: 13,
    lineHeight: 20,
  },
  modalDoneButton: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  modalDoneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
