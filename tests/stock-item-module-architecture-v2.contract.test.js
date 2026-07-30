import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const walk = (dir) => {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return [];

  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(relative) : [relative];
  });
};

describe('StockItem module architecture v2 contract', () => {
  it('retires the broad API facade while keeping the compatibility store on public slice boundaries', () => {
    const store = read('src/features/stockItem/store/stockItemStore.js');
    const receiveStoreSlice = read(
      'src/features/stockItem/receive/store/createStockItemReceiveSlice.js'
    );

    expect(exists('src/features/stockItem/api/stockItemApi.js')).toBe(false);
    expect(store).toContain("from '../receive/store/createStockItemReceiveSlice'");
    expect(store).toContain("from '../search'");
    expect(store).toContain("from '../availability'");
    expect(store).toContain("from '../sold'");
    expect(store).not.toContain('../api/stockItemApi');

    expect(store).toContain('...createStockItemReceiveSlice(set, get)');
    expect(store).not.toContain('receiveSNAction: async');
    expect(store).not.toContain('receiveAllPendingNoSNAction: async');
    expect(receiveStoreSlice).toContain('receiveSNAction: async');
    expect(receiveStoreSlice).toContain('receiveAllPendingNoSNAction: async');
    expect(store).toContain('searchStockItemAction');
    expect(store).toContain('loadAvailableStockItemsAction');
    expect(store).toContain('updateStockItemsToSoldAction');
  });

  it('locks receive ownership to the StockItem receive slice', () => {
    const receiveIndex = read('src/features/stockItem/receive/index.js');
    const receiveApi = read('src/features/stockItem/receive/api/receiveStockItemApi.js');
    const receiveService = read('src/features/stockItem/receive/services/receiveScannedStockItem.js');
    const receiveProjection = read('src/features/stockItem/receive/projections/stockItemReceiveProjection.js');
    const receiveStoreSlice = read(
      'src/features/stockItem/receive/store/createStockItemReceiveSlice.js'
    );

    expect(receiveIndex).toContain('receiveScannedStockItem');
    expect(receiveApi).toContain('/stock-items/receive-sn');
    expect(receiveService).toContain('receiveStockItemApi');
    expect(receiveProjection).toContain('project');
    expect(receiveStoreSlice).toContain("from '..'");
    expect(receiveStoreSlice).toContain('receiveScannedStockItem');
    expect(receiveStoreSlice).toContain('receiveAllPendingStockItems');
  });

  it('prevents Barcode and PurchaseOrderReceipt from owning StockItem transport or importing StockItem internals', () => {
    const protectedRoots = [
      'src/features/barcode',
      'src/features/purchaseOrderReceipt',
      'src/features/purchaseOrder',
    ];

    const sourceFiles = protectedRoots
      .flatMap(walk)
      .filter((file) => /\.(js|jsx|ts|tsx)$/.test(file));

    for (const file of sourceFiles) {
      const source = read(file);

      expect(source, file).not.toContain('/stock-items/receive-sn');
      expect(source, file).not.toContain('/stock-items/receive-all-no-sn');
      expect(source, file).not.toMatch(/features\/stockItem\/(api|store|receive\/(api|services|projections|store))/);
    }

    const barcodeScanService = read(
      'src/features/barcode/scan-serial/services/barcodeScanService.js'
    );
    expect(barcodeScanService).toContain("from '@/features/stockItem/receive'");
  });

  it('documents the current receive workflow composition boundary and completed facade retirement', () => {
    const page = read('src/features/stockItem/pages/ScanBarcodeListPage.jsx');
    const audit = read('docs/missions/stock-item-consumer-and-ownership-audit.md');

    expect(page).toContain("@/features/stockItem/store/stockItemStore");
    expect(page).toContain('receiveSNAction');
    expect(page).toContain('receiveAllPendingNoSNAction');

    expect(audit).toContain('StockItem owns receive-into-inventory mutations');
  });
});
