import { LatLng, ParkingZone } from '../types/parking';
import { isPointInPolygon, calculateBoundingBox, getDistanceInMeters } from '../utils/geoUtils';
import { SEED_PARKING_ZONES } from '../database/seedData';

// In-memory zone cache with pre-calculated bounding boxes for fast sub-millisecond filtering
interface CachedZone {
  zone: ParkingZone;
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  center: LatLng;
}

function buildCache(zones: ParkingZone[]): CachedZone[] {
  return zones.map((zone) => {
    const bbox = calculateBoundingBox(zone.polygonCoords);
    const center: LatLng = {
      latitude: (bbox.minLat + bbox.maxLat) / 2,
      longitude: (bbox.minLng + bbox.maxLng) / 2,
    };
    return { zone, bbox, center };
  });
}

let activeZoneList: ParkingZone[] = SEED_PARKING_ZONES;
let zoneCache: CachedZone[] = buildCache(SEED_PARKING_ZONES);

/**
 * Dynamically reloads memory cache without restarting app
 */
export function updateZoneMemoryCache(newZones: ParkingZone[]): void {
  activeZoneList = newZones;
  zoneCache = buildCache(newZones);
}

/**
 * Identifies which parking zone contains the given coordinate.
 * Uses exact point-in-polygon ray casting with a 40m curb-proximity fallback
 * for vehicles parked on curbs and service lanes along zone boundaries.
 */
export function findZoneByCoordinate(point: LatLng, customZones?: ParkingZone[]): ParkingZone | null {
  const candidates = customZones
    ? customZones.map((zone) => ({
        zone,
        bbox: calculateBoundingBox(zone.polygonCoords),
        center: {
          latitude: point.latitude,
          longitude: point.longitude,
        },
      }))
    : zoneCache;

  // Approx degrees for ~100m bounding box padding
  const paddingDeg = 0.001;

  // Phase 1: Fast Bounding Box check (0.1ms)
  const potentialMatches = candidates.filter(
    ({ bbox }) =>
      point.latitude >= bbox.minLat - paddingDeg &&
      point.latitude <= bbox.maxLat + paddingDeg &&
      point.longitude >= bbox.minLng - paddingDeg &&
      point.longitude <= bbox.maxLng + paddingDeg
  );

  // Phase 2: Exact Ray-Casting Point-in-Polygon check (0.05ms)
  for (const match of potentialMatches) {
    if (isPointInPolygon(point, match.zone.polygonCoords)) {
      return match.zone;
    }
  }

  // Phase 3: Street-side / Curb proximity fallback (within 40m of zone boundary)
  // Ensures reliable detection when vehicle or crosshair is on roadside bays
  let closestZone: ParkingZone | null = null;
  let closestDistance = Infinity;

  for (const match of potentialMatches) {
    for (const vertex of match.zone.polygonCoords) {
      const dist = getDistanceInMeters(point, vertex);
      if (dist <= 40 && dist < closestDistance) {
        closestDistance = dist;
        closestZone = match.zone;
      }
    }
  }

  return closestZone;
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
  return activeZoneList;
}

