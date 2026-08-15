import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');
const readFeatureSource = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  if (name === '__tests__') return [];
  return statSync(path).isDirectory() ? readFeatureSource(path) : [readFileSync(path, 'utf8')];
}).join('\n');

const source = readFeatureSource(featureRoot);

describe('purchase order receipt ownership-safe behavior lock', () => {
  it('preserves receipt-entry eligibility and receipt-specific purchase order loading', () => {
    expect(source).toContain('getEligiblePurchaseOrders');
    expect(source).toContain('getPurchaseOrderDetailById');
    expect(source).toContain('PENDING,PARTIALLY_RECEIVED');
  });

  it('preserves receipt creation, item editing, and finalization capabilities', () => {
    expect(source).toContain('createReceiptAction');
    expect(source).toContain('addReceiptItemAction');
    expect(source).toContain('updateReceiptItemAction');
    expect(source).toContain('deleteReceiptItemAction');
    expect(source).toContain('markReceiptAsCompletedAction');
    expect(source).toContain('finalizeReceiptIfNeeded');
  });

  it('preserves explicit confirmation before cancel coordination', () => {
    const table = read('components/purchaseOrderReceiptTable.jsx');
    expect(table).toContain('ConfirmActionDialog');
    expect(table).toContain('ไม่สามารถนำมาตรวจรับสินค้าได้อีก');
    expect(table).toContain('feedback.actionSuccess');
    expect(table).toContain('feedback.actionError');
    expect(table).not.toContain('window.confirm');
  });

  it('keeps downstream Barcode and StockItem internals out of PurchaseOrderReceipt', () => {
    expect(source).not.toContain('@/features/barcode/');
    expect(source).not.toContain('@/features/stockItem/');
    expect(source).not.toContain('/stock-items/');
    expect(source).not.toContain('receiveStockItem');
  });
});
