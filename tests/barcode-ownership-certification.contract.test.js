import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const listFilesRecursively = (directory) => {
  const absoluteDirectory = path.join(root, directory);
  return fs.readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFilesRecursively(relativePath) : [relativePath];
  });
};

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

  it('does not allow Barcode to own StockItem receiving runtime anywhere in the module', () => {
    const barcodeFiles = listFilesRecursively('src/features/barcode').filter((file) =>
      /\.(js|jsx|ts|tsx)$/.test(file)
    );

    for (const file of barcodeFiles) {
      const source = read(file);
      for (const token of [
        'receiveStockItem',
        'receiveScannedStockItem',
        "@/features/stockItem/receive",
        '/stock-items/receive-sn',
        '/stock-items/receive-all-no-sn',
      ]) {
        expect(source, `${file} must not contain ${token}`).not.toContain(token);
      }
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
