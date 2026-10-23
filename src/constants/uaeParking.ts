import { EmirateCode } from '../types/parking';

export interface EmirateConfig {
  id: EmirateCode;
  nameEn: string;
  nameAr: string;
  smsNumber: string | null;
  whatsappNumber: string | null;
  hasPaidParking: boolean;
  freeDay: 'sunday' | 'friday' | null;
  paidStart: string;
  paidEnd: string;
  splitShift?: {
    morningStart: string;
    morningEnd: string;
    eveningStart: string;
    eveningEnd: string;
  };
  gracePeriodMinutes: number;
  fineAmountAED: number;
  smsSurchargeAED: number;
}

export const UAE_EMIRATES: Record<EmirateCode, EmirateConfig> = {
  DXB: {
    id: 'DXB',
    nameEn: 'Dubai',
    nameAr: 'دبي',
    smsNumber: '7275',
    whatsappNumber: '971588009090', // RTA Mahboub
    hasPaidParking: true,
    freeDay: 'sunday',
    paidStart: '08:00',
    paidEnd: '22:00',
    gracePeriodMinutes: 10,
    fineAmountAED: 150,
    smsSurchargeAED: 0.30,
  },
  AUH: {
    id: 'AUH',
    nameEn: 'Abu Dhabi',
    nameAr: 'أبوظبي',
    smsNumber: '3009',
    whatsappNumber: null,
    hasPaidParking: true,
    freeDay: 'sunday',
    paidStart: '08:00',
    paidEnd: '00:00', // Midnight
    gracePeriodMinutes: 0,
    fineAmountAED: 100,
    smsSurchargeAED: 0.30,
  },
  SHJ: {
    id: 'SHJ',
    nameEn: 'Sharjah',
    nameAr: 'الشارقة',
    smsNumber: '5566',
    whatsappNumber: null,
    hasPaidParking: true,
    freeDay: 'friday',
    paidStart: '08:00',
    paidEnd: '22:00',
    gracePeriodMinutes: 10,
    fineAmountAED: 150,
    smsSurchargeAED: 0.38,
  },
  AJM: {
    id: 'AJM',
    nameEn: 'Ajman',
    nameAr: 'عجمان',
    smsNumber: '5155',
    whatsappNumber: null,
    hasPaidParking: true,
    freeDay: 'friday',
    paidStart: '08:00',
    paidEnd: '22:00',
    splitShift: {
      morningStart: '08:00',
      morningEnd: '13:00',
      eveningStart: '17:00',
      eveningEnd: '22:00',
    },
    gracePeriodMinutes: 0,
    fineAmountAED: 150,
    smsSurchargeAED: 0.38,
  },
  RAK: {
    id: 'RAK',
    nameEn: 'Ras Al Khaimah',
    nameAr: 'رأس الخيمة',
    smsNumber: null,
    whatsappNumber: null,
    hasPaidParking: false, // General public street parking is free
    freeDay: null,
    paidStart: '00:00',
    paidEnd: '00:00',
    gracePeriodMinutes: 10,
    fineAmountAED: 0,
    smsSurchargeAED: 0,
  },
  FUJ: {
    id: 'FUJ',
    nameEn: 'Fujairah',
    nameAr: 'الفجيرة',
    smsNumber: null, // Pay-and-display meters only
    whatsappNumber: null,
    hasPaidParking: true,
    freeDay: 'friday',
    paidStart: '08:00',
    paidEnd: '21:00',
    splitShift: {
      morningStart: '08:00',
      morningEnd: '13:00',
      eveningStart: '16:00',
      eveningEnd: '21:00',
    },
    gracePeriodMinutes: 0,
    fineAmountAED: 150,
    smsSurchargeAED: 0,
  },
  UAQ: {
    id: 'UAQ',
    nameEn: 'Umm Al Quwain',
    nameAr: 'أم القيوين',
    smsNumber: null,
    whatsappNumber: null,
    hasPaidParking: false, // 100% Free
    freeDay: null,
    paidStart: '00:00',
    paidEnd: '00:00',
    gracePeriodMinutes: 0,
    fineAmountAED: 0,
    smsSurchargeAED: 0,
  },
};
