import React, { useState, useEffect, useRef } from 'react';
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
import { LatLng, ParkingZone } from '../../types/parking';

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

  const zones = getAllZones();
  const currentLocation = useParkingStore((state) => state.currentLocation);
  const setCurrentLocation = useParkingStore((state) => state.setCurrentLocation);
  const selectedZone = useParkingStore((state) => state.selectedZone);
  const setSelectedZone = useParkingStore((state) => state.setSelectedZone);

  const [isCardExpanded, setIsCardExpanded] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<LatLng>({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude,
  });

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

        const matched = findZoneByCoordinate(point);
        if (matched) {
          setSelectedZone(matched);
        }

        mapRef.current?.animateToRegion({
          ...point,
          latitudeDelta: 0.018,
          longitudeDelta: 0.018,
        });
      }
    };

    fetchLocation();
  }, []);

  // When user pans map and stops: detect which zone the center reticle is over
  const handleRegionChangeComplete = (region: Region) => {
    const centerPoint: LatLng = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    setMapCenter(centerPoint);

    const zoneAtCenter = findZoneByCoordinate(centerPoint);
    if (zoneAtCenter && zoneAtCenter.id !== selectedZone?.id) {
      setSelectedZone(zoneAtCenter);
    }
  };

  const handleRecenter = () => {
    if (currentLocation) {
      mapRef.current?.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
      const matched = findZoneByCoordinate(currentLocation);
      if (matched) setSelectedZone(matched);
    }
  };

  const handleFocusZone = (zone: ParkingZone) => {
    setSelectedZone(zone);
    if (zone.polygonCoords.length > 0) {
      mapRef.current?.animateToRegion({
        latitude: zone.polygonCoords[0].latitude,
        longitude: zone.polygonCoords[0].longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      });
    }
  };

  // Centroid coordinate for placing the Parkin-style floating marker
  const selectedZoneCenter = selectedZone && selectedZone.polygonCoords.length > 0
    ? {
        latitude:
          selectedZone.polygonCoords.reduce((sum, p) => sum + p.latitude, 0) /
          selectedZone.polygonCoords.length,
        longitude:
          selectedZone.polygonCoords.reduce((sum, p) => sum + p.longitude, 0) /
          selectedZone.polygonCoords.length,
      }
    : null;

  return (
    <View style={styles.container}>
      {/* Full screen Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
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

        {/* Parkin-Style Floating Tooltip & Zone Pin on Selected Zone */}
        {selectedZone && selectedZoneCenter && (
          <Marker
            coordinate={selectedZoneCenter}
            anchor={{ x: 0.5, y: 1.0 }}
            pointerEvents="none"
          >
            <View style={styles.parkinMarkerWrapper}>
              {/* Floating Tooltip Pill */}
              <View style={styles.parkinTooltipPill}>
                <Ionicons name="car" size={13} color="#FFFFFF" />
                <Text style={styles.parkinTooltipText}>Parking zone</Text>
                <View style={styles.parkinTooltipBadge}>
                  <Text style={styles.parkinTooltipBadgeText}>
                    {selectedZone.zoneCode}
                  </Text>
                </View>
                <Text style={styles.parkinTooltipText}>detected</Text>
              </View>

              {/* Price Pill */}
              <View style={styles.parkinPricePill}>
                <Text style={styles.parkinPriceText}>
                  AED {selectedZone.tariffOffpeakHourly.toFixed(2)}/hr
                </Text>
              </View>

              {/* Circular Parking Icon */}
              <View style={styles.parkinPinIcon}>
                <Text style={styles.parkinPinP}>P</Text>
              </View>
            </View>
          </Marker>
        )}

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

      {/* Center Target Indicator (Crosshairs when panning) */}
      <View style={styles.centerTarget} pointerEvents="none">
        <View style={styles.targetDot} />
      </View>

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
  centerTarget: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -6,
    marginTop: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0D9488',
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
});
