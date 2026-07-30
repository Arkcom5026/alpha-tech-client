import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('purchase order receipt barcode consumer boundary contract', () => {
  it('keeps barcode runtime consumers inside the Barcode module', () => {
    const barcodeStore = read('src/features/barcode/store/barcodeStore.js');

    expect(barcodeStore).toContain('generateBarcodesAction');
    expect(barcodeStore).toContain('fetchPrintBatchAction');
    expect(barcodeStore).toContain('reprintBarcodesAction');
  });

  it('prevents Receipt consumers from calling removed barcode operations through Receipt API', () => {
    const receiptStore = read('src/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore.js');
    const receiptApi = read('src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js');

    for (const token of [
      'generateReceiptBarcodes',
      'getReceiptBarcodeSummaries',
      'printReceipt',
      'loadReceiptBarcodeSummariesAction',
      'generateBarcodesAction',
      'printReceiptAction',
      'barcodePreview',
      'receiptBarcodeSummaries',
      'receiptBarcodeLoading',
    ]) {
      expect(receiptStore).not.toContain(token);
      expect(receiptApi).not.toContain(token);
    }
  });

  it('allows Barcode to depend on Receipt only for receipt context and finalization', () => {
    const barcodeStore = read('src/features/barcode/store/barcodeStore.js');

    expect(barcodeStore).toContain('getReceiptById');
    expect(barcodeStore).toContain('finalizeReceiptIfNeeded');
    expect(barcodeStore).not.toContain('markReceiptAsPrinted');
    expect(barcodeStore).not.toContain('createReceipt');
    expect(barcodeStore).not.toContain('updateReceiptItemReceived');
  });
});
