import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, { Polygon, Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useParkingStore } from '../../store/parkingStore';
import { getAllZones, findZoneByCoordinate } from '../../services/zoneLookupService';
import { ParkingDetectionService } from '../../services/parkingDetectionService';
import { ZoneDetailCard } from '../../components/ZoneDetailCard';
import { ActiveSessionBanner } from '../../components/ActiveSessionBanner';
import { SearchZoneModal } from '../../components/SearchZoneModal';
import { useAppTheme } from '../../theme/ThemeContext';
import { LatLng, ParkingZone } from '../../types/parking';
import { calculatePolygonCentroid } from '../../utils/geoUtils';

const { width, height } = Dimensions.get('window');

// Default initial region centered on Al Karama, Dubai (Zone 318C)
const INITIAL_REGION: Region = {
  latitude: 25.2420,
  longitude: 55.3030,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { theme, isDark, shadow3D, personaColor, driverPersona } = useAppTheme();

  const zonesRevision = useParkingStore((state) => state.zonesRevision);
  const zones = useMemo(() => getAllZones(), [zonesRevision]);
  const currentLocation = useParkingStore((state) => state.currentLocation);
  const setCurrentLocation = useParkingStore((state) => state.setCurrentLocation);
  const selectedZone = useParkingStore((state) => state.selectedZone);
  const setSelectedZone = useParkingStore((state) => state.setSelectedZone);

  const [isCardExpanded, setIsCardExpanded] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'standard' | 'hybrid'>('standard');
  const [mapCenter, setMapCenter] = useState<LatLng>({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude,
  });
  const [zoneAtReticle, setZoneAtReticle] = useState<ParkingZone | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync zone under given coordinate
  const checkZoneAtCoordinate = (point: LatLng) => {
    const matched = findZoneByCoordinate(point);
    setZoneAtReticle(matched);
    if (matched) {
      if (matched.id !== selectedZone?.id) {
        setSelectedZone(matched);
      }
    } else {
      if (selectedZone) {
        setSelectedZone(null);
      }
    }
  };

  // Fetch actual GPS location on load
  useEffect(() => {
    const fetchLocation = async () => {
      const loc = await ParkingDetectionService.getCurrentLocation();
      if (loc) {
        const point: LatLng = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCurrentLocation(point);
        checkZoneAtCoordinate(point);

        mapRef.current?.animateToRegion({
          ...point,
          latitudeDelta: 0.018,
          longitudeDelta: 0.018,
        });
      } else {
        checkZoneAtCoordinate(mapCenter);
      }
    };

    fetchLocation();
  }, []);

  // When user pans map in real-time (debounced at 60ms for smooth 60fps tracking)
  const handleRegionChange = (region: Region) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      checkZoneAtCoordinate({
        latitude: region.latitude,
        longitude: region.longitude,
      });
    }, 60);
  };

  // When user finishes pan / momentum comes to complete stop
  const handleRegionChangeComplete = (region: Region) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const centerPoint: LatLng = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    setMapCenter(centerPoint);
    checkZoneAtCoordinate(centerPoint);
  };

  const handleRecenter = () => {
    if (currentLocation) {
      mapRef.current?.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
      checkZoneAtCoordinate(currentLocation);
    }
  };

  const handleFocusZone = (zone: ParkingZone) => {
    setSelectedZone(zone);
    setZoneAtReticle(zone);
    if (zone.polygonCoords.length > 0) {
      const centroidLat =
        zone.polygonCoords.reduce((sum, p) => sum + p.latitude, 0) /
        zone.polygonCoords.length;
      const centroidLng =
        zone.polygonCoords.reduce((sum, p) => sum + p.longitude, 0) /
        zone.polygonCoords.length;

      mapRef.current?.animateToRegion({
        latitude: centroidLat,
        longitude: centroidLng,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      });
    }
  };

  const handleSelectZoneFromSearch = (zone: ParkingZone) => {
    setIsSearchOpen(false);
    setSelectedZone(zone);
    setZoneAtReticle(zone);
    setIsCardExpanded(false);

    const centroid = calculatePolygonCentroid(zone.polygonCoords);
    setMapCenter(centroid);

    mapRef.current?.animateToRegion(
      {
        latitude: centroid.latitude,
        longitude: centroid.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      600
    );
  };

  return (
    <View style={styles.container}>
      {/* Full screen Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        mapType={mapType}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={false}
        showsCompass={false}
      >
        {/* Render all parking zones as highlighted polygons with crisp borders */}
        {zones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          return (
            <Polygon
              key={zone.id}
              coordinates={zone.polygonCoords}
              fillColor={
                isSelected
                  ? 'rgba(168, 85, 247, 0.32)' // Parkin signature purple highlight
                  : zone.fillColor || 'rgba(13, 148, 136, 0.22)'
              }
              strokeColor={isSelected ? '#7E22CE' : zone.strokeColor || '#0F766E'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              tappable
              onPress={() => handleFocusZone(zone)}
            />
          );
        })}

        {/* User Location Pin */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="My Parked Car"
            description="Your current GPS location"
          >
            <View style={styles.userPinContainer}>
              <View style={styles.userPinPulse} />
              <View style={styles.userPinCore}>
                <Ionicons name="navigate" size={14} color="#FFFFFF" />
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Top Floating Area: Active Banner + Horizontally Scrollable Zone Pills */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + 6 }]}>
        {/* Active Session Warning / Countdown if any */}
        <ActiveSessionBanner />

        {/* Horizontally Scrollable Pills Describing Parking Areas Nearby */}
        <View style={styles.shortcutsScrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shortcutsRow}
          >
            {/* 1-Tap Search Trigger Chip */}
            <TouchableOpacity
              style={[
                styles.searchShortcutChip,
                {
                  backgroundColor: theme.surfacePrimary,
                  borderColor: theme.mintPrimary,
                },
              ]}
              onPress={() => setIsSearchOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={14} color={theme.mintPrimary} style={{ marginRight: 5 }} />
              <Text style={[styles.searchShortcutText, { color: theme.mintPrimary }]}>
                Search
              </Text>
            </TouchableOpacity>

            {zones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              return (
                <TouchableOpacity
                  key={zone.id}
                  style={[
                    styles.shortcutChip,
                    isSelected && styles.shortcutChipActive,
                  ]}
                  onPress={() => handleFocusZone(zone)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.shortcutText,
                      isSelected && styles.shortcutTextActive,
                    ]}
                  >
                    📍 {zone.areaNameEn} ({zone.zoneCode})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Floating Current Location Button on BOTTOM-LEFT Corner */}
      <TouchableOpacity
        style={[
          styles.bottomLeftLocationButton,
          { bottom: isCardExpanded ? 24 : 76 },
        ]}
        onPress={handleRecenter}
        activeOpacity={0.85}
      >
        <Ionicons name="locate" size={22} color="#0F172A" />
      </TouchableOpacity>

      {/* Floating Search Button on BOTTOM-RIGHT Corner */}
      <TouchableOpacity
        style={[
          styles.bottomRightSearchButton,
          shadow3D,
          {
            bottom: isCardExpanded ? 24 : 76,
            backgroundColor: theme.surfacePrimary,
            borderColor: driverPersona === 'pink' ? theme.pinkBorder : theme.mintBorder,
          },
        ]}
        onPress={() => setIsSearchOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons
          name="search"
          size={22}
          color={driverPersona === 'pink' ? theme.pinkPrimary : theme.mintPrimary}
        />
      </TouchableOpacity>

      {/* Center Reticle / Pin with Parkin-Style Floating Tooltip */}
      <View style={styles.centerPinContainer} pointerEvents="none">
        {/* Floating Tooltip Pill attached directly above the pin */}
        {zoneAtReticle ? (
          <View style={styles.centerFloatingTooltip}>
            <View style={styles.parkinTooltipPill}>
              <Ionicons name="car" size={13} color="#FFFFFF" />
              <Text style={styles.parkinTooltipText}>Parking zone</Text>
              <View style={styles.parkinTooltipBadge}>
                <Text style={styles.parkinTooltipBadgeText}>
                  {zoneAtReticle.zoneCode}
                </Text>
              </View>
              <Text style={styles.parkinTooltipText}>detected</Text>
            </View>

            <View style={styles.parkinPricePill}>
              <Text style={styles.parkinPriceText}>
                AED {zoneAtReticle.tariffOffpeakHourly.toFixed(2)}/hr
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.centerFloatingTooltip}>
            <View style={styles.unzonedTooltipPill}>
              <Ionicons name="information-circle-outline" size={12} color="#64748B" />
              <Text style={styles.unzonedTooltipText}>Non-Paid / Free Area</Text>
            </View>
          </View>
        )}

        {/* Prominent Center Pin: 38px tall with needle pointing to exact map center */}
        <View style={styles.pinWrapper}>
          <View style={styles.pinHead}>
            <View style={styles.pinIconP}>
              <Text style={styles.pinLetter}>P</Text>
            </View>
          </View>
          <View style={styles.pinStem} />
          <View style={styles.pinDotAnchor} />
        </View>
      </View>

      {/* Floating Tactical Map Controls on TOP-RIGHT (Stitch Spec) */}
      <View style={[styles.floatingToolStack, { top: insets.top + 72 }]}>
        <TouchableOpacity
          style={[styles.floatingToolBtn, shadow3D, { backgroundColor: theme.surfacePrimary }]}
          onPress={() => mapRef.current?.animateCamera({ heading: 0, pitch: 0 })}
          activeOpacity={0.8}
        >
          <Ionicons name="compass-outline" size={22} color={theme.rosePrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingToolBtn, shadow3D, { backgroundColor: theme.surfacePrimary }]}
          onPress={() => setMapType((prev) => (prev === 'standard' ? 'hybrid' : 'standard'))}
          activeOpacity={0.8}
        >
          <Ionicons
            name={mapType === 'hybrid' ? 'map' : 'layers-outline'}
            size={20}
            color={theme.mintPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Stitch Detection & Verification Safeguard Banner */}
      {zoneAtReticle && !isCardExpanded && (
        <View
          style={[
            styles.detectionBannerWrapper,
            shadow3D,
            { bottom: selectedZone ? 82 : 24 },
          ]}
        >
          <View style={styles.detectionBannerInner}>
            <View style={styles.detectionBannerLeft}>
              <Ionicons name="location" size={18} color="#85F8C4" style={{ marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detectionBannerTitle} numberOfLines={1}>
                  Detected: {zoneAtReticle.zoneCode} ({zoneAtReticle.areaNameEn})
                </Text>
                <Text style={styles.detectionBannerSubtitle}>
                  Please verify zone on orange street sign
                </Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#002114" style={{ marginRight: 3 }} />
              <Text style={styles.verifiedBadgeText}>Verified</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Zone Details Card (Sits just above the bottom tab bar) */}
      {selectedZone && (
        <View
          style={[
            styles.bottomCardWrapper,
            { paddingBottom: isCardExpanded ? insets.bottom : insets.bottom + 4 },
          ]}
        >
          <ZoneDetailCard
            zone={selectedZone}
            isExpanded={isCardExpanded}
            onToggleExpand={() => setIsCardExpanded((prev) => !prev)}
            onClose={() => {
              setSelectedZone(null);
              setIsCardExpanded(false);
            }}
          />
        </View>
      )}
      {/* Search Zone Modal */}
      <SearchZoneModal
        visible={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectZone={handleSelectZoneFromSearch}
        zones={zones}
        currentLocation={currentLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  map: {
    width,
    height,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  shortcutsScrollWrapper: {
    marginTop: 4,
  },
  shortcutsRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  shortcutChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shortcutChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  shortcutTextActive: {
    color: '#FFFFFF',
  },

  // ─── Bottom-Left Location Button ───
  bottomLeftLocationButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // ─── Bottom-Right Search Button ───
  bottomRightSearchButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 15,
    borderWidth: 1.5,
  },

  searchShortcutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1.5,
  },
  searchShortcutText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // ─── Parkin-Style Floating Marker ───
  parkinMarkerWrapper: {
    alignItems: 'center',
  },
  parkinTooltipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 4,
  },
  parkinTooltipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  parkinTooltipBadge: {
    backgroundColor: '#00C49F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  parkinTooltipBadgeText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 10,
  },
  parkinPricePill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 4,
  },
  parkinPriceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  parkinPinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  parkinPinP: {
    color: '#0D9488',
    fontWeight: '900',
    fontSize: 16,
  },

  // ─── User Pin ───
  userPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPinPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(14, 165, 233, 0.25)',
  },
  userPinCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -39 }],
    width: 200,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 12,
  },
  centerFloatingTooltip: {
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  unzonedTooltipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  unzonedTooltipText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 39,
  },
  pinHead: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00C49F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  pinIconP: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLetter: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 14,
  },
  pinStem: {
    width: 3,
    height: 7,
    backgroundColor: '#00C49F',
    borderBottomLeftRadius: 1.5,
    borderBottomRightRadius: 1.5,
  },
  pinDotAnchor: {
    width: 6,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0F172A',
    opacity: 0.4,
    marginTop: 1,
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },

  // ─── Stitch Tactical Controls & Safeguard Banner ───
  floatingToolStack: {
    position: 'absolute',
    right: 14,
    gap: 8,
    zIndex: 15,
  },
  floatingToolBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  detectionBannerWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 25,
  },
  detectionBannerInner: {
    backgroundColor: '#131B2E',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  detectionBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  detectionBannerTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  detectionBannerSubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  verifiedBadge: {
    backgroundColor: '#85F8C4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadgeText: {
    color: '#002114',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
