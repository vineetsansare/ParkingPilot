import { ParkingZone } from '../types/parking';
import { isPaidParkingTime } from './timeUtils';

export interface TariffCalculation {
  totalCostAED: number;
  hourlyRateAED: number;
  isPeak: boolean;
  isFree: boolean;
  fineAtRiskAED: number;
}

/**
 * Checks if a specific time is considered a "Peak Hour" in Dubai
 * (08:00 – 10:00 AM and 16:00 – 20:00)
 */
export function isDubaiPeakHour(date: Date = new Date()): boolean {
  const hours = date.getHours();
  // Morning peak: 8:00 to 10:00
  if (hours >= 8 && hours < 10) return true;
  // Evening peak: 16:00 to 20:00
  if (hours >= 16 && hours < 20) return true;
  return false;
}

/**
 * Calculates tariff based on zone rules, peak hours, and duration
 */
export function calculateParkingTariff(
  zone: ParkingZone,
  durationHours: number,
  date: Date = new Date()
): TariffCalculation {
  // If outside operating hours or on a free day
  if (!isPaidParkingTime(zone.emirateId, date)) {
    return {
      totalCostAED: 0,
      hourlyRateAED: 0,
      isPeak: false,
      isFree: true,
      fineAtRiskAED: 0,
    };
  }

  const isPeak = zone.emirateId === 'DXB' ? isDubaiPeakHour(date) : false;
  const hourlyRate = isPeak ? zone.tariffPeakHourly : zone.tariffOffpeakHourly;

  let totalCost = hourlyRate * durationHours;

  // Apply daily cap if applicable (e.g. Zone B or D lots in Dubai)
  if (zone.tariffDailyCap && totalCost > zone.tariffDailyCap) {
    totalCost = zone.tariffDailyCap;
  }

  return {
    totalCostAED: totalCost,
    hourlyRateAED: hourlyRate,
    isPeak,
    isFree: false,
    fineAtRiskAED: 150, // Standard Dubai non-payment fine
  };
}
