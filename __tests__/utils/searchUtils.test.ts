import { filterAndRankZones } from '../../src/utils/searchUtils';
import { SEED_PARKING_ZONES } from '../../src/database/seedData';

describe('searchUtils - filterAndRankZones', () => {
  test('matches zone by exact zone code and ranks it first', () => {
    const results = filterAndRankZones(SEED_PARKING_ZONES, '626M');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].zone.zoneCode).toBe('626M');
    expect(results[0].zone.areaNameEn).toBe('Nadd Hessa');
  });

  test('matches zone by partial zone code (e.g. "318")', () => {
    const results = filterAndRankZones(SEED_PARKING_ZONES, '318');
    expect(results.length).toBeGreaterThan(0);
    const codes = results.map((r) => r.zone.zoneCode);
    expect(codes).toContain('318C');
    expect(codes).toContain('318A');
  });

  test('matches Sharjah Zone 5566 by code and by area name', () => {
    const resultsByCode = filterAndRankZones(SEED_PARKING_ZONES, '5566');
    expect(resultsByCode.length).toBeGreaterThan(0);
    expect(resultsByCode[0].zone.zoneCode).toBe('5566');
    expect(resultsByCode[0].zone.areaNameEn).toBe('Al Majaz Waterfront');

    const resultsByName = filterAndRankZones(SEED_PARKING_ZONES, 'Majaz');
    expect(resultsByName.length).toBeGreaterThan(0);
    expect(resultsByName[0].zone.zoneCode).toBe('5566');
  });

  test('matches zone by Arabic area name (e.g. "ند حصة")', () => {
    const results = filterAndRankZones(SEED_PARKING_ZONES, 'ند حصة');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].zone.zoneCode).toBe('626M');
  });

  test('filters zones by specific Emirate (SHJ, AUH, DXB)', () => {
    const shjResults = filterAndRankZones(SEED_PARKING_ZONES, '', 'SHJ');
    expect(shjResults.length).toBe(1);
    expect(shjResults[0].zone.emirateId).toBe('SHJ');

    const auhResults = filterAndRankZones(SEED_PARKING_ZONES, '', 'AUH');
    expect(auhResults.length).toBe(1);
    expect(auhResults[0].zone.emirateId).toBe('AUH');

    const dxbResults = filterAndRankZones(SEED_PARKING_ZONES, '', 'DXB');
    expect(dxbResults.length).toBe(147);
  });

  test('returns empty array when query has no matching zones', () => {
    const results = filterAndRankZones(SEED_PARKING_ZONES, 'NonExistentZoneXYZ999');
    expect(results.length).toBe(0);
  });

  test('calculates distances when user GPS location is supplied', () => {
    // Al Karama location
    const karamaGPS = { latitude: 25.242, longitude: 55.303 };
    const results = filterAndRankZones(SEED_PARKING_ZONES, '', 'ALL', karamaGPS);
    expect(results[0].distanceMeters).toBeDefined();
    expect(results[0].distanceMeters).not.toBeNull();
    // Closest zone should be in Al Karama area
    expect(results[0].distanceMeters).toBeLessThan(1000); // within 1km
  });
});
