import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
  getAllSuppliers: vi.fn(),
  parseApiError: vi.fn((error) => error),
  makeIdempotencyKey: vi.fn(() => 'cmd-test-001'),
}));

vi.mock('@/utils/apiClient', () => ({
  default: { get: mocks.get, post: mocks.post, patch: mocks.patch, delete: mocks.del },
}));
vi.mock('@/utils/uiHelpers', () => ({ parseApiError: mocks.parseApiError }));
vi.mock('@/features/supplier/api/supplierApi', () => ({ getAllSuppliers: mocks.getAllSuppliers }));
vi.mock('@/features/quickReceive/api/quickReceiveApi', () => ({ makeIdempotencyKey: mocks.makeIdempotencyKey }));

const api = await import('./quickReceiptSessionApi');

describe('quickReceiptSessionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.__resetQuickReceiptCommandKeysForTest();
    mocks.makeIdempotencyKey.mockReturnValue('cmd-test-001');
  });

  it('loads and normalizes supplier rows', async () => {
    mocks.getAllSuppliers.mockResolvedValue({ data: [{ id: 1, name: 'Supplier A' }] });
    await expect(api.loadQuickReceiptSuppliers()).resolves.toEqual([{ id: 1, name: 'Supplier A' }]);
    expect(mocks.getAllSuppliers).toHaveBeenCalledWith({});
  });

  it('creates a resumable draft through the receipt collection endpoint', async () => {
    mocks.post.mockResolvedValue({ data: { data: { id: 77, status: 'DRAFT' } } });
    const payload = { supplierId: 1, deliveryNoteNumber: 'DN-001' };
    await expect(api.createQuickReceiptDraft(payload)).resolves.toEqual({ id: 77, status: 'DRAFT' });
    expect(mocks.post).toHaveBeenCalledWith('quick-stock/receipts', payload);
  });

  it('sends one-shot completion with an idempotency key', async () => {
    mocks.post.mockResolvedValue({ data: { data: { id: 88, status: 'COMPLETED' } } });
    const payload = { supplierId: 1, deliveryNoteNumber: 'DN-002', items: [{ productId: 10 }] };
    await expect(api.completeQuickReceipt(payload)).resolves.toEqual({ id: 88, status: 'COMPLETED' });
    expect(mocks.post).toHaveBeenCalledWith(
      'quick-stock/receipts/complete',
      payload,
      { headers: { 'X-Idempotency-Key': 'cmd-test-001' } }
    );
  });

  it('reuses the same one-shot command key after a failed request', async () => {
    const payload = { supplierId: 1, deliveryNoteNumber: 'DN-RETRY', items: [{ productId: 10 }] };
    mocks.post
      .mockRejectedValueOnce(new Error('network failed'))
      .mockResolvedValueOnce({ data: { data: { id: 90, status: 'COMPLETED' } } });

    await expect(api.completeQuickReceipt(payload)).rejects.toThrow('network failed');
    await expect(api.completeQuickReceipt({ items: [{ productId: 10 }], deliveryNoteNumber: 'DN-RETRY', supplierId: 1 }))
      .resolves.toEqual({ id: 90, status: 'COMPLETED' });

    expect(mocks.makeIdempotencyKey).toHaveBeenCalledTimes(1);
    expect(mocks.post.mock.calls[0][2]).toEqual({ headers: { 'X-Idempotency-Key': 'cmd-test-001' } });
    expect(mocks.post.mock.calls[1][2]).toEqual({ headers: { 'X-Idempotency-Key': 'cmd-test-001' } });
  });

  it('finalizes a server draft with an idempotency key', async () => {
    mocks.post.mockResolvedValue({ data: { data: { id: 77, status: 'COMPLETED' } } });
    await api.finalizeQuickReceipt(77);
    expect(mocks.post).toHaveBeenCalledWith(
      'quick-stock/receipts/77/finalize',
      {},
      { headers: { 'X-Idempotency-Key': 'cmd-test-001' } }
    );
  });

  it('reuses the same finalize command key until the draft finalizes successfully', async () => {
    mocks.post
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ data: { data: { id: 77, status: 'COMPLETED' } } });

    await expect(api.finalizeQuickReceipt(77)).rejects.toThrow('timeout');
    await expect(api.finalizeQuickReceipt('77')).resolves.toEqual({ id: 77, status: 'COMPLETED' });

    expect(mocks.makeIdempotencyKey).toHaveBeenCalledTimes(1);
    expect(mocks.post.mock.calls[0][2]).toEqual(mocks.post.mock.calls[1][2]);
  });

  it('preserves parsed API errors', async () => {
    const failure = new Error('network failed');
    mocks.get.mockRejectedValue(failure);
    await expect(api.getQuickReceipt(77)).rejects.toBe(failure);
    expect(mocks.parseApiError).toHaveBeenCalledWith(failure);
  });
});
