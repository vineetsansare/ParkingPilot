import { EmirateCode } from '../types/parking';

export interface EmiratePlateConfig {
  emirateCode: EmirateCode;
  nameEn: string;
  nameAr: string;
  codeType: 'letter' | 'number';
  allowedCodes: string[];
  defaultCode: string;
  codePlaceholder: string;
  codeLabel: string;
  accentColor: string;
  badgeBg: string;
  maxNumberLength: number;
  description: string;
}

export const EMIRATE_PLATE_CONFIGS: Record<EmirateCode, EmiratePlateConfig> = {
  DXB: {
    emirateCode: 'DXB',
    nameEn: 'Dubai',
    nameAr: 'دبي',
    codeType: 'letter',
    allowedCodes: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'HH', 'II', 'JJ', 'KK', 'LL', 'MM',
      'NN', 'OO', 'PP', 'QQ', 'RR', 'SS', 'TT', 'UU', 'VV', 'WW', 'XX', 'YY', 'ZZ'
    ],
    defaultCode: 'A',
    codePlaceholder: 'A or AA',
    codeLabel: 'Letter Code',
    accentColor: '#059669',
    badgeBg: '#E6F9F4',
    maxNumberLength: 5,
    description: 'Letters A–Z or AA–ZZ',
  },
  AUH: {
    emirateCode: 'AUH',
    nameEn: 'Abu Dhabi',
    nameAr: 'أبوظبي',
    codeType: 'number',
    allowedCodes: ['1', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '16', '17', '50'],
    defaultCode: '17',
    codePlaceholder: '1 to 50',
    codeLabel: 'Category Band',
    accentColor: '#DC2626',
    badgeBg: '#FEE2E2',
    maxNumberLength: 5,
    description: 'Category bands (e.g. 1, 4, 5, 17, 50)',
  },
  SHJ: {
    emirateCode: 'SHJ',
    nameEn: 'Sharjah',
    nameAr: 'الشارقة',
    codeType: 'number',
    allowedCodes: ['1', '2', '3', '4', '5'],
    defaultCode: '2',
    codePlaceholder: '1 to 5',
    codeLabel: 'Category Code',
    accentColor: '#D97706',
    badgeBg: '#FEF3C7',
    maxNumberLength: 5,
    description: 'Category 1 through 5',
  },
  AJM: {
    emirateCode: 'AJM',
    nameEn: 'Ajman',
    nameAr: 'عجمان',
    codeType: 'letter',
    allowedCodes: ['A', 'B', 'C', 'D', 'E', 'H'],
    defaultCode: 'B',
    codePlaceholder: 'A, B, C, D, E, H',
    codeLabel: 'Letter Code',
    accentColor: '#991B1B',
    badgeBg: '#FEE2E2',
    maxNumberLength: 5,
    description: 'Codes A, B, C, D, E, H',
  },
  RAK: {
    emirateCode: 'RAK',
    nameEn: 'Ras Al Khaimah',
    nameAr: 'رأس الخيمة',
    codeType: 'letter',
    allowedCodes: ['A', 'C', 'D', 'I', 'K', 'M', 'N', 'S', 'V', 'Y'],
    defaultCode: 'C',
    codePlaceholder: 'A, C, D, K, etc.',
    codeLabel: 'Letter Code',
    accentColor: '#B91C1C',
    badgeBg: '#FEE2E2',
    maxNumberLength: 5,
    description: 'Codes A, C, D, I, K, M, N, S, V, Y',
  },
  UAQ: {
    emirateCode: 'UAQ',
    nameEn: 'Umm Al Quwain',
    nameAr: 'أم القيوين',
    codeType: 'letter',
    allowedCodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'X'],
    defaultCode: 'A',
    codePlaceholder: 'A through X',
    codeLabel: 'Letter Code',
    accentColor: '#0369A1',
    badgeBg: '#E0F2FE',
    maxNumberLength: 5,
    description: 'Codes A through I, X',
  },
  FUJ: {
    emirateCode: 'FUJ',
    nameEn: 'Fujairah',
    nameAr: 'الفجيرة',
    codeType: 'letter',
    allowedCodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'K', 'M', 'P', 'R', 'S', 'T'],
    defaultCode: 'A',
    codePlaceholder: 'A through T',
    codeLabel: 'Letter Code',
    accentColor: '#7C2D12',
    badgeBg: '#FFEDD5',
    maxNumberLength: 5,
    description: 'Codes A through T',
  },
};

export const ALL_EMIRATES: EmirateCode[] = ['DXB', 'AUH', 'SHJ', 'AJM', 'RAK', 'UAQ', 'FUJ'];

export function validatePlateInput(
  emirate: EmirateCode,
  code: string,
  plateNumber: string
): { isValid: boolean; error?: string } {
  const config = EMIRATE_PLATE_CONFIGS[emirate];
  if (!config) {
    return { isValid: false, error: 'Invalid Emirate' };
  }

  const cleanNum = plateNumber.trim();
  if (!/^\d{1,5}$/.test(cleanNum)) {
    return { isValid: false, error: 'Plate number must be 1 to 5 digits' };
  }

  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { isValid: false, error: 'Code is required' };
  }

  if (config.codeType === 'number') {
    if (!config.allowedCodes.includes(cleanCode)) {
      return { isValid: false, error: `Invalid category for ${config.nameEn}` };
    }
  } else {
    if (!config.allowedCodes.includes(cleanCode)) {
      return { isValid: false, error: `Invalid letter code for ${config.nameEn}` };
    }
  }

  return { isValid: true };
}
