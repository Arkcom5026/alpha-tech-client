import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

describe('stock item receive ownership contract', () => {
  it('keeps receive-into-stock runtime owned by StockItem', () => {
    const stockReceiveIndex = read('src/features/stockItem/receive/index.js');
    const stockReceiveApi = read('src/features/stockItem/receive/api/receiveStockItemApi.js');
    const barcodeApi = read('src/features/barcode/api/barcodeApi.js');

    expect(stockReceiveIndex).toMatch(/receiveScannedStockItem/);
    expect(stockReceiveApi).toMatch(/\/stock-items\/receive-sn/);
    expect(barcodeApi).toMatch(/@\/features\/stockItem\/receive/);
    expect(barcodeApi).not.toMatch(/from ['"]\.\.\/scan['"]/);

    for (const retiredPath of [
      'src/features/barcode/scan/index.js',
      'src/features/barcode/scan/api/receiveStockItemApi.js',
      'src/features/barcode/scan/projections/stockItemReceiveProjection.js',
      'src/features/barcode/scan/services/receiveScannedStockItem.js',
    ]) {
      expect(exists(retiredPath), `${retiredPath} must remain retired`).toBe(false);
    }
  });
});
