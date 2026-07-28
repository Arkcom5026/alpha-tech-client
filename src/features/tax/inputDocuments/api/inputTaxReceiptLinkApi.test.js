import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock('@/utils/apiClient', () => ({
  default: { get: mocks.get, post: mocks.post, patch: mocks.patch },
}));

const api = await import('./inputTaxReceiptLinkApi');

describe('input tax receipt link API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists PO and Quick Receipt candidates with link-state filters', async () => {
    mocks.get.mockResolvedValue({ data: { data: { items: [] } } });
    await api.listInputTaxReceiptCandidates({
      branchId: 2, sourceType: 'QUICK_RECEIPT', supplierId: 7, linkState: 'PARTIALLY_LINKED',
    });
    expect(mocks.get).toHaveBeenCalledWith('/tax/input-documents/pending', expect.objectContaining({
      params: expect.objectContaining({
        branchId: 2, sourceType: 'QUICK_RECEIPT', supplierId: 7, linkState: 'PARTIALLY_LINKED',
      }),
    }));
  });

  it('attaches multiple receipt source types in one command', async () => {
    mocks.post.mockResolvedValue({ data: { data: { links: [] } } });
    await api.attachInputTaxDocumentReceiptLinks({
      branchId: 2,
      taxDocumentId: 10,
      commandKey: 'command-1',
      receiptReferences: [
        { sourceType: 'PO_RECEIPT', sourceId: 4, allocatedTotalAmount: 100 },
        { sourceType: 'QUICK_RECEIPT', sourceId: 5, allocatedTotalAmount: 200 },
      ],
    });
    expect(mocks.post).toHaveBeenCalledWith('/tax/documents/10/receipt-links', expect.objectContaining({
      branchId: 2,
      commandKey: 'command-1',
      receiptReferences: expect.arrayContaining([
        expect.objectContaining({ sourceType: 'PO_RECEIPT', sourceId: 4 }),
        expect.objectContaining({ sourceType: 'QUICK_RECEIPT', sourceId: 5 }),
      ]),
    }));
  });

  it('uses explicit reallocation and cancellation endpoints', async () => {
    mocks.patch.mockResolvedValue({ data: { data: {} } });
    mocks.post.mockResolvedValue({ data: { data: {} } });
    await api.reallocateInputTaxDocumentReceiptLink({
      branchId: 2, taxDocumentId: 10, linkId: 8,
      allocation: { allocatedTotalAmount: 99 }, reason: 'แก้ยอด',
    });
    await api.cancelInputTaxDocumentReceiptLink({
      branchId: 2, taxDocumentId: 10, linkId: 8, reason: 'ผูกผิดใบ',
    });
    expect(mocks.patch).toHaveBeenCalledWith('/tax/documents/10/receipt-links/8', expect.any(Object));
    expect(mocks.post).toHaveBeenCalledWith('/tax/documents/10/receipt-links/8/cancel', expect.objectContaining({ reason: 'ผูกผิดใบ' }));
  });

  it('maps document allocation overflow to an actionable message', () => {
    expect(api.inputTaxReceiptLinkErrorMessage({
      response: { data: { code: 'INPUT_TAX_LINK_DOCUMENT_ALLOCATION_EXCEEDED' } },
    })).toContain('เกินยอดใบกำกับภาษี');
  });
});
