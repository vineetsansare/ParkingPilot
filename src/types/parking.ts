export type EmirateCode = 'DXB' | 'AUH' | 'SHJ' | 'AJM' | 'RAK' | 'FUJ' | 'UAQ';

export type ZoneCategory = 
  | 'A' // Commercial Roadside
  | 'B' // Commercial Lot
  | 'C' // Residential/Non-commercial Roadside
  | 'D' // Residential/Non-commercial Lot
  | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' // Special clusters
  | 'S' // Abu Dhabi Standard
  | 'P' // Abu Dhabi Premium / Dubai Premium
  | 'FREE';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface ParkingZone {
  id: string;
  emirateId: EmirateCode;
  zoneCode: string; // e.g. "318C", "332A", "S"
  communityNumber?: number; // e.g. 318 for Al Karama
  areaNameEn: string; // e.g. "Al Karama"
  areaNameAr?: string;
  zoneCategory: ZoneCategory;
  isPremium?: boolean;
  tariffOffpeakHourly: number; // in AED
  tariffPeakHourly: number; // in AED
  tariffDailyCap?: number; // e.g. 20 AED
  maxStayHours: number; // e.g. 4 for curbside, 24 for lots
  allowsHalfHour?: boolean; // Zone A allows 30m
  paidStart: string; // "08:00"
  paidEnd: string; // "22:00"
  freeOnSunday: boolean;
  freeOnFriday: boolean;
  polygonCoords: LatLng[];
  fillColor?: string;
  strokeColor?: string;
}

export interface Vehicle {
  id: string;
  plateCode: string; // e.g. "A", "13", "B"
  plateNumber: string; // e.g. "12345"
  emirateCode: EmirateCode;
  nickname?: string;
  isDefault: boolean;
  displayName: string; // e.g. "My Car"
}

export interface ParkingSession {
  id: string;
  zone: ParkingZone;
  vehicle: Vehicle;
  emirateId: EmirateCode;
  startedAt: string; // ISO String
  durationHours: number;
  expiresAt: string; // ISO String
  paymentMethod: 'whatsapp' | 'sms';
  amountPaid: number;
  isActive: boolean;
}

export interface ExclusionZone {
  id: string;
  label: string; // e.g. "Home", "Work"
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export type DetectionState = 'idle' | 'driving' | 'transition' | 'parked' | 'activeSession';
