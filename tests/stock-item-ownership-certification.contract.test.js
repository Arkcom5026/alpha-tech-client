import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('stock item ownership certification contract', () => {
  it('keeps receive-into-stock runtime owned by StockItem', () => {
    const receiveIndex = read('src/features/stockItem/receive/index.js');
    const receiveService = read('src/features/stockItem/receive/services/receiveScannedStockItem.js');
    const stockItemApi = read('src/features/stockItem/api/stockItemApi.js');
    const stockItemStore = read('src/features/stockItem/store/stockItemStore.js');

    expect(receiveIndex).toContain('receiveScannedStockItem');
    expect(receiveService).toContain('receiveStockItemApi');
    expect(stockItemApi).toContain('/stock-items/receive-sn');
    expect(stockItemApi).toContain('/stock-items/receive-all-no-sn');
    expect(stockItemStore).toContain('receiveSNAction');
    expect(stockItemStore).toContain('receiveAllPendingNoSNAction');
  });

  it('keeps ready-for-sale queries and stock lifecycle transitions in StockItem', () => {
    const stockItemApi = read('src/features/stockItem/api/stockItemApi.js');
    const stockItemStore = read('src/features/stockItem/store/stockItemStore.js');

    expect(stockItemApi).toContain('/stock-items/search');
    expect(stockItemApi).toContain('/stock-items/available');
    expect(stockItemApi).toContain('/stock-items/mark-sold');
    expect(stockItemStore).toContain('searchStockItemAction');
    expect(stockItemStore).toContain('loadAvailableStockItemsAction');
    expect(stockItemStore).toContain('updateStockItemsToSoldAction');
  });

  it('prevents upstream procurement modules from owning StockItem transport', () => {
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
    }

    expect(barcodeScanService).toContain("from '@/features/stockItem/receive'");
  });
});
