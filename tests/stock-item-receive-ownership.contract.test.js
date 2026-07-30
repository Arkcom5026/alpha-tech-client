import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const stockReceiveIndex = read('src/features/stockItem/receive/index.js');
const stockReceiveApi = read('src/features/stockItem/receive/api/receiveStockItemApi.js');
const barcodeApi = read('src/features/barcode/api/barcodeApi.js');

assert.match(
  stockReceiveIndex,
  /receiveScannedStockItem/,
  'StockItem must publish the receive-into-stock runtime boundary'
);

assert.match(
  stockReceiveApi,
  /\/stock-items\/receive-sn/,
  'The receive-stock endpoint must be owned by StockItem'
);

assert.match(
  barcodeApi,
  /@\/features\/stockItem\/receive/,
  'Barcode compatibility code must delegate to the StockItem public boundary'
);

assert.doesNotMatch(
  barcodeApi,
  /from ['"]\.\.\/scan['"]/,
  'Barcode must not delegate stock receiving to an internal Barcode scan slice'
);

for (const retiredPath of [
  'src/features/barcode/scan/index.js',
  'src/features/barcode/scan/api/receiveStockItemApi.js',
  'src/features/barcode/scan/projections/stockItemReceiveProjection.js',
  'src/features/barcode/scan/services/receiveScannedStockItem.js',
]) {
  assert.equal(exists(retiredPath), false, `${retiredPath} must remain retired`);
}

console.log('stock-item receive ownership contract: PASS');
