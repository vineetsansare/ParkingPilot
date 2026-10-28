import { datasetSyncService } from '../../src/services/datasetSyncService';
import { getAllZones } from '../../src/services/zoneLookupService';
import { SEED_PARKING_ZONES } from '../../src/database/seedData';

describe('datasetSyncService', () => {
  beforeEach(() => {
    datasetSyncService.resetToBundled();
  });

  test('initial state matches bundled database', () => {
    const state = datasetSyncService.getState();
    expect(state.currentVersion).toBe('2026.10.26');
    expect(state.totalZones).toBe(SEED_PARKING_ZONES.length);
    expect(state.hasUpdateAvailable).toBe(false);
  });

  test('checkForUpdates detects available 2026.11.01 update', async () => {
    const state = await datasetSyncService.checkForUpdates();
    expect(state.hasUpdateAvailable).toBe(true);
    expect(state.availableVersion).toBe('2026.11.01');
    expect(state.lastChecked).toBeTruthy();
  });

  test('downloadAndApplyUpdate integrates new zones and updates memory cache', async () => {
    await datasetSyncService.checkForUpdates();
    const success = await datasetSyncService.downloadAndApplyUpdate();
    expect(success).toBe(true);

    const state = datasetSyncService.getState();
    expect(state.currentVersion).toBe('2026.11.01');
    expect(state.totalZones).toBe(SEED_PARKING_ZONES.length + 5);
    expect(state.hasUpdateAvailable).toBe(false);

    // Verify spatial lookup memory cache reflects updated zones
    const zones = getAllZones();
    expect(zones.length).toBe(SEED_PARKING_ZONES.length + 5);
    expect(zones.some((z) => z.zoneCode === '701A')).toBe(true);
  });

  test('resetToBundled reverts back to original seed data', async () => {
    await datasetSyncService.checkForUpdates();
    await datasetSyncService.downloadAndApplyUpdate();
    expect(getAllZones().length).toBe(SEED_PARKING_ZONES.length + 5);

    datasetSyncService.resetToBundled();
    const state = datasetSyncService.getState();
    expect(state.currentVersion).toBe('2026.10.26');
    expect(state.totalZones).toBe(SEED_PARKING_ZONES.length);
    expect(getAllZones().length).toBe(SEED_PARKING_ZONES.length);
  });
});
