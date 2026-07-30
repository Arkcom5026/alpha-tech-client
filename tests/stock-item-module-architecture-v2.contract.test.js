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
  it('retires the broad API facade while keeping the compatibility store on owned store slices and public boundaries', () => {
    const store = read('src/features/stockItem/store/stockItemStore.js');
    const receiveStoreSlice = read(
      'src/features/stockItem/receive/store/createStockItemReceiveSlice.js'
    );
    const searchStoreSlice = read(
      'src/features/stockItem/search/store/createStockItemSearchSlice.js'
    );
    const availabilityStoreSlice = read(
      'src/features/stockItem/availability/store/createStockItemAvailabilitySlice.js'
    );
    const soldStoreSlice = read(
      'src/features/stockItem/sold/store/createStockItemSoldSlice.js'
    );

    expect(exists('src/features/stockItem/api/stockItemApi.js')).toBe(false);
    expect(store).toContain("from '../receive/store/createStockItemReceiveSlice'");
    expect(store).toContain("from '../search/store/createStockItemSearchSlice'");
    expect(store).toContain(
      "from '../availability/store/createStockItemAvailabilitySlice'"
    );
    expect(store).toContain("from '../sold/store/createStockItemSoldSlice'");
    expect(store).not.toContain('../api/stockItemApi');

    expect(store).toContain('...createStockItemReceiveSlice(set, get)');
    expect(store).toContain('...createStockItemSearchSlice(set, get)');
    expect(store).toContain('...createStockItemAvailabilitySlice(set, get)');
    expect(store).toContain('...createStockItemSoldSlice(set, get)');
    expect(store).not.toContain('receiveSNAction: async');
    expect(store).not.toContain('receiveAllPendingNoSNAction: async');
    expect(store).not.toContain('searchStockItemAction: async');
    expect(store).not.toContain('loadAvailableStockItemsAction: async');
    expect(store).not.toContain('updateStockItemsToSoldAction: async');
    expect(receiveStoreSlice).toContain('receiveSNAction: async');
    expect(receiveStoreSlice).toContain('receiveAllPendingNoSNAction: async');
    expect(searchStoreSlice).toContain('searchStockItemAction: async');
    expect(availabilityStoreSlice).toContain('loadAvailableStockItemsAction: async');
    expect(soldStoreSlice).toContain('updateStockItemsToSoldAction: async');
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

  it('locks search action ownership to the StockItem search slice', () => {
    const searchIndex = read('src/features/stockItem/search/index.js');
    const searchStoreSlice = read(
      'src/features/stockItem/search/store/createStockItemSearchSlice.js'
    );
    const store = read('src/features/stockItem/store/stockItemStore.js');

    expect(searchIndex).toContain('searchStockItem');
    expect(searchStoreSlice).toContain("from '..'");
    expect(searchStoreSlice).toContain('searchStockItemAction: async');
    expect(searchStoreSlice).toContain('searchStockItem(query)');
    expect(store).toContain('...createStockItemSearchSlice(set, get)');
    expect(store).not.toContain('searchStockItemAction: async');
  });

  it('locks availability action ownership to the StockItem availability slice', () => {
    const availabilityIndex = read('src/features/stockItem/availability/index.js');
    const availabilityStoreSlice = read(
      'src/features/stockItem/availability/store/createStockItemAvailabilitySlice.js'
    );
    const store = read('src/features/stockItem/store/stockItemStore.js');

    expect(availabilityIndex).toContain('loadAvailableStockItems');
    expect(availabilityStoreSlice).toContain("from '..'");
    expect(availabilityStoreSlice).toContain('loadAvailableStockItemsAction: async');
    expect(availabilityStoreSlice).toContain('loadAvailableStockItems(productId)');
    expect(store).toContain('...createStockItemAvailabilitySlice(set, get)');
    expect(store).not.toContain('loadAvailableStockItemsAction: async');
  });

  it('locks sold action ownership to the StockItem sold slice', () => {
    const soldIndex = read('src/features/stockItem/sold/index.js');
    const soldStoreSlice = read(
      'src/features/stockItem/sold/store/createStockItemSoldSlice.js'
    );
    const store = read('src/features/stockItem/store/stockItemStore.js');

    expect(soldIndex).toContain('markStockItemsAsSold');
    expect(soldStoreSlice).toContain("from '..'");
    expect(soldStoreSlice).toContain('updateStockItemsToSoldAction: async');
    expect(soldStoreSlice).toContain('markStockItemsAsSold(stockItemIds)');
    expect(store).toContain('...createStockItemSoldSlice(set, get)');
    expect(store).not.toContain('updateStockItemsToSoldAction: async');
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

  it('documents the receive store boundary cutover and completed facade retirement', () => {
    const page = read('src/features/stockItem/pages/ScanBarcodeListPage.jsx');
    const audit = read('docs/missions/stock-item-consumer-and-ownership-audit.md');

    expect(page).toContain(
      '@/features/stockItem/receive/store/useStockItemReceiveStore'
    );
    expect(page).not.toContain('@/features/stockItem/store/stockItemStore');
    expect(page).toContain('receiveSNAction');
    expect(page).toContain('receiveAllPendingNoSNAction');

    expect(audit).toContain('StockItem owns receive-into-inventory mutations');
  });
});
