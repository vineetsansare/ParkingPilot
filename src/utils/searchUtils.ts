import { ParkingZone, EmirateCode, LatLng } from '../types/parking';
import { getDistanceInMeters } from './geoUtils';

export type FilterEmirate = 'ALL' | EmirateCode;

export interface ZoneSearchResult {
  zone: ParkingZone;
  distanceMeters: number | null;
}

/**
 * High-performance search and ranking engine for UAE parking zones.
 * Matches zone codes (e.g. 626M, 318C, 5566), English and Arabic names,
 * community sector numbers, and emirate codes with priority boosting.
 */
export function filterAndRankZones(
  zones: ParkingZone[],
  query: string,
  selectedEmirate: FilterEmirate = 'ALL',
  currentLocation: LatLng | null = null
): ZoneSearchResult[] {
  const q = query.trim().toLowerCase();

  const zonesWithDist: ZoneSearchResult[] = zones.map((zone) => {
    let distanceMeters: number | null = null;
    if (currentLocation && zone.polygonCoords.length > 0) {
      distanceMeters = getDistanceInMeters(currentLocation, zone.polygonCoords[0]);
    }
    return { zone, distanceMeters };
  });

  return zonesWithDist
    .filter(({ zone }) => {
      // Filter by Emirate if specified
      if (selectedEmirate !== 'ALL' && zone.emirateId !== selectedEmirate) {
        return false;
      }

      // If query is empty, pass all for this emirate
      if (!q) return true;

      const codeMatch = zone.zoneCode.toLowerCase().includes(q);
      const nameEnMatch = zone.areaNameEn.toLowerCase().includes(q);
      const nameArMatch = zone.areaNameAr ? zone.areaNameAr.toLowerCase().includes(q) : false;
      const commMatch = zone.communityNumber ? String(zone.communityNumber).includes(q) : false;
      const emirateMatch = zone.emirateId.toLowerCase() === q;

      return codeMatch || nameEnMatch || nameArMatch || commMatch || emirateMatch;
    })
    .sort((a, b) => {
      if (!q) {
        // If query is empty, sort by proximity to user location if available
        if (a.distanceMeters !== null && b.distanceMeters !== null) {
          return a.distanceMeters - b.distanceMeters;
        }
        return 0;
      }

      // 1. Boost exact zone code matches to top
      const aExactCode = a.zone.zoneCode.toLowerCase() === q;
      const bExactCode = b.zone.zoneCode.toLowerCase() === q;
      if (aExactCode && !bExactCode) return -1;
      if (!aExactCode && bExactCode) return 1;

      // 2. Boost codes starting with query
      const aStartsCode = a.zone.zoneCode.toLowerCase().startsWith(q);
      const bStartsCode = b.zone.zoneCode.toLowerCase().startsWith(q);
      if (aStartsCode && !bStartsCode) return -1;
      if (!aStartsCode && bStartsCode) return 1;

      // 3. Boost English names starting with query
      const aStartsName = a.zone.areaNameEn.toLowerCase().startsWith(q);
      const bStartsName = b.zone.areaNameEn.toLowerCase().startsWith(q);
      if (aStartsName && !bStartsName) return -1;
      if (!aStartsName && bStartsName) return 1;

      return 0;
    });
}
