import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('barcode store stock item boundary contract', () => {
  it('prevents Barcode store from owning StockItem receive runtime directly', () => {
    const barcodeStore = read('src/features/barcode/store/barcodeStore.js');

    expect(barcodeStore).not.toMatch(/\breceiveStockItem\b/);
    expect(barcodeStore).not.toMatch(/\breceiveAllPendingNoSN\b/);
    expect(barcodeStore).not.toMatch(/receiveSNAction\s*:/);
    expect(barcodeStore).not.toMatch(/receiveAllPendingNoSNAction\s*:/);
  });
});
