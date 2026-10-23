import { calculateParkingTariff } from '../../src/utils/tariffCalculator';
import { ParkingZone } from '../../src/types/parking';

describe('tariffCalculator', () => {
  const zone318C: ParkingZone = {
    id: '318C',
    emirateId: 'DXB',
    zoneCode: '318C',
    areaNameEn: 'Al Karama',
    zoneCategory: 'C',
    tariffOffpeakHourly: 2,
    tariffPeakHourly: 4,
    maxStayHours: 4,
    paidStart: '08:00',
    paidEnd: '22:00',
    freeOnSunday: true,
    freeOnFriday: false,
    polygonCoords: [],
  };

  test('calculates off-peak rate for 2 hours in Zone 318C (AED 4)', () => {
    // Monday at 11 AM (Off-peak)
    const offPeakDate = new Date('2026-10-26T11:00:00');
    const result = calculateParkingTariff(zone318C, 2, offPeakDate);
    expect(result.totalCostAED).toBe(4);
    expect(result.isFree).toBe(false);
  });

  test('calculates peak rate for 1 hour in Zone 318C (AED 4)', () => {
    // Monday at 9 AM (Peak: 8-10 AM)
    const peakDate = new Date('2026-10-26T09:00:00');
    const result = calculateParkingTariff(zone318C, 1, peakDate);
    expect(result.totalCostAED).toBe(4);
    expect(result.isPeak).toBe(true);
  });

  test('calculates 0 AED on Sunday in Dubai', () => {
    const sundayDate = new Date('2026-10-25T11:00:00');
    const result = calculateParkingTariff(zone318C, 2, sundayDate);
    expect(result.totalCostAED).toBe(0);
    expect(result.isFree).toBe(true);
  });
});
