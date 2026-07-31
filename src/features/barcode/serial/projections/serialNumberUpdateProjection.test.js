import { describe, expect, it } from 'vitest';
import {
  projectSerialNumberUpdateInput,
  projectSerialNumberUpdateResult,
} from './serialNumberUpdateProjection';

describe('serial number update projection', () => {
  it('normalizes barcode and serial number', () => {
    expect(
      projectSerialNumberUpdateInput({ barcode: ' BC-001 ', serialNumber: ' SN-9 ' })
    ).toEqual({ barcode: 'BC-001', serialNumber: 'SN-9' });
  });

  it('preserves an explicitly cleared serial number', () => {
    expect(projectSerialNumberUpdateInput({ barcode: 'BC-001', serialNumber: null })).toEqual({
      barcode: 'BC-001',
      serialNumber: '',
    });
  });

  it('rejects a missing barcode', () => {
    expect(() => projectSerialNumberUpdateInput({ serialNumber: 'SN-9' })).toThrow(
      'Missing barcode'
    );
  });

  it('preserves the backend response as source authority', () => {
    const sourceResponse = { ok: true, barcode: 'BC-001' };
    expect(projectSerialNumberUpdateResult(sourceResponse)).toEqual({ sourceResponse });
  });
});
