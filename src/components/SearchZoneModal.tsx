import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ParkingZone, LatLng, EmirateCode } from '../types/parking';
import { useAppTheme } from '../theme/ThemeContext';
import { filterAndRankZones, FilterEmirate } from '../utils/searchUtils';

interface SearchZoneModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectZone: (zone: ParkingZone) => void;
  zones: ParkingZone[];
  currentLocation: LatLng | null;
}

export const SearchZoneModal: React.FC<SearchZoneModalProps> = ({
  visible,
  onClose,
  onSelectZone,
  zones,
  currentLocation,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark, shadow3D, driverPersona, personaColor } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState<FilterEmirate>('ALL');
  const inputRef = useRef<any>(null);

  // Automatically focus text input and open keyboard when modal becomes visible
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
      setSelectedEmirate('ALL');
    }
  }, [visible]);

  // Filter and rank search results
  const filteredResults = useMemo(() => {
    return filterAndRankZones(zones, searchQuery, selectedEmirate, currentLocation);
  }, [zones, searchQuery, selectedEmirate, currentLocation]);

  const formatDistance = (meters: number | null): string | null => {
    if (meters === null) return null;
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const getEmirateColor = (emirateId: EmirateCode) => {
    switch (emirateId) {
      case 'DXB':
        return { bg: theme.mintPastel, text: theme.mintPrimary, border: theme.mintBorder };
      case 'SHJ':
        return { bg: theme.lavenderPastel, text: theme.lavenderPrimary, border: theme.lavenderBorder };
      case 'AUH':
        return { bg: theme.skyPastel, text: theme.skyPrimary, border: theme.skyBorder };
      default:
        return { bg: theme.surfaceSecondary, text: theme.textSecondary, border: theme.borderDefault };
    }
  };

  const renderItem = ({ item }: { item: { zone: ParkingZone; distanceMeters: number | null } }) => {
    const { zone, distanceMeters } = item;
    const colors = getEmirateColor(zone.emirateId);
    const distanceStr = formatDistance(distanceMeters);

    return (
      <TouchableOpacity
        style={[
          styles.resultCard,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF',
          },
        ]}
        onPress={() => onSelectZone(zone)}
        activeOpacity={0.7}
      >
        {/* Squircle Zone Code Badge */}
        <View
          style={[
            styles.zoneBadgeContainer,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.zoneBadgeCode, { color: colors.text }]}>
            {zone.zoneCode}
          </Text>
        </View>

        {/* Details Container */}
        <View style={styles.zoneDetailsContainer}>
          <View style={styles.zoneTitleRow}>
            <Text
              style={[styles.zoneTitleText, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {zone.areaNameEn}
            </Text>
            {zone.areaNameAr ? (
              <Text style={[styles.zoneArabicText, { color: theme.textTertiary }]} numberOfLines={1}>
                {zone.areaNameAr}
              </Text>
            ) : null}
          </View>

          <View style={styles.zoneSubtitleRow}>
            <View
              style={[
                styles.emiratePill,
                { backgroundColor: colors.bg, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.emiratePillText, { color: colors.text }]}>
                {zone.emirateId}
              </Text>
            </View>

            <Text style={[styles.categoryText, { color: theme.textSecondary }]}>
              Zone {zone.zoneCategory} • AED {zone.tariffOffpeakHourly.toFixed(2)}/hr
            </Text>

            {distanceStr ? (
              <View style={styles.distanceBadge}>
                <Ionicons name="location-outline" size={11} color={theme.textTertiary} />
                <Text style={[styles.distanceText, { color: theme.textTertiary }]}>
                  {distanceStr}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Forward Arrow */}
        <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: theme.canvas }]}
      >
        {/* Top Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 16,
              borderBottomColor: theme.divider,
              backgroundColor: theme.surfacePrimary,
            },
          ]}
        >
          <View style={styles.searchBarRow}>
            {/* Search Input Container */}
            <View
              style={[
                styles.searchInputContainer,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.borderDefault,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={18}
                color={theme.mintPrimary}
                style={styles.searchIcon}
              />
              <TextInput
                ref={inputRef}
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder="Search zone (e.g. 318C) or area name..."
                placeholderTextColor={theme.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && Platform.OS !== 'ios' && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity onPress={onClose} style={styles.cancelButton} activeOpacity={0.7}>
              <Text style={[styles.cancelButtonText, { color: theme.mintPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          {/* Emirate Filter Chips */}
          <View style={styles.filterRow}>
            {(['ALL', 'DXB', 'SHJ', 'AUH'] as FilterEmirate[]).map((em) => {
              const isSelected = selectedEmirate === em;
              const label =
                em === 'ALL'
                  ? `All Zones (${zones.length})`
                  : em === 'DXB'
                  ? 'Dubai'
                  : em === 'SHJ'
                  ? 'Sharjah'
                  : 'Abu Dhabi';

              return (
                <TouchableOpacity
                  key={em}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? theme.mintPrimary : theme.surfaceSecondary,
                      borderColor: isSelected ? theme.mintPrimary : theme.borderDefault,
                    },
                  ]}
                  onPress={() => setSelectedEmirate(em)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Results List */}
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.zone.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            searchQuery.trim() === '' ? (
              <View style={styles.listHeaderContainer}>
                <Text style={[styles.listHeaderTitle, { color: theme.textSecondary }]}>
                  {selectedEmirate === 'ALL'
                    ? 'POPULAR & NEARBY PARKING ZONES'
                    : `${selectedEmirate} PARKING ZONES`}
                </Text>
              </View>
            ) : (
              <View style={styles.listHeaderContainer}>
                <Text style={[styles.listHeaderTitle, { color: theme.textTertiary }]}>
                  {filteredResults.length} {filteredResults.length === 1 ? 'ZONE' : 'ZONES'} FOUND
                </Text>
              </View>
            )
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[styles.emptyIconCircle, { backgroundColor: theme.surfaceSecondary }]}
              >
                <Ionicons name="search-outline" size={32} color={theme.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                No Zones Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                No parking zone matched "{searchQuery}". Try searching by code like "318C", "626M", "5566", or area name like "Karama" or "Majaz".
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  listHeaderContainer: {
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 2,
  },
  listHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  zoneBadgeContainer: {
    width: 48,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneBadgeCode: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  zoneDetailsContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  zoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  zoneTitleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  zoneArabicText: {
    fontSize: 13,
    fontWeight: '500',
  },
  zoneSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
    flexWrap: 'wrap',
  },
  emiratePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 0.5,
  },
  emiratePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
