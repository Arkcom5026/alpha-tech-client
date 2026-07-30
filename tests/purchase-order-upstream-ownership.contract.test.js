import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('purchase order upstream ownership contract', () => {
  it('keeps receipt-entry queries owned by PurchaseOrderReceipt', () => {
    const purchaseOrderApi = read('src/features/purchaseOrder/api/purchaseOrderApi.js');
    const receiptApi = read('src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js');

    expect(purchaseOrderApi).not.toContain('getEligiblePurchaseOrders');
    expect(purchaseOrderApi).not.toContain('eligible-for-receipt');
    expect(purchaseOrderApi).not.toContain('detail-for-receipt');

    expect(receiptApi).toContain('getEligiblePurchaseOrders');
    expect(receiptApi).toContain('/purchase-orders/eligible-for-receipt');
    expect(receiptApi).toContain('/purchase-orders/${poId}/detail-for-receipt');
  });

  it('allows PurchaseOrder to own reference-data access created for its own workflow', () => {
    const purchaseOrderApi = read('src/features/purchaseOrder/api/purchaseOrderApi.js');

    expect(purchaseOrderApi).toContain('getSuppliers');
    expect(purchaseOrderApi).toContain('getPurchaseOrderDropdowns');
    expect(purchaseOrderApi).toContain('getPurchaseOrderBrandsByProductType');
    expect(purchaseOrderApi).toContain('searchPurchaseOrderProducts');
  });
});
