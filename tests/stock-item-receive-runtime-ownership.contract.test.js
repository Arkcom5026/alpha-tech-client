import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('StockItem receive runtime ownership contract', () => {
  it('publishes both scanned and bulk receive capabilities from the receive slice', () => {
    const receiveIndex = read('src/features/stockItem/receive/index.js');

    expect(receiveIndex).toContain('receiveScannedStockItem');
    expect(receiveIndex).toContain('receiveAllPendingStockItems');
    expect(receiveIndex).toContain('receiveStockItemApi');
    expect(receiveIndex).toContain('receiveAllPendingStockItemsApi');
  });

  it('owns receive transports inside the receive slice', () => {
    const scannedTransport = read(
      'src/features/stockItem/receive/api/receiveStockItemApi.js'
    );
    const bulkTransport = read(
      'src/features/stockItem/receive/api/receiveAllPendingStockItemsApi.js'
    );

    expect(scannedTransport).toContain('/stock-items/receive-sn');
    expect(bulkTransport).toContain('/stock-items/receive-all-no-sn');
  });

  it('keeps receive actions owned directly by the receive store slice', () => {
    const receiveStoreSlice = read(
      'src/features/stockItem/receive/store/createStockItemReceiveSlice.js'
    );

    expect(receiveStoreSlice).toMatch(/from\s+['"]\.\.['"]/);
    expect(receiveStoreSlice).toContain('receiveSNAction: async');
    expect(receiveStoreSlice).toContain('receiveAllPendingNoSNAction: async');
    expect(receiveStoreSlice).toContain('receiveScannedStockItem');
    expect(receiveStoreSlice).toContain('receiveAllPendingStockItems');
    expect(receiveStoreSlice).not.toContain('/stock-items/receive-sn');
    expect(receiveStoreSlice).not.toContain('/stock-items/receive-all-no-sn');
  });
});
