import { Vehicle, ParkingZone, EmirateCode } from '../types/parking';
import { UAE_EMIRATES } from '../constants/uaeParking';

/**
 * Returns the target SMS shortcode for an emirate
 */
export function getSmsRecipient(emirateId: EmirateCode): string {
  const config = UAE_EMIRATES[emirateId];
  return config?.smsNumber || '7275';
}

/**
 * Returns the WhatsApp number for an emirate (Dubai Mahboub: 971588009090)
 */
export function getWhatsAppRecipient(emirateId: EmirateCode): string | null {
  const config = UAE_EMIRATES[emirateId];
  return config?.whatsappNumber || null;
}

/**
 * Formats plate prefix based on the vehicle's registration emirate vs where it's parking
 */
export function formatPlateIdentifier(vehicle: Vehicle, targetEmirate: EmirateCode): string {
  const plateCode = vehicle.plateCode.trim().toUpperCase();
  const plateNumber = vehicle.plateNumber.trim();

  // If vehicle is registered in the same emirate where parking is being paid
  if (vehicle.emirateCode === targetEmirate) {
    if (targetEmirate === 'DXB') {
      // Dubai: e.g. "A12345" (no space)
      return `${plateCode}${plateNumber}`;
    }
    if (targetEmirate === 'AUH') {
      // Abu Dhabi: e.g. "AUH13 12345"
      return `AUH${plateCode} ${plateNumber}`;
    }
    if (targetEmirate === 'SHJ') {
      // Sharjah: e.g. "SHJ 12345"
      return `SHJ ${plateNumber}`;
    }
    if (targetEmirate === 'AJM') {
      // Ajman: e.g. "AJM B 12345"
      return `AJM ${plateCode} ${plateNumber}`;
    }
  }

  // Cross-emirate parking: include full source emirate prefix
  const source = vehicle.emirateCode; // 'DXB', 'AUH', 'SHJ', etc.
  if (targetEmirate === 'DXB') {
    // Dubai parking with outside plate: e.g. "AUH13 99887"
    return `${source}${plateCode} ${plateNumber}`;
  }
  if (targetEmirate === 'AUH') {
    // Abu Dhabi with outside plate: e.g. "DXBA 12345"
    return `${source}${plateCode} ${plateNumber}`;
  }
  if (targetEmirate === 'SHJ') {
    // Sharjah with outside plate: e.g. "DXB 12345"
    return `${source} ${plateNumber}`;
  }
  if (targetEmirate === 'AJM') {
    // Ajman with outside plate: e.g. "DXB A 12345"
    return `${source} ${plateCode} ${plateNumber}`;
  }

  return `${plateCode}${plateNumber}`;
}

/**
 * Formats the exact SMS payload for the target emirate
 */
export function formatSmsMessage(vehicle: Vehicle, zone: ParkingZone, durationHours: number): string {
  const platePart = formatPlateIdentifier(vehicle, zone.emirateId);

  switch (zone.emirateId) {
    case 'DXB':
      // [Plate] [ZoneCode] [Duration] -> "A12345 318C 2"
      return `${platePart} ${zone.zoneCode} ${durationHours}`;

    case 'AUH': {
      // [Plate] [ParkingType S/P] [Duration] -> "AUH13 99887 S 2"
      const type = zone.zoneCategory === 'P' || zone.isPremium ? 'P' : 'S';
      return `${platePart} ${type} ${durationHours}`;
    }

    case 'SHJ':
      // [Plate] [Duration] -> "DXB 12345 2" (no zone needed in Sharjah SMS)
      return `${platePart} ${durationHours}`;

    case 'AJM':
      // Ajman SMS defaults strictly to 1 hour: [Plate]
      return platePart;

    default:
      return `${platePart} ${zone.zoneCode} ${durationHours}`;
  }
}

/**
 * Formats WhatsApp payload (Dubai RTA Mahboub takes exact same syntax as SMS)
 */
export function formatWhatsAppMessage(vehicle: Vehicle, zone: ParkingZone, durationHours: number): string {
  return formatSmsMessage(vehicle, zone, durationHours);
}
