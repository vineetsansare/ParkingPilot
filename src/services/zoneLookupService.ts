import { LatLng, ParkingZone } from '../types/parking';
import { isPointInPolygon, calculateBoundingBox, getDistanceInMeters } from '../utils/geoUtils';
import { SEED_PARKING_ZONES } from '../database/seedData';

// In-memory zone cache with pre-calculated bounding boxes for fast sub-millisecond filtering
interface CachedZone {
  zone: ParkingZone;
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  center: LatLng;
}

const zoneCache: CachedZone[] = SEED_PARKING_ZONES.map((zone) => {
  const bbox = calculateBoundingBox(zone.polygonCoords);
  const center: LatLng = {
    latitude: (bbox.minLat + bbox.maxLat) / 2,
    longitude: (bbox.minLng + bbox.maxLng) / 2,
  };
  return { zone, bbox, center };
});

/**
 * Identifies which parking zone contains the given coordinate
 */
export function findZoneByCoordinate(point: LatLng, customZones?: ParkingZone[]): ParkingZone | null {
  const candidates = customZones
    ? customZones.map((zone) => ({
        zone,
        bbox: calculateBoundingBox(zone.polygonCoords),
      }))
    : zoneCache;

  // Phase 1: Fast Bounding Box check (0.1ms)
  const potentialMatches = candidates.filter(
    ({ bbox }) =>
      point.latitude >= bbox.minLat &&
      point.latitude <= bbox.maxLat &&
      point.longitude >= bbox.minLng &&
      point.longitude <= bbox.maxLng
  );

  // Phase 2: Exact Ray-Casting Point-in-Polygon check (0.05ms)
  for (const match of potentialMatches) {
    if (isPointInPolygon(point, match.zone.polygonCoords)) {
      return match.zone;
    }
  }

  return null;
}

/**
 * Returns nearby parking zones within a radius in meters
 */
export function findNearbyZones(
  point: LatLng,
  radiusMeters: number = 300,
  customZones?: ParkingZone[]
): ParkingZone[] {
  const list = customZones || SEED_PARKING_ZONES;

  return list.filter((zone) => {
    // Check if inside
    if (isPointInPolygon(point, zone.polygonCoords)) return true;

    // Check distance to any vertex
    for (const vertex of zone.polygonCoords) {
      if (getDistanceInMeters(point, vertex) <= radiusMeters) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Gets all available zones for rendering on the map
 */
export function getAllZones(): ParkingZone[] {
  return SEED_PARKING_ZONES;
}
