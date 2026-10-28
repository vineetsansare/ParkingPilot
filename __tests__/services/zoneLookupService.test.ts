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

  test('accurately identifies Sharjah Zone 5566 at Al Majaz Waterfront', () => {
    // Al Majaz Waterfront fountain & promenade
    const userLocation: LatLng = { latitude: 25.3262, longitude: 55.3900 };
    const matchedZone = findZoneByCoordinate(userLocation);
    expect(matchedZone).toBeDefined();
    expect(matchedZone?.zoneCode).toBe('5566');
    expect(matchedZone?.emirateId).toBe('SHJ');
    expect(matchedZone?.areaNameEn).toBe('Al Majaz Waterfront');
  });

  test('accurately identifies Abu Dhabi Zone S at Corniche (Al Danah)', () => {
    const userLocation: LatLng = { latitude: 24.4920, longitude: 54.3550 };
    const matchedZone = findZoneByCoordinate(userLocation);
    expect(matchedZone).toBeDefined();
    expect(matchedZone?.zoneCode).toBe('S');
    expect(matchedZone?.emirateId).toBe('AUH');
  });

  test('returns null when parked in the middle of Khalid Lagoon (water)', () => {
    // Middle of Khalid Lagoon open water (no parking polygon intrusion)
    const lagoonWaterLocation: LatLng = { latitude: 25.3350, longitude: 55.3900 };
    const matchedZone = findZoneByCoordinate(lagoonWaterLocation);
    expect(matchedZone).toBeNull();
  });
});
