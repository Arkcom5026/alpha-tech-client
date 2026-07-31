import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

describe('stock item ownership certification contract', () => {
  it('keeps receive-into-stock runtime owned by StockItem receive slice and store', () => {
    const receiveIndex = read('src/features/stockItem/receive/index.js');
    const receiveService = read('src/features/stockItem/receive/services/receiveScannedStockItem.js');
    const receiveApi = read('src/features/stockItem/receive/api/receiveStockItemApi.js');
    const receiveAllApi = read('src/features/stockItem/receive/api/receiveAllPendingStockItemsApi.js');
    const receiveStoreSlice = read(
      'src/features/stockItem/receive/store/createStockItemReceiveSlice.js'
    );
    const receiveStore = read(
      'src/features/stockItem/receive/store/useStockItemReceiveStore.js'
    );

    expect(receiveIndex).toContain('receiveScannedStockItem');
    expect(receiveIndex).toContain('receiveAllPendingStockItems');
    expect(receiveService).toContain('receiveStockItemApi');
    expect(receiveApi).toContain('/stock-items/receive-sn');
    expect(receiveAllApi).toContain('/stock-items/receive-all-no-sn');
    expect(receiveStoreSlice).toContain('receiveSNAction');
    expect(receiveStoreSlice).toContain('receiveAllPendingNoSNAction');
    expect(receiveStoreSlice).toContain('clearScannedList');
    expect(receiveStore).toContain('createStockItemReceiveSlice');
    expect(exists('src/features/stockItem/store/stockItemStore.js')).toBe(false);
  });

  it('keeps search action runtime owned by the StockItem search slice', () => {
    const searchApi = read('src/features/stockItem/search/api/searchStockItemApi.js');
    const searchStoreSlice = read(
      'src/features/stockItem/search/store/createStockItemSearchSlice.js'
    );

    expect(searchApi).toContain('/stock-items/search');
    expect(searchStoreSlice).toContain("from '..'");
    expect(searchStoreSlice).toContain('searchStockItemAction: async');
    expect(searchStoreSlice).toContain('searchStockItem(query)');
  });

  it('keeps ready-for-sale queries and sold transitions in owned StockItem slices', () => {
    const availabilityApi = read('src/features/stockItem/availability/api/getAvailableStockItemsApi.js');
    const availabilityStoreSlice = read(
      'src/features/stockItem/availability/store/createStockItemAvailabilitySlice.js'
    );
    const soldApi = read('src/features/stockItem/sold/api/markStockItemsAsSoldApi.js');
    const soldStoreSlice = read(
      'src/features/stockItem/sold/store/createStockItemSoldSlice.js'
    );

    expect(availabilityApi).toContain('/stock-items/available');
    expect(availabilityStoreSlice).toContain("from '..'");
    expect(availabilityStoreSlice).toContain('loadAvailableStockItemsAction: async');
    expect(availabilityStoreSlice).toContain('loadAvailableStockItems(productId)');

    expect(soldApi).toContain('/stock-items/mark-sold');
    expect(soldStoreSlice).toContain("from '..'");
    expect(soldStoreSlice).toContain('updateStockItemsToSoldAction: async');
    expect(soldStoreSlice).toContain('markStockItemsAsSold(stockItemIds)');
  });

  it('prevents upstream procurement modules from owning StockItem transport or receive store internals', () => {
    const barcodeStore = read('src/features/barcode/store/barcodeStore.js');
    const barcodeScanApi = read('src/features/barcode/scan-serial/api/barcodeScanApi.js');
    const barcodeScanService = read('src/features/barcode/scan-serial/services/barcodeScanService.js');
    const receiptApi = read('src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js');
    const receiptStore = read('src/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore.js');
    const purchaseOrderApi = read('src/features/purchaseOrder/api/purchaseOrderApi.js');

    for (const source of [barcodeStore, barcodeScanApi, barcodeScanService, receiptApi, receiptStore, purchaseOrderApi]) {
      expect(source).not.toContain('/stock-items/receive-sn');
      expect(source).not.toContain('/stock-items/receive-all-no-sn');
      expect(source).not.toContain('receiveStockItemApi');
      expect(source).not.toContain('receiveScannedStockItemApi');
      expect(source).not.toContain('createStockItemReceiveSlice');
    }

    expect(barcodeScanService).toContain("from '@/features/stockItem/receive'");
  });
});