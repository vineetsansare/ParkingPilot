import { DatasetSyncState, DatasetManifest } from '../types/dataset';
import { ParkingZone } from '../types/parking';
import { SEED_PARKING_ZONES } from '../database/seedData';
import { updateZoneMemoryCache, getAllZones } from './zoneLookupService';
import { useParkingStore } from '../store/parkingStore';

// Simulated remote update package (e.g. 5 newly gazetted zones in Dubai Islands & Deira Marina)
const NEW_GAZETTED_ZONES: ParkingZone[] = [
  {
    id: 'zone-dubai-islands-701a',
    emirateId: 'DXB',
    zoneCode: '701A',
    communityNumber: 701,
    areaNameEn: 'Dubai Islands Marina Walk',
    areaNameAr: 'جزر دبي ممشى المارينا',
    zoneCategory: 'A',
    isPremium: true,
    tariffOffpeakHourly: 4.0,
    tariffPeakHourly: 4.0,
    maxStayHours: 4,
    allowsHalfHour: true,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    polygonCoords: [
      { latitude: 25.2950, longitude: 55.3180 },
      { latitude: 25.3020, longitude: 55.3210 },
      { latitude: 25.3000, longitude: 55.3290 },
      { latitude: 25.2930, longitude: 55.3250 },
      { latitude: 25.2950, longitude: 55.3180 },
    ],
  },
  {
    id: 'zone-dubai-islands-702b',
    emirateId: 'DXB',
    zoneCode: '702B',
    communityNumber: 702,
    areaNameEn: 'Dubai Islands Beachfront West',
    areaNameAr: 'شاطئ جزر دبي الغربي',
    zoneCategory: 'B',
    isPremium: false,
    tariffOffpeakHourly: 3.0,
    tariffPeakHourly: 3.0,
    tariffDailyCap: 20.0,
    maxStayHours: 24,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    polygonCoords: [
      { latitude: 25.3030, longitude: 55.3190 },
      { latitude: 25.3100, longitude: 55.3220 },
      { latitude: 25.3080, longitude: 55.3280 },
      { latitude: 25.3010, longitude: 55.3250 },
      { latitude: 25.3030, longitude: 55.3190 },
    ],
  },
  {
    id: 'zone-dubai-islands-703a',
    emirateId: 'DXB',
    zoneCode: '703A',
    communityNumber: 703,
    areaNameEn: 'Deira Waterfront Promenade East',
    areaNameAr: 'ممشى الواجهة البحرية بديرة',
    zoneCategory: 'A',
    isPremium: true,
    tariffOffpeakHourly: 4.0,
    tariffPeakHourly: 4.0,
    maxStayHours: 4,
    allowsHalfHour: true,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    polygonCoords: [
      { latitude: 25.2820, longitude: 55.3120 },
      { latitude: 25.2890, longitude: 55.3160 },
      { latitude: 25.2870, longitude: 55.3220 },
      { latitude: 25.2800, longitude: 55.3180 },
      { latitude: 25.2820, longitude: 55.3120 },
    ],
  },
  {
    id: 'zone-dubai-islands-704c',
    emirateId: 'DXB',
    zoneCode: '704C',
    communityNumber: 704,
    areaNameEn: 'Al Mamzar Lagoon Park North',
    areaNameAr: 'حديقة بحيرة الممزر الشمالية',
    zoneCategory: 'C',
    isPremium: false,
    tariffOffpeakHourly: 2.0,
    tariffPeakHourly: 2.0,
    maxStayHours: 4,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    polygonCoords: [
      { latitude: 25.3150, longitude: 55.3400 },
      { latitude: 25.3210, longitude: 55.3450 },
      { latitude: 25.3180, longitude: 55.3520 },
      { latitude: 25.3120, longitude: 55.3480 },
      { latitude: 25.3150, longitude: 55.3400 },
    ],
  },
  {
    id: 'zone-dubai-islands-705d',
    emirateId: 'DXB',
    zoneCode: '705D',
    communityNumber: 705,
    areaNameEn: 'Al Mamzar Coastal Strip South',
    areaNameAr: 'الشريط الساحلي بالممزر',
    zoneCategory: 'D',
    isPremium: false,
    tariffOffpeakHourly: 2.0,
    tariffPeakHourly: 2.0,
    tariffDailyCap: 10.0,
    maxStayHours: 24,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    polygonCoords: [
      { latitude: 25.3050, longitude: 55.3350 },
      { latitude: 25.3120, longitude: 55.3390 },
      { latitude: 25.3090, longitude: 55.3460 },
      { latitude: 25.3020, longitude: 55.3420 },
      { latitude: 25.3050, longitude: 55.3350 },
    ],
  },
];

class DatasetSyncService {
  private state: DatasetSyncState = {
    currentVersion: '2026.10.26',
    currentReleaseDate: 'October 26, 2026',
    availableVersion: null,
    status: 'idle',
    lastChecked: null,
    totalZones: SEED_PARKING_ZONES.length,
    errorMessage: null,
    hasUpdateAvailable: false,
    legalNoticeLastUpdated: 'October 2026',
  };

  private listeners: Set<(state: DatasetSyncState) => void> = new Set();

  constructor() {
    this.state.totalZones = getAllZones().length;
  }

  public getState(): DatasetSyncState {
    return { ...this.state, totalZones: getAllZones().length };
  }

  public subscribe(listener: (state: DatasetSyncState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  private formatTimeNow(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today';
  }

  /**
   * 1-Click Check for remote parking zone updates.
   * Secure OTA check ensuring motorists have newly declared Parkin & municipal zones.
   */
  public async checkForUpdates(): Promise<DatasetSyncState> {
    this.state.status = 'checking';
    this.state.errorMessage = null;
    this.notify();

    // Simulate network verification against authoritative registry manifest
    await new Promise((resolve) => setTimeout(resolve, 800));

    this.state.lastChecked = this.formatTimeNow();

    if (this.state.currentVersion === '2026.11.01') {
      this.state.status = 'up-to-date';
      this.state.hasUpdateAvailable = false;
      this.state.availableVersion = null;
    } else {
      // New release available
      this.state.status = 'idle';
      this.state.hasUpdateAvailable = true;
      this.state.availableVersion = '2026.11.01';
    }

    this.notify();
    return this.getState();
  }

  /**
   * 1-Click Download and apply update to active memory cache and map
   */
  public async downloadAndApplyUpdate(): Promise<boolean> {
    if (this.state.status === 'downloading') return false;

    this.state.status = 'downloading';
    this.state.errorMessage = null;
    this.notify();

    // Simulate reliable atomic download and validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Merge new official zones with existing database
      const existingZones = getAllZones();
      const existingIds = new Set(existingZones.map((z) => z.id));
      const newlyAdded = NEW_GAZETTED_ZONES.filter((z) => !existingIds.has(z.id));
      const updatedZones = [...existingZones, ...newlyAdded];

      // Update in-memory spatial cache
      updateZoneMemoryCache(updatedZones);

      // Trigger reactive UI re-render on Map and other screens
      useParkingStore.getState().incrementZonesRevision();

      this.state.currentVersion = '2026.11.01';
      this.state.currentReleaseDate = 'November 1, 2026';
      this.state.totalZones = updatedZones.length;
      this.state.status = 'updated';
      this.state.hasUpdateAvailable = false;
      this.state.availableVersion = null;
      this.state.legalNoticeLastUpdated = 'November 2026';
      this.state.lastChecked = this.formatTimeNow();

      this.notify();
      return true;
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err?.message || 'Failed to apply update';
      this.notify();
      return false;
    }
  }

  /**
   * Reverts to bundled default seed database
   */
  public resetToBundled(): void {
    updateZoneMemoryCache(SEED_PARKING_ZONES);
    useParkingStore.getState().incrementZonesRevision();

    this.state.currentVersion = '2026.10.26';
    this.state.currentReleaseDate = 'October 26, 2026';
    this.state.totalZones = SEED_PARKING_ZONES.length;
    this.state.status = 'idle';
    this.state.hasUpdateAvailable = false;
    this.state.availableVersion = null;
    this.state.legalNoticeLastUpdated = 'October 2026';
    this.state.errorMessage = null;

    this.notify();
  }
}

export const datasetSyncService = new DatasetSyncService();
