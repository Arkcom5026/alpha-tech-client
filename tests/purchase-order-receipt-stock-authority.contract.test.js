import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const receiptComponent = () =>
  read('src/features/purchaseOrderReceipt/components/POItemListForReceipt.jsx');
const barcodeStore = () => read('src/features/barcode/store/barcodeStore.js');
const stockReceiveApi = () => read('src/features/stockItem/receive/api/receiveStockItemApi.js');

describe('purchase receipt to stock authority', () => {
  it('keeps the RC screen from declaring PO received before stock evidence exists', () => {
    const source = receiptComponent();

    expect(source).not.toContain('updatePurchaseOrderStatusAction');
    expect(source).not.toContain("statusToSet = allDone ? 'RECEIVED' : 'PARTIALLY_RECEIVED'");
    expect(source).toContain('ยังไม่ถือว่า StockItem / LOT ถูกสร้างหรือพร้อมขาย');
    expect(source).toContain('ต้องมาจากหลักฐานการยิงรับสินค้าและ Stock Receive ฝั่ง Server');
  });

  it('does not treat partial stock receipt as a terminal PO state on the RC screen', () => {
    const source = receiptComponent();

    expect(source).toContain("status === 'RECEIVED' || status === 'COMPLETED' || status === 'CANCELLED'");
    expect(source).not.toContain("status === 'RECEIVED' || status === 'PARTIALLY_RECEIVED' || status === 'CANCELLED'");
  });

  it('preserves the downstream stock-receive authority after identity preparation', () => {
    expect(barcodeStore()).toContain('@/features/purchaseOrderReceipt/finalization');
    expect(stockReceiveApi()).toContain('/stock-items/receive-sn');
  });
});
