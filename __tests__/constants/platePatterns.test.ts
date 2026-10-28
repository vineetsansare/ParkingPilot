import { EMIRATE_PLATE_CONFIGS, ALL_EMIRATES, validatePlateInput } from '../../src/constants/platePatterns';

describe('platePatterns & Emirates Validation', () => {
  it('covers all 7 UAE Emirates', () => {
    expect(ALL_EMIRATES).toHaveLength(7);
    expect(ALL_EMIRATES).toEqual(
      expect.arrayContaining(['DXB', 'AUH', 'SHJ', 'AJM', 'RAK', 'UAQ', 'FUJ'])
    );
  });

  describe('Dubai (DXB) Plate Validation', () => {
    const config = EMIRATE_PLATE_CONFIGS.DXB;

    it('requires letter codes up to 2 chars and digits 1-5', () => {
      expect(config.codeType).toBe('letter');
      expect(validatePlateInput('DXB', 'A', '12345').isValid).toBe(true);
      expect(validatePlateInput('DXB', 'AA', '99').isValid).toBe(true);
      expect(validatePlateInput('DXB', '1', '12345').isValid).toBe(false);
      expect(validatePlateInput('DXB', 'A', '123456').isValid).toBe(false);
    });
  });

  describe('Abu Dhabi (AUH) Plate Validation', () => {
    const config = EMIRATE_PLATE_CONFIGS.AUH;

    it('requires numeric category code and digits 1-5', () => {
      expect(config.codeType).toBe('number');
      expect(config.allowedCodes).toContain('1');
      expect(config.allowedCodes).toContain('4');
      expect(config.allowedCodes).toContain('17');
      expect(validatePlateInput('AUH', '4', '8888').isValid).toBe(true);
      expect(validatePlateInput('AUH', 'A', '8888').isValid).toBe(false);
    });
  });

  describe('Sharjah (SHJ) Plate Validation', () => {
    const config = EMIRATE_PLATE_CONFIGS.SHJ;

    it('requires numeric category code (1 through 5)', () => {
      expect(config.codeType).toBe('number');
      expect(config.allowedCodes).toEqual(['1', '2', '3', '4', '5']);
      expect(validatePlateInput('SHJ', '1', '4521').isValid).toBe(true);
      expect(validatePlateInput('SHJ', '9', '4521').isValid).toBe(false);
    });
  });

  describe('Northern Emirates (AJM, RAK, UAQ, FUJ)', () => {
    it('validates single letter codes and digits', () => {
      expect(validatePlateInput('AJM', 'B', '1234').isValid).toBe(true);
      expect(validatePlateInput('RAK', 'C', '555').isValid).toBe(true);
      expect(validatePlateInput('UAQ', 'A', '12').isValid).toBe(true);
      expect(validatePlateInput('FUJ', 'M', '7').isValid).toBe(true);
    });
  });
});
