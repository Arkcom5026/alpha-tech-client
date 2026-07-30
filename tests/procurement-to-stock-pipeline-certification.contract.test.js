import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const purchaseOrderApi = () => read('src/features/purchaseOrder/api/purchaseOrderApi.js');
const receiptApi = () => read('src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js');
const receiptStore = () => read('src/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore.js');
const barcodeStore = () => read('src/features/barcode/store/barcodeStore.js');
const barcodeScanService = () => read('src/features/barcode/scan-serial/services/barcodeScanService.js');
const stockItemApi = () => read('src/features/stockItem/api/stockItemApi.js');
const stockItemStore = () => read('src/features/stockItem/store/stockItemStore.js');
const stockItemReceiveBoundary = () => read('src/features/stockItem/receive/index.js');

const expectAbsentFromAll = (token, sources) => {
  for (const source of sources) expect(source).not.toContain(token);
};

describe('procurement-to-stock pipeline ownership certification', () => {
  it('keeps each stage responsible for its own business runtime', () => {
    expect(purchaseOrderApi()).toContain('updatePurchaseOrderStatus');

    expect(receiptApi()).toContain('createReceipt');
    expect(receiptApi()).toContain('updateReceiptItemReceived');
    expect(receiptApi()).toContain('finalizeReceipt');

    expect(barcodeStore()).toContain("from '../generation'");
    expect(barcodeStore()).toContain("from '../serial'");
    expect(barcodeStore()).toContain("from '../print-reprint'");
    expect(barcodeStore()).toContain('generateBarcodesAction');

    expect(stockItemApi()).toContain('/stock-items/receive-sn');
    expect(stockItemApi()).toContain('/stock-items/receive-all-no-sn');
    expect(stockItemApi()).toContain('/stock-items/available');
    expect(stockItemStore()).toContain('receiveSNAction');
    expect(stockItemReceiveBoundary()).toContain('receiveScannedStockItem');
  });

  it('prevents upstream modules from owning downstream runtime', () => {
    const po = purchaseOrderApi();
    const receiptSources = [receiptApi(), receiptStore()];
    const barcodeSources = [barcodeStore(), barcodeScanService()];

    expectAbsentFromAll('/stock-items/receive-sn', [po, ...receiptSources, ...barcodeSources]);
    expectAbsentFromAll('/stock-items/receive-all-no-sn', [po, ...receiptSources, ...barcodeSources]);
    expectAbsentFromAll('receiveScannedStockItemApi', [po, ...receiptSources, ...barcodeSources]);

    expectAbsentFromAll('generateReceiptBarcodes', [po, ...receiptSources]);
    expectAbsentFromAll('generateMissingBarcodes', [po, ...receiptSources]);
    expectAbsentFromAll('reprintBarcodes', [po, ...receiptSources]);
  });

  it('prevents downstream modules from owning upstream lifecycle', () => {
    const barcodeSources = [barcodeStore(), barcodeScanService()];
    const stockSources = [stockItemApi(), stockItemStore(), stockItemReceiveBoundary()];

    expectAbsentFromAll('createReceipt', [...barcodeSources, ...stockSources]);
    expectAbsentFromAll('updateReceiptItemReceived', [...barcodeSources, ...stockSources]);
    expectAbsentFromAll('deleteReceipt', [...barcodeSources, ...stockSources]);
    expectAbsentFromAll('createPurchaseOrder', [...barcodeSources, ...stockSources]);
  });

  it('requires cross-module dependencies to use public feature boundaries', () => {
    const barcode = barcodeStore();
    const scanService = barcodeScanService();
    const stockBoundary = stockItemReceiveBoundary();

    expect(barcode).toContain('@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi');
    expect(scanService).toContain("@/features/stockItem/receive");
    expect(stockBoundary).toContain("export { receiveScannedStockItem }");

    expect(barcode).not.toContain('/stock-items/');
    expect(scanService).not.toContain('/stock-items/');
    expect(receiptStore()).not.toContain('/barcodes/');
  });
});
