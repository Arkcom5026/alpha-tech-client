import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

describe('purchase order receipt finalization ownership contract', () => {
  it('keeps receipt finalization owned by PurchaseOrderReceipt', () => {
    const api = read('src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js');
    const ownerIndex = read('src/features/purchaseOrderReceipt/finalization/index.js');

    expect(api).toContain("from '../finalization'");
    expect(api).not.toContain('@/features/barcode/finalization');
    expect(ownerIndex).toContain('finalizeReceipt');
    expect(exists('src/features/barcode/finalization/index.js')).toBe(false);
    expect(exists('src/features/barcode/finalization/api/finalizeReceiptApi.js')).toBe(false);
    expect(exists('src/features/barcode/finalization/services/finalizeReceipt.js')).toBe(false);
    expect(exists('src/features/barcode/finalization/projections/receiptFinalizationProjection.js')).toBe(false);
  });
});
