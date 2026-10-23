import { isPointInPolygon, calculateBoundingBox, getDistanceInMeters } from '../../src/utils/geoUtils';
import { LatLng } from '../../src/types/parking';

describe('geoUtils', () => {
  // Polygon of Al Karama (Sector 318 area)
  const alKaramaPolygon: LatLng[] = [
    { latitude: 25.2411, longitude: 55.2974 },
    { latitude: 25.2435, longitude: 55.3082 },
    { latitude: 25.2520, longitude: 55.3115 },
    { latitude: 25.2501, longitude: 55.3012 },
    { latitude: 25.2411, longitude: 55.2974 },
  ];

  test('isPointInPolygon returns true for point inside Al Karama', () => {
    const insidePoint: LatLng = { latitude: 25.2460, longitude: 55.3040 };
    expect(isPointInPolygon(insidePoint, alKaramaPolygon)).toBe(true);
  });

  test('isPointInPolygon returns false for point outside Al Karama (e.g. Dubai Mall)', () => {
    const outsidePoint: LatLng = { latitude: 25.1972, longitude: 55.2744 };
    expect(isPointInPolygon(outsidePoint, alKaramaPolygon)).toBe(false);
  });

  test('calculateBoundingBox computes correct min and max lat/lng', () => {
    const bbox = calculateBoundingBox(alKaramaPolygon);
    expect(bbox.minLat).toBeCloseTo(25.2411, 4);
    expect(bbox.maxLat).toBeCloseTo(25.2520, 4);
    expect(bbox.minLng).toBeCloseTo(55.2974, 4);
    expect(bbox.maxLng).toBeCloseTo(55.3115, 4);
  });

  test('getDistanceInMeters computes accurate distance between two nearby coordinates', () => {
    const p1: LatLng = { latitude: 25.2411, longitude: 55.2974 };
    const p2: LatLng = { latitude: 25.2420, longitude: 55.2980 };
    const distance = getDistanceInMeters(p1, p2);
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(150);
  });
});
