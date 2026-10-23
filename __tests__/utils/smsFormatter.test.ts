import { formatSmsMessage, formatWhatsAppMessage, getSmsRecipient } from '../../src/utils/smsFormatter';
import { Vehicle, ParkingZone } from '../../src/types/parking';

describe('smsFormatter', () => {
  const dxbVehicle: Vehicle = {
    id: '1',
    plateCode: 'A',
    plateNumber: '12345',
    emirateCode: 'DXB',
    isDefault: true,
    displayName: 'My Car',
  };

  const auhVehicle: Vehicle = {
    id: '2',
    plateCode: '13',
    plateNumber: '99887',
    emirateCode: 'AUH',
    isDefault: false,
    displayName: 'Abu Dhabi Car',
  };

  const karamaZone: ParkingZone = {
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

  const auhZone: ParkingZone = {
    id: 'AUH_STD',
    emirateId: 'AUH',
    zoneCode: 'S',
    areaNameEn: 'Corniche Standard',
    zoneCategory: 'S',
    tariffOffpeakHourly: 2,
    tariffPeakHourly: 2,
    maxStayHours: 24,
    paidStart: '08:00',
    paidEnd: '00:00',
    freeOnSunday: true,
    freeOnFriday: false,
    polygonCoords: [],
  };

  test('formats Dubai SMS correctly for Dubai plate: A12345 318C 2', () => {
    const message = formatSmsMessage(dxbVehicle, karamaZone, 2);
    expect(message).toBe('A12345 318C 2');
    expect(getSmsRecipient('DXB')).toBe('7275');
  });

  test('formats Dubai SMS for Abu Dhabi vehicle: AUH13 99887 318C 1', () => {
    const message = formatSmsMessage(auhVehicle, karamaZone, 1);
    expect(message).toBe('AUH13 99887 318C 1');
  });

  test('formats Abu Dhabi SMS for Abu Dhabi vehicle: AUH13 99887 S 2', () => {
    const message = formatSmsMessage(auhVehicle, auhZone, 2);
    expect(message).toBe('AUH13 99887 S 2');
    expect(getSmsRecipient('AUH')).toBe('3009');
  });

  test('formats WhatsApp message for Dubai: same format as SMS', () => {
    const message = formatWhatsAppMessage(dxbVehicle, karamaZone, 1);
    expect(message).toBe('A12345 318C 1');
  });
});
