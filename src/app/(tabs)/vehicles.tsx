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

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
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

  const handleSave = () => {
    if (!plateNumber.trim()) {
      Alert.alert('Required', 'Please enter your license plate number.');
      return;
    }

    addVehicle({
      emirateCode,
      plateCode: plateCode.trim().toUpperCase(),
      plateNumber: plateNumber.trim(),
      displayName:
        displayName.trim() ||
        `${UAE_EMIRATES[emirateCode].nameEn} Plate ${plateCode}-${plateNumber}`,
      isDefault: vehicles.length === 0,
    });

    setPlateNumber('');
    setDisplayName('');
    Keyboard.dismiss();
    setModalVisible(false);
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => {
    const isDefault = defaultVehicle?.id === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {/* Dubai-style License Plate Graphic */}
          <View style={styles.plateContainer}>
            <View style={styles.plateHeader}>
              <Text style={styles.plateEmirateText}>
                {UAE_EMIRATES[item.emirateCode].nameEn.toUpperCase()}
              </Text>
            </View>
            <View style={styles.plateBody}>
              <Text style={styles.plateCodeText}>{item.plateCode}</Text>
              <Text style={styles.plateNumberText}>{item.plateNumber}</Text>
            </View>
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleTitle}>{item.displayName}</Text>
            <Text style={styles.vehicleSubtitle}>
              {UAE_EMIRATES[item.emirateCode].nameEn} • Code {item.plateCode}
            </Text>

            {isDefault ? (
              <View style={styles.defaultBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text style={styles.defaultBadgeText}>Default Vehicle</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setDefaultVehicle(item.id)}
                style={styles.makeDefaultButton}
              >
                <Text style={styles.makeDefaultText}>Set as Default</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {vehicles.length > 1 && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Delete Vehicle',
                'Are you sure you want to delete this vehicle?',
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
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Screen Header with unclipped + button */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>My Vehicles</Text>
          <Text style={styles.subtitle}>
            Configure plates for auto-SMS & WhatsApp
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      />

      {/* Add Vehicle Modal with KeyboardAvoidingView */}
      <Modal visible={modalVisible} animationType="slide" transparent>
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
              { paddingBottom: Math.max(insets.bottom, 20) + 12 },
            ]}
          >
            <View style={styles.dragHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Vehicle</Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setModalVisible(false);
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Emirate Selector */}
              <Text style={styles.inputLabel}>Emirate</Text>
              <View style={styles.emirateRow}>
                {(['DXB', 'AUH', 'SHJ', 'AJM'] as EmirateCode[]).map((em) => (
                  <TouchableOpacity
                    key={em}
                    onPress={() => setEmirateCode(em)}
                    style={[
                      styles.emirateChip,
                      emirateCode === em && styles.emirateChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.emirateChipText,
                        emirateCode === em && styles.emirateChipTextActive,
                      ]}
                    >
                      {UAE_EMIRATES[em].nameEn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Plate Code & Number */}
              <View style={styles.plateInputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Plate Code</Text>
                  <TextInput
                    style={styles.input}
                    value={plateCode}
                    onChangeText={setPlateCode}
                    placeholder="A"
                    autoCapitalize="characters"
                    maxLength={4}
                    returnKeyType="next"
                  />
                </View>

                <View style={{ flex: 2, marginLeft: 12 }}>
                  <Text style={styles.inputLabel}>Plate Number</Text>
                  <TextInput
                    style={styles.input}
                    value={plateNumber}
                    onChangeText={setPlateNumber}
                    placeholder="12345"
                    keyboardType="numeric"
                    maxLength={6}
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Display Name */}
              <Text style={styles.inputLabel}>Vehicle Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. My Lexus / Daily Driver"
                returnKeyType="done"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  headerTextGroup: {
    flex: 1,
    marginRight: 16,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateContainer: {
    width: 90,
    height: 55,
    borderWidth: 2,
    borderColor: '#0F172A',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  plateHeader: {
    backgroundColor: '#0F172A',
    paddingVertical: 2,
    alignItems: 'center',
  },
  plateEmirateText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  plateBody: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  plateCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  plateNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 14,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  vehicleSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
    marginLeft: 4,
  },
  makeDefaultButton: {
    marginTop: 6,
  },
  makeDefaultText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdropDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emirateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  emirateChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  emirateChipActive: {
    backgroundColor: '#2563EB',
  },
  emirateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  emirateChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  plateInputRow: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
