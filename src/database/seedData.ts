import { ParkingZone } from '../types/parking';

/**
 * Seed dataset of representative parking zones across Dubai and UAE emirates,
 * prominently featuring Dubai Community 318 (Al Karama: Zone 318C and 318A/B/D)
 * where the user was fined.
 */
export const SEED_PARKING_ZONES: ParkingZone[] = [
  // 1. DUBAI - AL KARAMA (Zone 318C - On-street Residential / Mixed)
  {
    id: 'DXB_318C',
    emirateId: 'DXB',
    zoneCode: '318C',
    communityNumber: 318,
    areaNameEn: 'Al Karama (Residential Roadside)',
    areaNameAr: 'الكرامة',
    zoneCategory: 'C',
    tariffOffpeakHourly: 2,
    tariffPeakHourly: 4,
    maxStayHours: 4,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    fillColor: 'rgba(76, 175, 80, 0.35)', // Green
    strokeColor: '#388E3C',
    polygonCoords: [
      { latitude: 25.2390, longitude: 55.2980 },
      { latitude: 25.2440, longitude: 55.3080 },
      { latitude: 25.2445, longitude: 55.3080 },
      { latitude: 25.2445, longitude: 55.2980 },
      { latitude: 25.2390, longitude: 55.2980 },
    ],
  },

  // 2. DUBAI - AL KARAMA COMMERCIAL (Zone 318A - Roadside Commercial Hub)
  {
    id: 'DXB_318A',
    emirateId: 'DXB',
    zoneCode: '318A',
    communityNumber: 318,
    areaNameEn: 'Al Karama (Commercial Center)',
    areaNameAr: 'الكرامة - تجاري',
    zoneCategory: 'A',
    tariffOffpeakHourly: 4,
    tariffPeakHourly: 4,
    maxStayHours: 4,
    allowsHalfHour: true,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    fillColor: 'rgba(255, 152, 0, 0.35)', // Orange
    strokeColor: '#F57C00',
    polygonCoords: [
      { latitude: 25.2450, longitude: 55.3000 },
      { latitude: 25.2475, longitude: 55.3060 },
      { latitude: 25.2500, longitude: 55.3050 },
      { latitude: 25.2480, longitude: 55.2995 },
      { latitude: 25.2450, longitude: 55.3000 },
    ],
  },

  // 3. DUBAI - AL JAFFILIYA / RTA HQ (Zone 332A - Commercial)
  {
    id: 'DXB_332A',
    emirateId: 'DXB',
    zoneCode: '332A',
    communityNumber: 332,
    areaNameEn: 'Al Jaffiliya / Zabeel',
    areaNameAr: 'الجافلية',
    zoneCategory: 'A',
    tariffOffpeakHourly: 4,
    tariffPeakHourly: 4,
    maxStayHours: 4,
    allowsHalfHour: true,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    fillColor: 'rgba(255, 152, 0, 0.35)',
    strokeColor: '#F57C00',
    polygonCoords: [
      { latitude: 25.2280, longitude: 55.2930 },
      { latitude: 25.2340, longitude: 55.3020 },
      { latitude: 25.2395, longitude: 55.2975 },
      { latitude: 25.2335, longitude: 55.2890 },
      { latitude: 25.2280, longitude: 55.2930 },
    ],
  },

  // 4. DUBAI - AL MANKHOOL (Zone 334C - Residential Roadside)
  {
    id: 'DXB_334C',
    emirateId: 'DXB',
    zoneCode: '334C',
    communityNumber: 334,
    areaNameEn: 'Al Mankhool',
    areaNameAr: 'المنخول',
    zoneCategory: 'C',
    tariffOffpeakHourly: 2,
    tariffPeakHourly: 4,
    maxStayHours: 4,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    fillColor: 'rgba(76, 175, 80, 0.35)',
    strokeColor: '#388E3C',
    polygonCoords: [
      { latitude: 25.2430, longitude: 55.2850 },
      { latitude: 25.2485, longitude: 55.2960 },
      { latitude: 25.2570, longitude: 55.2910 },
      { latitude: 25.2510, longitude: 55.2800 },
      { latitude: 25.2430, longitude: 55.2850 },
    ],
  },

  // 5. DUBAI - BUSINESS BAY (Zone 346A)
  {
    id: 'DXB_346A',
    emirateId: 'DXB',
    zoneCode: '346A',
    communityNumber: 346,
    areaNameEn: 'Business Bay',
    areaNameAr: 'الخليج التجاري',
    zoneCategory: 'A',
    tariffOffpeakHourly: 4,
    tariffPeakHourly: 4,
    maxStayHours: 4,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    fillColor: 'rgba(255, 152, 0, 0.35)',
    strokeColor: '#F57C00',
    polygonCoords: [
      { latitude: 25.1800, longitude: 55.2600 },
      { latitude: 25.1950, longitude: 55.2750 },
      { latitude: 25.1900, longitude: 55.2850 },
      { latitude: 25.1750, longitude: 55.2700 },
      { latitude: 25.1800, longitude: 55.2600 },
    ],
  },

  // 6. ABU DHABI - CORNICHE STANDARD (Zone S)
  {
    id: 'AUH_CORNICHE_S',
    emirateId: 'AUH',
    zoneCode: 'S',
    areaNameEn: 'Abu Dhabi Corniche (Standard)',
    areaNameAr: 'كورنيش أبوظبي',
    zoneCategory: 'S',
    tariffOffpeakHourly: 2,
    tariffPeakHourly: 2,
    tariffDailyCap: 15,
    maxStayHours: 24,
    paidStart: '08:00',
    paidEnd: '00:00',
    freeOnSunday: true,
    freeOnFriday: false,
    fillColor: 'rgba(0, 188, 212, 0.35)', // Turquoise
    strokeColor: '#0097A7',
    polygonCoords: [
      { latitude: 24.4700, longitude: 54.3300 },
      { latitude: 24.4950, longitude: 54.3650 },
      { latitude: 24.4850, longitude: 54.3750 },
      { latitude: 24.4600, longitude: 54.3400 },
      { latitude: 24.4700, longitude: 54.3300 },
    ],
  },

  // 7. SHARJAH - AL MAJAZ WATERFRONT (Standard Paid)
  {
    id: 'SHJ_AL_MAJAZ',
    emirateId: 'SHJ',
    zoneCode: '5566',
    areaNameEn: 'Al Majaz Waterfront',
    areaNameAr: 'واجهة المجاز المائية',
    zoneCategory: 'A',
    tariffOffpeakHourly: 2,
    tariffPeakHourly: 2,
    maxStayHours: 5,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: false,
    freeOnFriday: true,
    fillColor: 'rgba(156, 39, 176, 0.35)', // Purple
    strokeColor: '#7B1FA2',
    polygonCoords: [
      { latitude: 25.3200, longitude: 55.3750 },
      { latitude: 25.3350, longitude: 55.3950 },
      { latitude: 25.3250, longitude: 55.4050 },
      { latitude: 25.3100, longitude: 55.3850 },
      { latitude: 25.3200, longitude: 55.3750 },
    ],
  },

  // 8. AJMAN - CORNICHE ROAD
  {
    id: 'AJM_CORNICHE',
    emirateId: 'AJM',
    zoneCode: '5155',
    areaNameEn: 'Ajman Corniche',
    areaNameAr: 'كورنيش عجمان',
    zoneCategory: 'A',
    tariffOffpeakHourly: 2,
    tariffPeakHourly: 2,
    maxStayHours: 4,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: false,
    freeOnFriday: true,
    fillColor: 'rgba(233, 30, 99, 0.35)', // Pink/Red
    strokeColor: '#C2185B',
    polygonCoords: [
      { latitude: 25.4050, longitude: 55.4250 },
      { latitude: 25.4250, longitude: 55.4450 },
      { latitude: 25.4180, longitude: 55.4550 },
      { latitude: 25.3980, longitude: 55.4350 },
      { latitude: 25.4050, longitude: 55.4250 },
    ],
  },
];
