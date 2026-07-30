import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('barcode ownership certification contract', () => {
  it('keeps barcode lifecycle runtime inside the Barcode module', () => {
    const api = read('src/features/barcode/api/barcodeApi.js');
    const store = read('src/features/barcode/store/barcodeStore.js');

    for (const token of [
      'generateMissingBarcodes',
      'getBarcodesByReceiptId',
      'auditReceiptBarcodes',
      'getReceiptsWithBarcodes',
      'getReceiptsReadyToScanSN',
      'getReceiptsReadyToScan',
      'updateSerialNumber',
      'markBarcodesAsPrinted',
      'reprintBarcodes',
      'searchReprintReceipts',
      'commitScans',
    ]) {
      expect(api).toContain(token);
    }

    for (const token of [
      'generateBarcodesAction',
      'fetchPrintBatchAction',
      'reprintBarcodesAction',
      'updateSerialNumberAction',
      'markBarcodeAsPrintedAction',
    ]) {
      expect(store).toContain(token);
    }
  });

  it('does not allow Barcode to own StockItem receiving runtime', () => {
    const api = read('src/features/barcode/api/barcodeApi.js');
    const store = read('src/features/barcode/store/barcodeStore.js');

    for (const token of [
      'receiveStockItem',
      'receiveScannedStockItem',
      "@/features/stockItem/receive",
      '/stock-items/receive-sn',
    ]) {
      expect(api).not.toContain(token);
      expect(store).not.toContain(token);
    }
  });

  it('does not allow Barcode to own Receipt lifecycle mutation', () => {
    const api = read('src/features/barcode/api/barcodeApi.js');
    const store = read('src/features/barcode/store/barcodeStore.js');

    for (const token of [
      'createReceipt',
      'updateReceiptItemReceived',
      'deleteReceipt',
      'markReceiptAsCompleted',
      'markReceiptAsPrinted',
    ]) {
      expect(api).not.toContain(token);
      expect(store).not.toContain(token);
    }
  });
});
