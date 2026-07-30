import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const purchaseOrderFiles = [
  'src/features/purchaseOrder/api/purchaseOrderApi.js',
  'src/features/purchaseOrder/store/purchaseOrderStore.js',
  'src/features/purchaseOrder/hooks/usePurchaseOrderForm.js',
  'src/features/purchaseOrder/hooks/usePurchaseOrderEditor.js',
  'src/features/purchaseOrder/hooks/usePurchaseOrderList.js',
  'src/features/purchaseOrder/hooks/usePurchaseOrderProductSearch.js',
  'src/features/purchaseOrder/hooks/usePurchaseOrderReferenceData.js',
  'src/features/purchaseOrder/components/PurchaseOrderForm.jsx',
  'src/features/purchaseOrder/components/PurchaseOrderSupplierSelector.jsx',
  'src/features/purchaseOrder/schema/purchaseOrderSchema.js',
];

const purchaseOrderSurface = () => purchaseOrderFiles.map(read).join('\n');

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

  it('keeps the PurchaseOrder surface free from downstream module implementation ownership', () => {
    const surface = purchaseOrderSurface();

    expect(surface).not.toContain('@/features/purchaseOrderReceipt');
    expect(surface).not.toContain('@/features/barcode');
    expect(surface).not.toContain('@/features/stockItem');
    expect(surface).not.toContain('/purchase-order-receipts');
    expect(surface).not.toContain('/barcodes');
    expect(surface).not.toContain('/stock-items');
  });

  it('does not expose unused supplier-oriented PurchaseOrder query helpers', () => {
    const purchaseOrderApi = read('src/features/purchaseOrder/api/purchaseOrderApi.js');

    expect(purchaseOrderApi).not.toContain('getPurchaseOrdersBySupplier');
    expect(purchaseOrderApi).not.toContain('/purchase-orders/by-supplier');
  });
});
