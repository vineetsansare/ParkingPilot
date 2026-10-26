import { findZoneByCoordinate, findNearbyZones } from '../../src/services/zoneLookupService';
import { LatLng } from '../../src/types/parking';

describe('zoneLookupService', () => {
  test('accurately identifies Zone 318C in Al Karama from user location', () => {
    // Al Karama residential area (Zone 318C)
    const userLocation: LatLng = { latitude: 25.2420, longitude: 55.3030 };
    const matchedZone = findZoneByCoordinate(userLocation);
    expect(matchedZone).toBeDefined();
    expect(matchedZone?.zoneCode).toBe('318C');
    expect(matchedZone?.areaNameEn).toContain('Al Karama');
  });

  test('accurately identifies Zone 318A in Al Karama commercial area', () => {
    // Al Karama commercial center (Zone 318A)
    const userLocation: LatLng = { latitude: 25.2500, longitude: 55.3020 };
    const matchedZone = findZoneByCoordinate(userLocation);
    expect(matchedZone).toBeDefined();
    expect(matchedZone?.zoneCode).toBe('318A');
  });

  test('accurately identifies Zone 626M in Nadd Hessa (from Parkin app)', () => {
    // Verified centroid of Nadd Hessa (Zone 626M) from Dubai Municipality GIS
    const userLocation: LatLng = { latitude: 25.1285, longitude: 55.3890 };
    const matchedZone = findZoneByCoordinate(userLocation);
    expect(matchedZone).toBeDefined();
    expect(matchedZone?.zoneCode).toBe('626M');
    expect(matchedZone?.areaNameEn).toBe('Nadd Hessa');
  });

  test('returns null when parked in the desert / non-parking area', () => {
    const desertLocation: LatLng = { latitude: 24.9000, longitude: 55.0000 };
    const matchedZone = findZoneByCoordinate(desertLocation);
    expect(matchedZone).toBeNull();
  });

  test('finds nearby alternative zones when near boundary', () => {
    const nearBoundary: LatLng = { latitude: 25.2460, longitude: 55.3015 };
    const nearby = findNearbyZones(nearBoundary, 500);
    expect(nearby.length).toBeGreaterThan(0);
    const codes = nearby.map(z => z.zoneCode);
    expect(codes).toContain('318C');
  });
});
