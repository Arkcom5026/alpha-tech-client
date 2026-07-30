import { describe, expect, it } from 'vitest';
import {
  projectBarcodeScanError,
  projectCommitScanItems,
  projectCommitScanResult,
  projectReceivePayload,
  projectScanInput,
} from './barcodeScanProjection';

describe('barcode scan projection', () => {
  it('normalizes legacy and object scan inputs', () => {
    expect(projectScanInput(' BC-01 ', ' SN-01 ')).toMatchObject({
      barcode: 'BC-01',
      serialNumber: 'SN-01',
      keepSN: false,
    });

    expect(projectReceivePayload({ barcode: { barcode: 'BC-02', serialNumber: 'SN-02' }, keepSN: true }))
      .toEqual({ barcode: { barcode: 'BC-02', serialNumber: 'SN-02' }, keepSN: true });
  });

  it('filters invalid scan rows and preserves valid serial values', () => {
    expect(projectCommitScanItems([
      { barcode: ' A ', serialNumber: ' S1 ' },
      { barcode: 'B' },
      { barcode: ' ' },
      null,
    ])).toEqual([{ barcode: 'A', sn: 'S1' }, { barcode: 'B' }]);
  });

  it('normalizes commit result and user-facing errors', () => {
    const source = { ok: true, committed: ['A'], errors: [], message: 'done' };
    expect(projectCommitScanResult(source)).toMatchObject({
      ok: true,
      committed: ['A'],
      errors: [],
      message: 'done',
      sourceResponse: source,
    });

    expect(projectBarcodeScanError({ message: 'Request failed with status code 500' })).toBe('บันทึกข้อมูลการสแกนไม่สำเร็จ');
    expect(projectBarcodeScanError({ response: { data: { message: 'Serial ซ้ำ' } } })).toBe('Serial ซ้ำ');
  });
});
