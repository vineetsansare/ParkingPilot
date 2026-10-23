import { EmirateCode } from '../types/parking';
import { UAE_EMIRATES } from '../constants/uaeParking';

/**
 * Checks if a given date falls on the emirate's free day
 * (Sunday for Dubai/Abu Dhabi, Friday for Sharjah/Ajman)
 */
export function isFreeDay(emirateId: EmirateCode, date: Date = new Date()): boolean {
  const config = UAE_EMIRATES[emirateId];
  if (!config || !config.freeDay) return false;

  const dayOfWeek = date.getDay(); // 0 is Sunday, 5 is Friday
  if (config.freeDay === 'sunday' && dayOfWeek === 0) return true;
  if (config.freeDay === 'friday' && dayOfWeek === 5) return true;

  return false;
}

/**
 * Helper to parse "HH:MM" into minutes from midnight
 */
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Checks if current time is within active paid parking enforcement hours
 */
export function isPaidParkingTime(emirateId: EmirateCode, date: Date = new Date()): boolean {
  const config = UAE_EMIRATES[emirateId];
  if (!config || !config.hasPaidParking) return false;

  // Check if it's the emirate's free day
  if (isFreeDay(emirateId, date)) return false;

  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  // If emirate uses split shift (e.g. Ajman: 08:00-13:00 and 17:00-22:00)
  if (config.splitShift) {
    const morningStart = parseTimeToMinutes(config.splitShift.morningStart);
    const morningEnd = parseTimeToMinutes(config.splitShift.morningEnd);
    const eveningStart = parseTimeToMinutes(config.splitShift.eveningStart);
    const eveningEnd = parseTimeToMinutes(config.splitShift.eveningEnd);

    const inMorning = currentMinutes >= morningStart && currentMinutes < morningEnd;
    const inEvening = currentMinutes >= eveningStart && currentMinutes < eveningEnd;
    return inMorning || inEvening;
  }

  // Standard continuous shift (e.g. Dubai: 08:00 to 22:00, Abu Dhabi: 08:00 to 00:00)
  const paidStart = parseTimeToMinutes(config.paidStart);
  let paidEnd = parseTimeToMinutes(config.paidEnd);
  if (paidEnd === 0) paidEnd = 24 * 60; // Midnight

  return currentMinutes >= paidStart && currentMinutes < paidEnd;
}

/**
 * Returns a human-friendly string of parking status
 */
export function getParkingStatusDescription(emirateId: EmirateCode, date: Date = new Date()): {
  isPaid: boolean;
  statusText: string;
  detailText: string;
} {
  const config = UAE_EMIRATES[emirateId];
  if (!config?.hasPaidParking) {
    return {
      isPaid: false,
      statusText: 'Free Parking',
      detailText: `Public parking in ${config?.nameEn || 'this area'} is free of charge`,
    };
  }

  if (isFreeDay(emirateId, date)) {
    const dayName = config.freeDay === 'sunday' ? 'Sunday' : 'Friday';
    return {
      isPaid: false,
      statusText: 'Free Day Today',
      detailText: `Enjoy free public parking across ${config.nameEn} on ${dayName}s!`,
    };
  }

  if (isPaidParkingTime(emirateId, date)) {
    return {
      isPaid: true,
      statusText: 'Paid Parking Active',
      detailText: `Operating hours: ${config.paidStart} – ${config.paidEnd}`,
    };
  }

  return {
    isPaid: false,
    statusText: 'Free Night Hours',
    detailText: `Paid enforcement resumes tomorrow at ${config.paidStart}`,
  };
}
