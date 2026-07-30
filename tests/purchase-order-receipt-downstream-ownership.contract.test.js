import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('purchase order receipt downstream ownership contract', () => {
  it('keeps receipt confirmation owned by PurchaseOrderReceipt', () => {
    const api = read('src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js');
    const store = read('src/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore.js');

    expect(api).toContain('createReceipt');
    expect(api).toContain('updateReceiptItemReceived');
    expect(api).toContain('finalizeReceipt');
    expect(store).toContain('finalizeReceiptIfNeededAction');
  });

  it('does not allow PurchaseOrderReceipt to own barcode generation or barcode printing runtime', () => {
    const api = read('src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js');
    const store = read('src/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore.js');

    expect(api).not.toContain('generateReceiptBarcodes');
    expect(api).not.toContain('/generate-barcodes');
    expect(api).not.toContain('printReceipt');
    expect(api).not.toContain('/print');

    expect(store).not.toContain('generateBarcodesAction');
    expect(store).not.toContain('printReceiptAction');
    expect(store).not.toContain('barcodePreview');
  });

  it('does not allow PurchaseOrderReceipt to own barcode summary state', () => {
    const api = read('src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js');
    const store = read('src/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore.js');

    expect(api).not.toContain('getReceiptBarcodeSummaries');
    expect(api).not.toContain('receipt-barcode-summaries');
    expect(store).not.toContain('receiptBarcodeSummaries');
    expect(store).not.toContain('receiptBarcodeLoading');
  });
});
