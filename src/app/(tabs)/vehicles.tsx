import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVehicleStore } from '../../store/vehicleStore';
import { EmirateCode, Vehicle } from '../../types/parking';
import { UAE_EMIRATES } from '../../constants/uaeParking';
import { EMIRATE_PLATE_CONFIGS, EmiratePlateConfig, ALL_EMIRATES, validatePlateInput } from '../../constants/platePatterns';
import { LicensePlateView } from '../../components/LicensePlateView';
import { useAppTheme } from '../../theme/ThemeContext';

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, shadow3D, personaColor, driverPersona } = useAppTheme();

  const vehicles = useVehicleStore((state) => state.vehicles);
  const defaultVehicle = useVehicleStore((state) => state.defaultVehicle);
  const addVehicle = useVehicleStore((state) => state.addVehicle);
  const deleteVehicle = useVehicleStore((state) => state.deleteVehicle);
  const setDefaultVehicle = useVehicleStore((state) => state.setDefaultVehicle);

  const [modalVisible, setModalVisible] = useState(false);
  const [emirateCode, setEmirateCode] = useState<EmirateCode>('DXB');
  const [plateCode, setPlateCode] = useState('A');
  const [plateNumber, setPlateNumber] = useState('');
  const [displayName, setDisplayName] = useState('');

  const currentConfig: EmiratePlateConfig = EMIRATE_PLATE_CONFIGS[emirateCode];

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
        `${currentConfig.nameEn} Plate ${trimmedCode}-${trimmedNumber}`,
      isDefault: vehicles.length === 0,
    });

    setPlateNumber('');
    setDisplayName('');
    Keyboard.dismiss();
    setModalVisible(false);
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => {
    const isDefault = defaultVehicle?.id === item.id;
    const config = EMIRATE_PLATE_CONFIGS[item.emirateCode] || EMIRATE_PLATE_CONFIGS.DXB;

    return (
      <View
        style={[
          styles.card,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDefault
              ? (driverPersona === 'pink' ? theme.pinkBorder : theme.mintBorder)
              : (isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)'),
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF',
          },
        ]}
      >
        <View style={styles.cardHeader}>
          {/* Authentic Real-World License Plate Graphic */}
          <View style={styles.plateWrapper}>
            <LicensePlateView
              emirateCode={item.emirateCode}
              plateCode={item.plateCode}
              plateNumber={item.plateNumber}
              scale={0.92}
            />
          </View>

          {/* Vehicle Metadata & Actions */}
          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehicleTitle, { color: theme.textPrimary }]}>
              {item.displayName}
            </Text>
            <Text style={[styles.vehicleSubtitle, { color: theme.textSecondary }]}>
              {config.nameEn} ({config.nameAr}) • {config.codeLabel} {item.plateCode}
            </Text>

            {isDefault ? (
              <View style={[styles.defaultBadge, { backgroundColor: theme.mintPastel }]}>
                <Ionicons name="checkmark-circle" size={14} color={theme.mintPrimary} />
                <Text style={[styles.defaultBadgeText, { color: theme.mintPrimary }]}>
                  Default Vehicle
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setDefaultVehicle(item.id)}
                style={[styles.makeDefaultButton, { borderColor: theme.borderDefault }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.makeDefaultText, { color: theme.textSecondary }]}>
                  Set as Default
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {vehicles.length > 1 && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => {
              Alert.alert(
                'Delete Vehicle',
                `Are you sure you want to remove ${item.displayName}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteVehicle(item.id),
                  },
                ]
              );
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={17} color={theme.rosePrimary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.canvas, paddingTop: insets.top + 12 }]}>
      {/* Screen Header with unclipped + button */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>My Vehicles</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Configure license plates for 1-tap SMS & WhatsApp parking
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            shadow3D,
            { backgroundColor: driverPersona === 'pink' ? theme.pinkPrimary : theme.mintPrimary },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicleItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surfaceSecondary }]}>
              <Ionicons name="car-outline" size={36} color={theme.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Vehicles Added
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Tap the "+" button above to add your vehicle license plate.
            </Text>
          </View>
        }
      />

      {/* Add Vehicle Modal with Live Plate Preview */}
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
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add New Vehicle</Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setModalVisible(false);
                }}
                style={[styles.modalCloseButton, { backgroundColor: theme.surfaceSecondary }]}
              >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Live Interactive License Plate Preview */}
              <View style={[styles.previewContainer, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.previewLabel, { color: theme.textTertiary }]}>
                  REAL-TIME PLATE PREVIEW
                </Text>
                <LicensePlateView
                  emirateCode={emirateCode}
                  plateCode={plateCode}
                  plateNumber={plateNumber}
                  scale={1.15}
                />
              </View>

              {/* 1. Emirate Selector (All 7 Emirates) */}
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                Emirate
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.emirateScrollRow}
              >
                {ALL_EMIRATES.map((em) => {
                  const isSelected = emirateCode === em;
                  const cfg = EMIRATE_PLATE_CONFIGS[em];
                  return (
                    <TouchableOpacity
                      key={em}
                      onPress={() => handleSelectEmirate(em)}
                      style={[
                        styles.emirateChip,
                        {
                          backgroundColor: isSelected ? theme.mintPrimary : theme.surfaceSecondary,
                          borderColor: isSelected ? theme.mintPrimary : theme.borderDefault,
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.emirateChipText,
                          {
                            color: isSelected ? '#FFFFFF' : theme.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {cfg.nameEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 2. Plate Code (with pattern guidance & quick-select pills) */}
              <View style={styles.plateInputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                    {currentConfig.codeLabel}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.borderDefault,
                        color: theme.textPrimary,
                      },
                    ]}
                    value={plateCode}
                    onChangeText={(val) => setPlateCode(val.toUpperCase())}
                    placeholder={currentConfig.codePlaceholder}
                    placeholderTextColor={theme.textTertiary}
                    autoCapitalize="characters"
                    maxLength={currentConfig.codeType === 'number' ? 2 : 2}
                    keyboardType={currentConfig.codeType === 'number' ? 'numeric' : 'default'}
                    returnKeyType="next"
                  />
                </View>

                <View style={{ flex: 1.8, marginLeft: 12 }}>
                  <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                    Plate Number (1–5 Digits)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.borderDefault,
                        color: theme.textPrimary,
                      },
                    ]}
                    value={plateNumber}
                    onChangeText={(val) => setPlateNumber(val.replace(/\D/g, ''))}
                    placeholder="e.g. 12345"
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="numeric"
                    maxLength={5}
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Quick-Select Code Pills for this Emirate */}
              <View style={styles.quickCodeContainer}>
                <Text style={[styles.quickCodeLabel, { color: theme.textTertiary }]}>
                  {currentConfig.description}:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickCodeRow}>
                  {currentConfig.allowedCodes.slice(0, 10).map((code) => {
                    const isCodeSelected = plateCode.toUpperCase() === code;
                    return (
                      <TouchableOpacity
                        key={code}
                        onPress={() => setPlateCode(code)}
                        style={[
                          styles.quickCodePill,
                          {
                            backgroundColor: isCodeSelected ? theme.mintPastel : theme.surfaceSecondary,
                            borderColor: isCodeSelected ? theme.mintPrimary : theme.borderDefault,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.quickCodePillText,
                            {
                              color: isCodeSelected ? theme.mintPrimary : theme.textSecondary,
                              fontWeight: isCodeSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {code}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 3. Display Name */}
              <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 12 }]}>
                Vehicle Nickname (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.borderDefault,
                    color: theme.textPrimary,
                  },
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. My White Lexus / Daily Car"
                placeholderTextColor={theme.textTertiary}
                returnKeyType="done"
              />

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.mintPrimary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Save Vehicle</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    paddingBottom: 14,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    marginLeft: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateWrapper: {
    marginRight: 14,
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  vehicleSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  makeDefaultButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  makeDefaultText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ─── Modal Styles ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  emirateScrollRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  emirateChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  emirateChipText: {
    fontSize: 13,
  },
  plateInputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
  },
  quickCodeContainer: {
    marginBottom: 6,
  },
  quickCodeLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  quickCodeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickCodePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickCodePillText: {
    fontSize: 12,
  },
  saveButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
