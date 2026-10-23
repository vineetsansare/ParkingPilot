import { isPaidParkingTime, isFreeDay } from '../../src/utils/timeUtils';

describe('timeUtils', () => {
  test('Sunday is free in Dubai', () => {
    // 2026-10-25 is a Sunday
    const sundayDate = new Date('2026-10-25T12:00:00');
    expect(isFreeDay('DXB', sundayDate)).toBe(true);
    expect(isPaidParkingTime('DXB', sundayDate)).toBe(false);
  });

  test('Monday at 10 AM is paid in Dubai', () => {
    // 2026-10-26 is Monday
    const mondayMorning = new Date('2026-10-26T10:00:00');
    expect(isFreeDay('DXB', mondayMorning)).toBe(false);
    expect(isPaidParkingTime('DXB', mondayMorning)).toBe(true);
  });

  test('Monday at 11 PM is free in Dubai (paid hours end at 10 PM)', () => {
    const mondayNight = new Date('2026-10-26T23:00:00');
    expect(isPaidParkingTime('DXB', mondayNight)).toBe(false);
  });

  test('Friday is free in Sharjah', () => {
    // 2026-10-23 is Friday
    const friday = new Date('2026-10-23T11:00:00');
    expect(isFreeDay('SHJ', friday)).toBe(true);
    expect(isPaidParkingTime('SHJ', friday)).toBe(false);
  });

  test('Ajman split-shift afternoon window (1 PM - 5 PM) is free', () => {
    // Monday at 2 PM
    const mondayAfternoon = new Date('2026-10-26T14:00:00');
    expect(isPaidParkingTime('AJM', mondayAfternoon)).toBe(false);
  });

  test('Ajman evening shift (5 PM - 10 PM) is paid', () => {
    // Monday at 6 PM
    const mondayEvening = new Date('2026-10-26T18:00:00');
    expect(isPaidParkingTime('AJM', mondayEvening)).toBe(true);
  });
});
