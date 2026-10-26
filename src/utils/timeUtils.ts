import { EmirateCode } from '../types/parking';
import { UAE_EMIRATES } from '../constants/uaeParking';

/**
 * Official parking grace periods per Dubai Executive Council Resolution No. (5) of 2016
 */
export const UAE_PARKING_GRACE_PERIODS = {
  ARRIVAL_MINUTES: 10, // 10-minute arrival grace period before needing to pay
  EXPIRY_MINUTES: 10,  // 10-minute buffer after ticket expires before fine is issued
};

/**
 * Official UAE Statutory Public Holidays where public parking is officially declared FREE
 * by the Federal Authority for Government Human Resources (FAHR) and Dubai RTA / Parkin.
 */
export function isUAEHoliday(date: Date = new Date()): { isHoliday: boolean; holidayName?: string } {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  const year = date.getFullYear();

  // Fixed statutory holidays
  if (month === 1 && day === 1) {
    return { isHoliday: true, holidayName: "New Year's Day" };
  }
  if (month === 12 && (day === 2 || day === 3)) {
    return { isHoliday: true, holidayName: "UAE National Day (Eid Al Etihad)" };
  }

  // 2026 Gazetted Islamic Holidays in UAE
  if (year === 2026) {
    // Eid Al Fitr (approx March 20 - 23, 2026)
    if (month === 3 && day >= 20 && day <= 23) {
      return { isHoliday: true, holidayName: "Eid Al Fitr Holiday" };
    }
    // Arafah Day & Eid Al Adha (approx May 26 - 29, 2026)
    if (month === 5 && day >= 26 && day <= 29) {
      return { isHoliday: true, holidayName: "Eid Al Adha Holiday" };
    }
    // Islamic New Year (approx June 16, 2026)
    if (month === 6 && day === 16) {
      return { isHoliday: true, holidayName: "Islamic New Year (Hijri 1448)" };
    }
    // Prophet's Birthday (approx August 25, 2026)
    if (month === 8 && day === 25) {
      return { isHoliday: true, holidayName: "Prophet's Birthday" };
    }
  }

  return { isHoliday: false };
}

/**
 * Checks if a given date falls on the emirate's free day
 * (Sunday for Dubai/Abu Dhabi, Friday for Sharjah/Ajman, or official UAE public holiday)
 */
export function isFreeDay(emirateId: EmirateCode, date: Date = new Date()): boolean {
  // Check if it is an official UAE public holiday
  const holiday = isUAEHoliday(date);
  if (holiday.isHoliday) return true;

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

  const holiday = isUAEHoliday(date);
  if (holiday.isHoliday) {
    return {
      isPaid: false,
      statusText: 'Free Parking (Holiday)',
      detailText: `Free public parking declared for ${holiday.holidayName}`,
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
