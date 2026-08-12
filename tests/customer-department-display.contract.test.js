import { describe, expect, it } from 'vitest';
import { getCustomerDisplayName } from '../src/features/customer/utils/customerDisplayName';

describe('customer department display contract', () => {
  it('adds the department to organization customer names', () => {
    expect(getCustomerDisplayName({
      type: 'GOVERNMENT',
      companyName: 'สำนักงานเทศบาลตำบลบรรพตพิสัย',
      departmentName: 'กองช่าง',
    })).toBe('สำนักงานเทศบาลตำบลบรรพตพิสัย · กองช่าง');
  });

  it('preserves standalone customer display behavior', () => {
    expect(getCustomerDisplayName({ type: 'INDIVIDUAL', name: 'สมชาย' })).toBe('สมชาย');
  });

  it('uses the configured fallback for missing customers', () => {
    expect(getCustomerDisplayName(null, 'ลูกค้าทั่วไป')).toBe('ลูกค้าทั่วไป');
  });
});
