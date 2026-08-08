import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const receiptApiPath = 'src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js';
const receiptStorePath = 'src/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore.js';
const barcodeStorePath = 'src/features/barcode/store/barcodeStore.js';

describe('purchase order receipt ownership certification', () => {
  it('keeps the complete receipt lifecycle inside PurchaseOrderReceipt', () => {
    const api = read(receiptApiPath);
    const store = read(receiptStorePath);

    for (const token of [
      'getAllReceipts',
      'getReceiptById',
      'createReceipt',
      'updateReceipt',
      'deleteReceipt',
      'markReceiptAsCompleted',
      'finalizeReceiptIfNeeded',
      'updateReceiptItemReceived',
      'finalizeReceipt',
      'getEligiblePurchaseOrders',
      'getPurchaseOrderDetailById',
    ]) {
      expect(api).toContain(token);
    }

    for (const token of [
      'createReceiptAction',
      'updateReceiptAction',
      'deleteReceiptAction',
      'markReceiptAsCompletedAction',
      'finalizeReceiptIfNeededAction',
      'fetchPurchaseOrdersForReceiptAction',
      'loadOrderByIdAction',
    ]) {
      expect(store).toContain(token);
    }
  });

  it('certifies that Receipt does not own Barcode runtime, state, or endpoints', () => {
    const api = read(receiptApiPath);
    const store = read(receiptStorePath);

    for (const token of [
      'generateReceiptBarcodes',
      'getReceiptBarcodeSummaries',
      'printReceipt',
      '/generate-barcodes',
      'receipt-barcode-summaries',
      '/barcodes/print',
      '/barcode-print',
      'generateBarcodesAction',
      'loadReceiptBarcodeSummariesAction',
      'printReceiptAction',
      'barcodePreview',
      'receiptBarcodeSummaries',
      'receiptBarcodeLoading',
    ]) {
      expect(api).not.toContain(token);
      expect(store).not.toContain(token);
    }
  });

  it('certifies that Barcode consumes Receipt only through context and finalization boundaries', () => {
    const barcodeStore = read(barcodeStorePath);

    expect(barcodeStore).toContain('getReceipt');
    expect(barcodeStore).toContain('finalizeReceipt');

    for (const token of [
      'createReceipt',
      'updateReceipt',
      'deleteReceipt',
      'updateReceiptItemReceived',
      'markReceiptAsCompleted',
      'markReceiptAsPrinted',
    ]) {
      expect(barcodeStore).not.toContain(token);
    }
  });
});
