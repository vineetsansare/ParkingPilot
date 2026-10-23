import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
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
  const detectedZone = useParkingStore((state) => state.detectedZone);

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

        // Check if inside zone
        const matched = findZoneByCoordinate(point);
        if (matched) {
          setSelectedZone(matched);
        }

        mapRef.current?.animateToRegion({
          ...point,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
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
        {/* Render all parking zones as highlighted polygons */}
        {zones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          return (
            <Polygon
              key={zone.id}
              coordinates={zone.polygonCoords}
              fillColor={
                isSelected
                  ? 'rgba(37, 99, 235, 0.5)' // highlighted selection
                  : zone.fillColor || 'rgba(76, 175, 80, 0.35)'
              }
              strokeColor={isSelected ? '#1D4ED8' : zone.strokeColor || '#2E7D32'}
              strokeWidth={isSelected ? 3 : 1.5}
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
                <Ionicons name="car" size={16} color="#FFFFFF" />
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Top Floating Controls */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
        {/* Active Session Warning / Countdown */}
        <ActiveSessionBanner />

        {/* Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.appNameContainer}>
            <Text style={styles.appTitle}>🅿️ Parking Ticket Buddy</Text>
            <Text style={styles.appSubtitle}>
              {selectedZone
                ? `Exploring Zone ${selectedZone.zoneCode}`
                : 'Pan map to explore zones'}
            </Text>
          </View>

          <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
            <Ionicons name="locate" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Quick Zone Shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={[
              styles.shortcutChip,
              selectedZone?.zoneCode === '318C' && styles.shortcutChipActive,
            ]}
            onPress={() => {
              const karama = zones.find((z) => z.zoneCode === '318C');
              if (karama) handleFocusZone(karama);
            }}
          >
            <Text
              style={[
                styles.shortcutText,
                selectedZone?.zoneCode === '318C' && styles.shortcutTextActive,
              ]}
            >
              📍 Al Karama (318C)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shortcutChip,
              selectedZone?.zoneCode === '318A' && styles.shortcutChipActive,
            ]}
            onPress={() => {
              const commercial = zones.find((z) => z.zoneCode === '318A');
              if (commercial) handleFocusZone(commercial);
            }}
          >
            <Text
              style={[
                styles.shortcutText,
                selectedZone?.zoneCode === '318A' && styles.shortcutTextActive,
              ]}
            >
              🏢 Karama Mkt (318A)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shortcutChip,
              selectedZone?.zoneCode === '346A' && styles.shortcutChipActive,
            ]}
            onPress={() => {
              const bbay = zones.find((z) => z.zoneCode === '346A');
              if (bbay) handleFocusZone(bbay);
            }}
          >
            <Text
              style={[
                styles.shortcutText,
                selectedZone?.zoneCode === '346A' && styles.shortcutTextActive,
              ]}
            >
              🌆 Business Bay
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Target Indicator (Crosshairs when panning) */}
      <View style={styles.centerTarget} pointerEvents="none">
        <View style={styles.targetDot} />
      </View>

      {/* Bottom Zone Details Card (When a zone is selected or detected) */}
      {selectedZone && (
        <View style={[styles.bottomCardWrapper, { paddingBottom: insets.bottom + 8 }]}>
          <ZoneDetailCard
            zone={selectedZone}
            onClose={() => setSelectedZone(null)}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  appNameContainer: {
    flex: 1,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  recenterButton: {
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  shortcutsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  shortcutChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  shortcutChipActive: {
    backgroundColor: '#2563EB',
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  shortcutTextActive: {
    color: '#FFFFFF',
  },
  userPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPinPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  userPinCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
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
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
});
