import { describe, expect, it } from 'vitest';

import {
  buildBrandDetachConfirmationKey,
  buildBrandToggleConfirmationKey,
  normalizeBrandActive,
  projectBrandErrorMessage,
} from './ListBrandPage';

describe('ListBrandPage ADS confirmation and error projection', () => {
  it('creates stable operation-scoped confirmation keys', () => {
    expect(buildBrandToggleConfirmationKey(7)).toBe('brand.toggleActive.7');
    expect(buildBrandDetachConfirmationKey(31)).toBe('brand.detachFromProductType.31');
  });

  it('projects normalized runtime errors without rendering object values directly', () => {
    expect(projectBrandErrorMessage({ message: 'BRAND_ALREADY_EXISTS', status: 409 })).toBe(
      'BRAND_ALREADY_EXISTS'
    );
    expect(projectBrandErrorMessage({ code: 'BRAND_NOT_FOUND' })).toBe('BRAND_NOT_FOUND');
    expect(projectBrandErrorMessage({ error: 'SERVICE_UNAVAILABLE' })).toBe('SERVICE_UNAVAILABLE');
    expect(projectBrandErrorMessage('NETWORK_ERROR')).toBe('NETWORK_ERROR');
  });

  it('uses a safe fallback for unknown error shapes', () => {
    expect(projectBrandErrorMessage({ status: 500 })).toBe('เกิดข้อผิดพลาดในการจัดการแบรนด์');
    expect(projectBrandErrorMessage(null)).toBe('');
  });

  it('preserves active compatibility across API response shapes', () => {
    expect(normalizeBrandActive({ isActive: false, active: true })).toBe(false);
    expect(normalizeBrandActive({ active: false })).toBe(false);
    expect(normalizeBrandActive({})).toBe(true);
  });
});
