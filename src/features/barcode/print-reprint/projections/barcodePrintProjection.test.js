import { describe, expect, it } from 'vitest';
import {
  expandBarcodePrintRows,
  projectBarcodePrintError,
  projectBarcodePrintRows,
  projectReprintSearchParams,
} from './barcodePrintProjection';

describe('barcode print projection', () => {
  it('normalizes reprint search parameters', () => {
    expect(projectReprintSearchParams({
      mode: 'po',
      query: ' PO-100 ',
      supplierKeyword: ' Supplier A ',
      limit: 999,
    })).toEqual({
      mode: 'PO',
      printed: true,
      limit: 50,
      query: 'PO-100',
      supplierKeyword: 'Supplier A',
    });
  });

  it('projects and expands LOT labels while retaining source evidence', () => {
    const sourceBarcode = {
      id: 10,
      barcode: 'LOT-001',
      kind: 'lot',
      qtyLabelsSuggested: 3,
      product: { name: 'หมึกพิมพ์', spec: 'สีดำ' },
    };

    const rows = projectBarcodePrintRows({ barcodes: [sourceBarcode] });
    expect(rows[0]).toMatchObject({
      id: 10,
      barcode: 'LOT-001',
      kind: 'LOT',
      quantity: 3,
      sourceBarcode,
    });
    expect(expandBarcodePrintRows(rows)).toHaveLength(3);
  });

  it('does not expose generic axios status text', () => {
    expect(projectBarcodePrintError(new Error('Request failed with status code 500')))
      .toBe('ดำเนินการพิมพ์บาร์โค้ดไม่สำเร็จ');
    expect(projectBarcodePrintError({ response: { data: { message: 'ไม่พบใบรับสินค้า' } } }))
      .toBe('ไม่พบใบรับสินค้า');
  });
});
