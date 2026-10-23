import { Linking, Platform } from 'react-native';
import { Vehicle, ParkingZone } from '../types/parking';
import {
  formatSmsMessage,
  formatWhatsAppMessage,
  getSmsRecipient,
  getWhatsAppRecipient,
} from '../utils/smsFormatter';

export interface MessageLaunchResult {
  success: boolean;
  channel: 'whatsapp' | 'sms';
  targetNumber: string;
  formattedText: string;
  error?: string;
}

export class MessagingService {
  /**
   * Pre-composes an SMS and opens the native SMS app with recipient & message filled
   */
  static async launchSms(
    vehicle: Vehicle,
    zone: ParkingZone,
    durationHours: number
  ): Promise<MessageLaunchResult> {
    const recipient = getSmsRecipient(zone.emirateId);
    const body = formatSmsMessage(vehicle, zone, durationHours);
    const encodedBody = encodeURIComponent(body);

    // iOS uses '&body=' while Android uses '?body='
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${recipient}${separator}body=${encodedBody}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true, channel: 'sms', targetNumber: recipient, formattedText: body };
      } else {
        return {
          success: false,
          channel: 'sms',
          targetNumber: recipient,
          formattedText: body,
          error: 'SMS app cannot be opened on this device',
        };
      }
    } catch (e: any) {
      return {
        success: false,
        channel: 'sms',
        targetNumber: recipient,
        formattedText: body,
        error: e.message || 'Error launching SMS',
      };
    }
  }

  /**
   * Pre-composes a WhatsApp message and opens WhatsApp directly to RTA Mahboub
   * Saves user the AED 0.30 telecom convenience fee
   */
  static async launchWhatsApp(
    vehicle: Vehicle,
    zone: ParkingZone,
    durationHours: number
  ): Promise<MessageLaunchResult> {
    const recipient = getWhatsAppRecipient(zone.emirateId);

    // If target emirate doesn't have WhatsApp parking bot (e.g. Abu Dhabi/Sharjah/Ajman), fallback to SMS
    if (!recipient) {
      return this.launchSms(vehicle, zone, durationHours);
    }

    const body = formatWhatsAppMessage(vehicle, zone, durationHours);
    const encodedBody = encodeURIComponent(body);

    // Universal WhatsApp link
    const waUrl = `https://wa.me/${recipient}?text=${encodedBody}`;

    try {
      await Linking.openURL(waUrl);
      return { success: true, channel: 'whatsapp', targetNumber: recipient, formattedText: body };
    } catch (e: any) {
      // Fallback to SMS if WhatsApp fails
      return this.launchSms(vehicle, zone, durationHours);
    }
  }

  /**
   * Helper to check if WhatsApp app is installed on device
   */
  static async isWhatsAppInstalled(): Promise<boolean> {
    try {
      return await Linking.canOpenURL('whatsapp://send');
    } catch {
      return false;
    }
  }
}
