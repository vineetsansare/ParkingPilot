import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { findZoneByCoordinate } from './zoneLookupService';
import { NotificationService } from './notificationService';
import { isPaidParkingTime } from '../utils/timeUtils';
import { useParkingStore } from '../store/parkingStore';

export const BACKGROUND_PARKING_TASK = 'BACKGROUND_PARKING_DETECTION_TASK';

/**
 * Define the background location task registered with Expo TaskManager
 */
TaskManager.defineTask(BACKGROUND_PARKING_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Background parking task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const latest = locations[locations.length - 1];
      const speed = latest.coords.speed ?? 0;

      // If user is stationary or walking (< 3 m/s ~= 10 km/h)
      if (speed < 3.0) {
        const point = {
          latitude: latest.coords.latitude,
          longitude: latest.coords.longitude,
        };

        const detectedZone = findZoneByCoordinate(point);

        if (detectedZone) {
          // Check if current time is within paid enforcement window
          const isPaid = isPaidParkingTime(detectedZone.emirateId);

          if (isPaid) {
            const store = useParkingStore.getState();
            const lastNotifiedZoneId = store.lastNotifiedZoneId;

            // Prevent spamming notification for the same parking event
            if (lastNotifiedZoneId !== detectedZone.id) {
              store.setDetectedZone(detectedZone, point);
              await NotificationService.sendParkingDetectedNotification(detectedZone);
            }
          }
        }
      }
    }
  }
});

export class ParkingDetectionService {
  /**
   * Starts background location monitoring
   */
  static async startBackgroundMonitoring(): Promise<boolean> {
    try {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') return false;

      // Background permission is only available in standalone / development builds on iOS
      try {
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== 'granted') return false;

        const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_PARKING_TASK);
        if (!isTaskRegistered) {
          await Location.startLocationUpdatesAsync(BACKGROUND_PARKING_TASK, {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000,
            distanceInterval: 50,
            deferredUpdatesInterval: 60000,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: 'Parking Ticket Buddy Active',
              notificationBody: 'Monitoring parking zones to prevent fines',
              notificationColor: '#2563EB',
            },
          });
        }
        return true;
      } catch (bgError) {
        // Expo Go does not allow background location in its client sandbox; log safely
        console.log('Background location monitoring will run in full build:', bgError);
        return false;
      }
    } catch (e) {
      console.log('Location permission request skipped or not granted:', e);
      return false;
    }
  }

  /**
   * Stops background monitoring
   */
  static async stopBackgroundMonitoring(): Promise<void> {
    try {
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_PARKING_TASK);
      if (isTaskRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_PARKING_TASK);
      }
    } catch (e) {
      console.log('Error stopping background monitoring:', e);
    }
  }

  /**
   * One-shot current location check
   */
  static async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch (e) {
      console.log('Could not get current location:', e);
      return null;
    }
  }
}
