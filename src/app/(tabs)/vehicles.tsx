import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVehicleStore } from '../../store/vehicleStore';
import { useParkingStore } from '../../store/parkingStore';
import { EmirateCode, Vehicle } from '../../types/parking';
import { EMIRATE_PLATE_CONFIGS, EmiratePlateConfig } from '../../constants/platePatterns';
import { LicensePlateView } from '../../components/LicensePlateView';
import { useAppTheme } from '../../theme/ThemeContext';

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, shadow3D } = useAppTheme();

  const vehicles = useVehicleStore((state) => state.vehicles);
  const defaultVehicle = useVehicleStore((state) => state.defaultVehicle);
  const addVehicle = useVehicleStore((state) => state.addVehicle);
  const deleteVehicle = useVehicleStore((state) => state.deleteVehicle);
  const setDefaultVehicle = useVehicleStore((state) => state.setDefaultVehicle);

  const detectedZone = useParkingStore((state) => state.detectedZone);
  const selectedZone = useParkingStore((state) => state.selectedZone);
  const currentZone = detectedZone || selectedZone;

  // Modals state
  const [modalVisible, setModalVisible] = useState(false);
  const [guideModalVisible, setGuideModalVisible] = useState(false);
  const [spotlightMenuVisible, setSpotlightMenuVisible] = useState(false);

  // Form state
  const [emirateCode, setEmirateCode] = useState<EmirateCode>('DXB');
  const [plateCode, setPlateCode] = useState('B');
  const [plateNumber, setPlateNumber] = useState('');
  const [displayName, setDisplayName] = useState('');

  const currentConfig: EmiratePlateConfig = EMIRATE_PLATE_CONFIGS[emirateCode];

  // Primary vehicle is the default vehicle, or the first vehicle if none marked
  const primaryVehicle = defaultVehicle || vehicles[0];
  // Secondary fleet contains all other vehicles
  const secondaryVehicles = vehicles.filter((v) => v.id !== primaryVehicle?.id);

  const handleSelectEmirate = (code: EmirateCode) => {
    setEmirateCode(code);
    setPlateCode(EMIRATE_PLATE_CONFIGS[code].defaultCode);
  };

  const handleSave = () => {
    const trimmedNumber = plateNumber.trim();
    const trimmedCode = plateCode.trim().toUpperCase();

    if (!trimmedNumber) {
      Alert.alert('Plate Number Required', 'Please enter your vehicle license plate number.');
      return;
    }

    if (!/^\d{1,5}$/.test(trimmedNumber)) {
      Alert.alert('Invalid Number', 'Plate number must be between 1 and 5 numeric digits.');
      return;
    }

    if (!trimmedCode) {
      Alert.alert('Code Required', `Please enter a valid ${currentConfig.codeLabel} for ${currentConfig.nameEn}.`);
      return;
    }

    addVehicle({
      emirateCode,
      plateCode: trimmedCode,
      plateNumber: trimmedNumber,
      displayName:
        displayName.trim() ||
        `${currentConfig.nameEn} ${trimmedCode} ${trimmedNumber}`,
      isDefault: vehicles.length === 0,
    });

    setPlateNumber('');
    setDisplayName('');
    Keyboard.dismiss();
    setModalVisible(false);
  };

  const handleSharePlate = async (v: Vehicle) => {
    try {
      await Share.share({
        message: `Parking Pilot UAE • Plate Card: ${v.emirateCode} ${v.plateCode} ${v.plateNumber} (${v.displayName})`,
      });
    } catch {
      // Ignore dismiss
    }
  };

  const confirmDelete = (v: Vehicle) => {
    Alert.alert(
      'Remove Vehicle',
      `Are you sure you want to remove ${v.displayName} (${v.plateCode} ${v.plateNumber})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteVehicle(v.id),
        },
      ]
    );
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
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>My Car — Vehicle Garage</Text>
        </View>

        <TouchableOpacity
          style={[styles.guideIconButton, { backgroundColor: theme.surfaceContainer, borderColor: theme.borderDefault }]}
          onPress={() => setGuideModalVisible(true)}
          activeOpacity={0.7}
          accessibilityLabel="Plate Guide"
        >
          <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle Intro Banner */}
        <View style={[styles.introBanner, { backgroundColor: theme.surfaceContainerLow }]}>
          <View style={[styles.introIconContainer, { backgroundColor: 'rgba(0, 105, 72, 0.12)' }]}>
            <Ionicons name="speedometer-outline" size={20} color={theme.primary} />
          </View>
          <View style={styles.introContent}>
            <Text style={[styles.introText, { color: theme.textPrimary }]}>
              Manage registered vehicles for rapid 1-tap zone handoffs and official SMS / WhatsApp tariff dispatch.
            </Text>
            <View style={styles.smsReadyRow}>
              <View style={[styles.greenDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.smsReadyText, { color: theme.textSecondary }]}>
                SMS READY • 7275 • 3009 • 5566
              </Text>
            </View>
          </View>
        </View>

        {/* Primary Spotlight Hero Card */}
        {primaryVehicle ? (
          <View
            style={[
              styles.heroCard,
              shadow3D,
              {
                backgroundColor: theme.surfacePrimary,
                borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF',
              },
            ]}
          >
            {/* Top Row: Default Badge + More Action Button */}
            <View style={styles.heroTopRow}>
              <View style={[styles.defaultBadge, { backgroundColor: theme.primaryFixed }]}>
                <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
                <Text style={[styles.defaultBadgeText, { color: theme.onPrimaryFixed }]}>
                  DEFAULT ACTIVE VEHICLE
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.moreBtn, { backgroundColor: theme.surfaceContainer }]}
                onPress={() => setSpotlightMenuVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Authentic UAE Dual-Cell Plate Stamping */}
            <View style={[styles.heroPlateWrapper, { backgroundColor: theme.surfaceContainerHigh }]}>
              <View style={styles.heroPlateShadow}>
                <LicensePlateView
                  emirateCode={primaryVehicle.emirateCode}
                  plateCode={primaryVehicle.plateCode}
                  plateNumber={primaryVehicle.plateNumber}
                  scale={1.25}
                  showShadow={false}
                />
              </View>
            </View>

            {/* Vehicle Meta & Status */}
            <View style={styles.heroMetaGroup}>
              <View style={styles.heroTitleRow}>
                <Text style={[styles.heroTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                  {primaryVehicle.displayName}
                </Text>
                <View style={[styles.emiratePill, { backgroundColor: theme.surfaceContainer }]}>
                  <Text style={[styles.emiratePillText, { color: theme.textSecondary }]}>
                    {EMIRATE_PLATE_CONFIGS[primaryVehicle.emirateCode]?.nameEn || 'UAE'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                {primaryVehicle.plateCode} {primaryVehicle.plateNumber} • Registered for Operator Dispatch
              </Text>
            </View>

            {/* Active Link Context Indicator */}
            <View style={[styles.zoneLinkBanner, { backgroundColor: theme.surfaceContainerLow }]}>
              <View style={[styles.pulsingDotWrapper]}>
                <View style={[styles.pulsingDot, { backgroundColor: theme.primary }]} />
              </View>
              <Text style={[styles.zoneLinkText, { color: theme.textSecondary }]}>
                Currently linked to default quick-pay zone{' '}
                <Text style={{ fontWeight: '700', color: theme.textPrimary }}>
                  {currentZone ? `${currentZone.zoneCode} (${currentZone.areaNameEn})` : '318C (Al Wasl)'}
                </Text>
              </Text>
            </View>

            {/* Card Actions Grid */}
            <View style={styles.heroActionsGrid}>
              <TouchableOpacity
                style={[styles.heroActionBtn, { backgroundColor: theme.surfaceContainer }]}
                onPress={() => handleSharePlate(primaryVehicle)}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={16} color={theme.textPrimary} />
                <Text style={[styles.heroActionBtnText, { color: theme.textPrimary }]}>Share Plate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroActionBtn, { backgroundColor: theme.surfaceContainer }]}
                onPress={() => setGuideModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="document-text-outline" size={16} color={theme.textPrimary} />
                <Text style={[styles.heroActionBtnText, { color: theme.textPrimary }]}>Plate Guide</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Saved Fleet Section */}
        {secondaryVehicles.length > 0 && (
          <View style={styles.savedFleetSection}>
            <View style={styles.savedFleetHeader}>
              <View style={styles.savedFleetTitleGroup}>
                <Text style={[styles.savedFleetTitle, { color: theme.textPrimary }]}>Saved Fleet</Text>
                <View style={[styles.fleetCountPill, { backgroundColor: theme.surfaceContainerHigh }]}>
                  <Text style={[styles.fleetCountText, { color: theme.textPrimary }]}>
                    {secondaryVehicles.length} {secondaryVehicles.length === 1 ? 'Car' : 'Cars'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.savedFleetSubtitle, { color: theme.textSecondary }]}>
                Tap to activate
              </Text>
            </View>

            {secondaryVehicles.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.fleetCard,
                  shadow3D,
                  {
                    backgroundColor: theme.surfacePrimary,
                    borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
                  },
                ]}
              >
                <View style={styles.fleetCardTopRow}>
                  {/* Miniature Plate Stamping */}
                  <View style={styles.fleetPlateMiniature}>
                    <LicensePlateView
                      emirateCode={item.emirateCode}
                      plateCode={item.plateCode}
                      plateNumber={item.plateNumber}
                      scale={0.78}
                      showShadow={false}
                    />
                  </View>

                  {/* Actions: Set Primary + Delete */}
                  <View style={styles.fleetCardActions}>
                    <TouchableOpacity
                      style={[styles.setPrimaryBtn, { backgroundColor: theme.surfaceContainer }]}
                      onPress={() => setDefaultVehicle(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="radio-button-off" size={15} color={theme.primary} />
                      <Text style={[styles.setPrimaryText, { color: theme.primary }]}>Set Primary</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.fleetDeleteBtn, { backgroundColor: theme.surfaceContainer }]}
                      onPress={() => confirmDelete(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.rosePrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Fleet Details */}
                <View style={styles.fleetMeta}>
                  <Text style={[styles.fleetName, { color: theme.textPrimary }]}>{item.displayName}</Text>
                  <Text style={[styles.fleetSubtext, { color: theme.textSecondary }]}>
                    {EMIRATE_PLATE_CONFIGS[item.emirateCode]?.nameEn} Ready • {item.plateCode} {item.plateNumber}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add Another Vehicle CTA Button */}
        <TouchableOpacity
          style={[styles.addVehicleCta, shadow3D, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text style={styles.addVehicleCtaText}>Add Another Vehicle</Text>
        </TouchableOpacity>

        {/* Supported UAE Emirates Formats Pills */}
        <View style={[styles.coverageCard, { backgroundColor: theme.surfaceContainerLow }]}>
          <View style={styles.coverageHeader}>
            <Text style={[styles.coverageTitle, { color: theme.textSecondary }]}>
              SUPPORTED UAE EMIRATES FORMATS
            </Text>
            <Ionicons name="shield-checkmark" size={16} color={theme.primary} />
          </View>
          <View style={styles.emiratePillsGrid}>
            {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map((em) => (
              <View key={em} style={[styles.supportedPill, { backgroundColor: theme.surfacePrimary }]}>
                <Text style={[styles.supportedPillText, { color: theme.textPrimary }]}>{em}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Data Privacy & Local Verification Box */}
        <View style={[styles.privacyBox, { backgroundColor: 'rgba(0, 99, 152, 0.08)' }]}>
          <View style={[styles.privacyIconWrap, { backgroundColor: theme.secondary }]}>
            <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.privacyContent}>
            <Text style={[styles.privacyTitle, { color: theme.secondary }]}>
              LOCAL SECURE STORAGE ONLY
            </Text>
            <Text style={[styles.privacyBody, { color: theme.textSecondary }]}>
              Your vehicle plates and details are strictly stored locally on this phone to format official operator SMS payloads (7275 / 3009 / 5566). Parking Pilot never synchronizes or queries central police records or credit ratings.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Spotlight Menu Modal */}
      <Modal visible={spotlightMenuVisible} transparent animationType="fade" onRequestClose={() => setSpotlightMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setSpotlightMenuVisible(false)}>
          <View style={styles.menuBackdrop}>
            <View style={[styles.popoverMenu, { backgroundColor: theme.surfacePrimary }]}>
              {primaryVehicle && (
                <>
                  <TouchableOpacity
                    style={styles.popoverItem}
                    onPress={() => {
                      setSpotlightMenuVisible(false);
                      handleSharePlate(primaryVehicle);
                    }}
                  >
                    <Ionicons name="share-social-outline" size={18} color={theme.textPrimary} />
                    <Text style={[styles.popoverItemText, { color: theme.textPrimary }]}>Share Plate Card</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.popoverItem}
                    onPress={() => {
                      setSpotlightMenuVisible(false);
                      setGuideModalVisible(true);
                    }}
                  >
                    <Ionicons name="help-circle-outline" size={18} color={theme.textPrimary} />
                    <Text style={[styles.popoverItemText, { color: theme.textPrimary }]}>SMS Syntax Guide</Text>
                  </TouchableOpacity>

                  {vehicles.length > 1 && (
                    <TouchableOpacity
                      style={styles.popoverItem}
                      onPress={() => {
                        setSpotlightMenuVisible(false);
                        confirmDelete(primaryVehicle);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.rosePrimary} />
                      <Text style={[styles.popoverItemText, { color: theme.rosePrimary }]}>Remove Vehicle</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal: Register New Vehicle Sheet */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Register New Vehicle</Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setModalVisible(false);
                }}
                style={[styles.modalCloseButton, { backgroundColor: theme.surfaceContainer }]}
              >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Emirate Selection Grid */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Emirate Authority</Text>
                <View style={styles.emirateGrid}>
                  {(['DXB', 'AUH', 'SHJ', 'AJM', 'RAK', 'FUJ'] as EmirateCode[]).map((code) => {
                    const isSelected = emirateCode === code;
                    const cfg = EMIRATE_PLATE_CONFIGS[code];
                    return (
                      <TouchableOpacity
                        key={code}
                        style={[
                          styles.emirateChoiceBtn,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.surfaceContainer,
                          },
                        ]}
                        onPress={() => handleSelectEmirate(code)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.emirateChoiceText,
                            { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                          ]}
                        >
                          {cfg.nameEn}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Plate Code & Number Inputs */}
              <View style={styles.plateInputRow}>
                <View style={styles.codeColumn}>
                  <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Plate Code</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.codeTabularInput,
                      {
                        backgroundColor: theme.surfaceContainerLow,
                        color: theme.textPrimary,
                        borderColor: theme.borderDefault,
                      },
                    ]}
                    value={plateCode}
                    onChangeText={(txt) => setPlateCode(txt.toUpperCase())}
                    placeholder="e.g. A"
                    placeholderTextColor={theme.textTertiary}
                    maxLength={4}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.numberColumn}>
                  <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Plate Number</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.codeTabularInput,
                      {
                        backgroundColor: theme.surfaceContainerLow,
                        color: theme.textPrimary,
                        borderColor: theme.borderDefault,
                      },
                    ]}
                    value={plateNumber}
                    onChangeText={setPlateNumber}
                    placeholder="e.g. 54910"
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              </View>

              {/* Vehicle Nickname / Model */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Make & Model Details</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceContainerLow,
                      color: theme.textPrimary,
                      borderColor: theme.borderDefault,
                    },
                  ]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="e.g. Tesla Model 3 (Pearl White)"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="words"
                />
              </View>

              {/* Live Preview Miniature */}
              <View style={[styles.livePreviewBox, { backgroundColor: theme.surfaceContainerHigh }]}>
                <Text style={[styles.livePreviewLabel, { color: theme.textSecondary }]}>LIVE PLATE PREVIEW</Text>
                <View style={styles.livePreviewCenter}>
                  <LicensePlateView
                    emirateCode={emirateCode}
                    plateCode={plateCode}
                    plateNumber={plateNumber}
                    scale={1.05}
                    showShadow={false}
                  />
                </View>
              </View>

              {/* Modal Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: theme.primary }]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Plate to Wallet</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.surfaceContainer }]}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: UAE Plate SMS Formats Guide */}
      <Modal visible={guideModalVisible} animationType="slide" transparent onRequestClose={() => setGuideModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setGuideModalVisible(false)}>
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
              <View style={styles.guideHeaderTitleRow}>
                <Ionicons name="chatbubbles-outline" size={20} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>UAE Plate SMS Formats</Text>
              </View>
              <TouchableOpacity
                onPress={() => setGuideModalVisible(false)}
                style={[styles.modalCloseButton, { backgroundColor: theme.surfaceContainer }]}
              >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              <View style={styles.guideList}>
                <View style={[styles.guideItem, { backgroundColor: theme.surfaceContainerLow }]}>
                  <Text style={[styles.guideItemTitle, { color: theme.textPrimary }]}>
                    Dubai (RTA — 7275)
                  </Text>
                  <Text style={[styles.guideItemSyntax, { color: theme.primary }]}>
                    [PlateCode][PlateNo] [ZoneCode] [Duration]
                  </Text>
                  <Text style={[styles.guideItemExample, { color: theme.textSecondary }]}>
                    Example: B49201 318C 2 (2 hours in Al Wasl)
                  </Text>
                </View>

                <View style={[styles.guideItem, { backgroundColor: theme.surfaceContainerLow }]}>
                  <Text style={[styles.guideItemTitle, { color: theme.textPrimary }]}>
                    Abu Dhabi (Mawaqif — 3009)
                  </Text>
                  <Text style={[styles.guideItemSyntax, { color: theme.secondary }]}>
                    [CityCode][Category][Plate] [Zone] [Duration]
                  </Text>
                  <Text style={[styles.guideItemExample, { color: theme.textSecondary }]}>
                    Example: AUH5 18402 S 2 (Standard Mawaqif 2 hours)
                  </Text>
                </View>

                <View style={[styles.guideItem, { backgroundColor: theme.surfaceContainerLow }]}>
                  <Text style={[styles.guideItemTitle, { color: theme.textPrimary }]}>
                    Sharjah (Mawaqif — 5566)
                  </Text>
                  <Text style={[styles.guideItemSyntax, { color: theme.textPrimary }]}>
                    SHJ [PlateNumber] [Duration]
                  </Text>
                  <Text style={[styles.guideItemExample, { color: theme.textSecondary }]}>
                    Example: SHJ 63910 2 (2 hours public parking)
                  </Text>
                </View>

                <View style={[styles.guideItem, { backgroundColor: theme.surfaceContainerLow }]}>
                  <Text style={[styles.guideItemTitle, { color: theme.textPrimary }]}>
                    Ajman (MPARK — 5155)
                  </Text>
                  <Text style={[styles.guideItemSyntax, { color: theme.textPrimary }]}>
                    AJM [PlateCode] [PlateNumber] [Duration]
                  </Text>
                  <Text style={[styles.guideItemExample, { color: theme.textSecondary }]}>
                    Example: AJM B 12345 1 (1 hour)
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary, marginTop: 16 }]}
                onPress={() => setGuideModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Understood</Text>
              </TouchableOpacity>
            </ScrollView>
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
  guideIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 14,
    gap: 10,
    marginBottom: 14,
  },
  introIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  introContent: {
    flex: 1,
  },
  introText: {
    fontSize: 13,
    lineHeight: 18,
  },
  smsReadyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  smsReadyText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlateWrapper: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroPlateShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroMetaGroup: {
    marginBottom: 12,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  emiratePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emiratePillText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  heroSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  zoneLinkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  pulsingDotWrapper: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneLinkText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  heroActionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  heroActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  savedFleetSection: {
    marginBottom: 16,
  },
  savedFleetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  savedFleetTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savedFleetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  fleetCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  fleetCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  savedFleetSubtitle: {
    fontSize: 12,
  },
  fleetCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  fleetCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fleetPlateMiniature: {
    overflow: 'hidden',
    borderRadius: 6,
  },
  fleetCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  setPrimaryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fleetDeleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fleetMeta: {
    marginTop: 8,
  },
  fleetName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fleetSubtext: {
    fontSize: 12,
    marginTop: 1,
  },
  addVehicleCta: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addVehicleCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  coverageCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  coverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coverageTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  emiratePillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  supportedPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  supportedPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  privacyBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  privacyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  privacyBody: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popoverMenu: {
    width: 220,
    borderRadius: 14,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderRadius: 8,
  },
  popoverItemText: {
    fontSize: 14,
    fontWeight: '500',
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
    maxHeight: '90%',
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
  guideHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  emirateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emirateChoiceBtn: {
    width: '31%',
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emirateChoiceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  plateInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  codeColumn: {
    width: '35%',
  },
  numberColumn: {
    flex: 1,
  },
  textInput: {
    height: 46,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  codeTabularInput: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    fontSize: 16,
  },
  livePreviewBox: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  livePreviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  livePreviewCenter: {
    alignItems: 'center',
  },
  modalActions: {
    gap: 8,
    marginTop: 4,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  guideList: {
    gap: 10,
  },
  guideItem: {
    padding: 12,
    borderRadius: 10,
  },
  guideItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  guideItemSyntax: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  guideItemExample: {
    fontSize: 12,
  },
});
