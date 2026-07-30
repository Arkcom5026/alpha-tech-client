import { describe, expect, it } from 'vitest';
import {
  projectBarcodeGenerationError,
  projectBarcodeGenerationOptions,
  projectBarcodeGenerationResult,
} from './barcodeGenerationProjection';

describe('barcodeGenerationProjection', () => {
  it('normalizes generation options', () => {
    expect(projectBarcodeGenerationOptions({ dryRun: true, lotLabelPerLot: '3' })).toEqual({
      dryRun: true,
      lotLabelPerLot: 3,
    });

    expect(projectBarcodeGenerationOptions({ lotLabelPerLot: 0 })).toEqual({
      dryRun: false,
      lotLabelPerLot: 1,
    });
  });

  it('projects generated barcode rows and preserves source evidence', () => {
    const response = {
      barcodes: [
        { id: 10, barcode: ' BC-001 ', kind: 'sn', qtyLabelsSuggested: 2 },
        { id: 11, barcode: '' },
      ],
    };

    const result = projectBarcodeGenerationResult(response);

    expect(result.generatedCount).toBe(1);
    expect(result.barcodes).toHaveLength(1);
    expect(result.barcodes[0]).toMatchObject({
      id: 10,
      barcode: 'BC-001',
      kind: 'SN',
      qtyLabelsSuggested: 2,
      generationIndex: 0,
    });
    expect(result.sourceResponse).toBe(response);
  });

  it('uses readable backend errors and hides generic axios status text', () => {
    expect(
      projectBarcodeGenerationError({ response: { data: { message: 'ใบรับสินค้าไม่พร้อมสร้างบาร์โค้ด' } } })
    ).toBe('ใบรับสินค้าไม่พร้อมสร้างบาร์โค้ด');

    expect(
      projectBarcodeGenerationError(new Error('Request failed with status code 500'))
    ).toBe('สร้างบาร์โค้ดไม่สำเร็จ');
  });
});
