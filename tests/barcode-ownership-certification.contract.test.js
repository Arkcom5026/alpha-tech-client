import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const listFilesRecursively = (directory) => {
  const absoluteDirectory = path.join(root, directory);
  return fs.readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFilesRecursively(relativePath) : [relativePath];
  });
};

describe('barcode ownership certification contract', () => {
  it('keeps barcode lifecycle runtime behind slice public boundaries', () => {
    const store = read('src/features/barcode/store/barcodeStore.js');

    expect(exists('src/features/barcode/api/barcodeApi.js')).toBe(false);

    for (const boundary of [
      "from '../generation'",
      "from '../receipt-detail'",
      "from '../receipt-listing'",
      "from '../scan-listing'",
      "from '../serial'",
      "from '../print-reprint'",
    ]) {
      expect(store).toContain(boundary);
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

  it('does not allow Barcode to own StockItem receiving transport', () => {
    const barcodeFiles = listFilesRecursively('src/features/barcode').filter((file) =>
      /\.(js|jsx|ts|tsx)$/.test(file)
    );

    for (const file of barcodeFiles) {
      const source = read(file);
      for (const token of [
        'receiveScannedStockItemApi',
        '/stock-items/receive-sn',
        '/stock-items/receive-all-no-sn',
      ]) {
        expect(source, `${file} must not contain ${token}`).not.toContain(token);
      }
    }

    const scanService = read('src/features/barcode/scan-serial/services/barcodeScanService.js');
    expect(scanService).toContain("from '@/features/stockItem/receive'");
  });

  it('does not allow Barcode to own Receipt lifecycle mutation', () => {
    const store = read('src/features/barcode/store/barcodeStore.js');

    for (const token of [
      'createReceipt',
      'updateReceiptItemReceived',
      'deleteReceipt',
      'markReceiptAsCompleted',
      'markReceiptAsPrinted',
    ]) {
      expect(store).not.toContain(token);
    }
  });
});
