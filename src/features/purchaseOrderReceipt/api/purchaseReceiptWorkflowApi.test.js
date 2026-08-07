import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('@/utils/apiClient', () => ({
  default: {
    get: mocks.get,
    post: mocks.post,
    patch: mocks.patch,
  },
}));

const api = await import('./purchaseReceiptWorkflowApi');

describe('purchaseReceiptWorkflowApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the receipt-specific purchase-order projection', async () => {
    mocks.get.mockResolvedValue({ data: { success: true, data: { id: 644 } } });

    await expect(api.getPurchaseOrderForReceipt(644)).resolves.toEqual({ id: 644 });
    expect(mocks.get).toHaveBeenCalledWith('/purchase-orders/644/detail-for-receipt');
  });

  it('creates a receipt draft through the receipt collection endpoint', async () => {
    const payload = {
      purchaseOrderId: 644,
      receivedAt: '2026-07-30',
      supplierTaxInvoiceNumber: 'TAX-001',
    };
    mocks.post.mockResolvedValue({ data: { id: 91, statusReceipt: 'PENDING' } });

    await expect(api.createPurchaseReceiptDraft(payload)).resolves.toEqual({ id: 91, statusReceipt: 'PENDING' });
    expect(mocks.post).toHaveBeenCalledWith('/purchase-order-receipts', payload);
  });

  it('loads a known receipt draft for resume', async () => {
    mocks.get.mockResolvedValue({ data: { id: 91, purchaseOrderId: 644 } });

    await expect(api.getPurchaseReceiptDraft('91')).resolves.toEqual({ id: 91, purchaseOrderId: 644 });
    expect(mocks.get).toHaveBeenCalledWith('/purchase-order-receipts/91');
  });

  it('saves a receipt item with the current backend payload contract', async () => {
    const payload = {
      purchaseOrderReceiptId: 91,
      purchaseOrderItemId: 12,
      quantity: 1,
      costPrice: 490,
      forceAccept: false,
    };
    mocks.post.mockResolvedValue({ data: { id: 301 } });

    await expect(api.savePurchaseReceiptDraftItem(payload)).resolves.toEqual({ id: 301 });
    expect(mocks.post).toHaveBeenCalledWith('/purchase-order-receipt-items', payload);
  });

  it('finalizes the receipt resource rather than patching PO status directly', async () => {
    mocks.patch.mockResolvedValue({ data: { success: true, data: { id: 91, statusReceipt: 'COMPLETED' } } });

    await expect(api.finalizePurchaseReceiptDraft(91)).resolves.toEqual({ id: 91, statusReceipt: 'COMPLETED' });
    expect(mocks.patch).toHaveBeenCalledWith('/purchase-order-receipts/91/finalize');
  });
});
