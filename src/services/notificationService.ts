import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ParkingZone } from '../types/parking';

// Configure notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Request permissions and create notification channel
   */
  static async initialize(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('parking_alerts', {
        name: 'Parking Zone Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('parking_reminders', {
        name: 'Parking Expiry Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        sound: 'default',
      });
    }

    return true;
  }

  /**
   * Dispatches local notification when user is detected in a parking zone
   */
  static async sendParkingDetectedNotification(zone: ParkingZone): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `🅿️ Parked in Zone ${zone.zoneCode}!`,
        body: `Looks like you're in ${zone.areaNameEn}. Don't forget to pay to avoid an AED 150 fine!`,
        data: {
          zoneId: zone.id,
          zoneCode: zone.zoneCode,
          emirateId: zone.emirateId,
          type: 'PARKING_DETECTED',
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // deliver immediately
    });
  }

  /**
   * Schedules a reminder notification 10 minutes before parking ticket expires
   */
  static async scheduleExpiryWarning(
    zoneCode: string,
    expiryDate: Date
  ): Promise<string | null> {
    const triggerTime = new Date(expiryDate.getTime() - 10 * 60 * 1000); // 10 mins prior
    if (triggerTime.getTime() <= Date.now()) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ Parking Expiring Soon (Zone ${zoneCode})`,
        body: `10 minutes remaining on your parking session. Tap to extend!`,
        data: { zoneCode, type: 'EXPIRY_WARNING' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerTime,
      },
    });
  }
}
