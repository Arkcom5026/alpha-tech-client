import { describe, expect, it, vi } from 'vitest';
import { createSaleHistoryRuntimeSlice } from '../src/features/sales/history/store/saleHistoryRuntimeSlice';
import { createSaleSettlementRuntimeCapability } from '../src/features/sales/history/store/saleSettlementRuntimeCapability';
import { markSaleAsPaid } from '../src/features/sales/history/api/saleHistoryApi';

vi.mock('../src/features/sales/history/api/saleHistoryApi', () => ({
  getAllSales: vi.fn(async () => []),
  getSaleById: vi.fn(async () => ({ id: 1 })),
  markSaleAsPaid: vi.fn(),
  searchPrintableSales: vi.fn(async () => []),
}));

describe('Sale Settlement runtime capability', () => {
  it('owns markSalePaidAction while preserving the history store surface', () => {
    const settlementCapability = createSaleSettlementRuntimeCapability();
    const state = {};
    const set = (patch) => Object.assign(state, patch);
    const get = () => state;

    Object.assign(state, createSaleHistoryRuntimeSlice(set, get));

    expect(typeof settlementCapability.markSalePaidAction).toBe('function');
    expect(typeof state.markSalePaidAction).toBe('function');
  });

  it('projects canonical success from the settlement API', async () => {
    vi.mocked(markSaleAsPaid).mockResolvedValueOnce({
      id: 42,
      statusPayment: 'PAID',
    });

    const capability = createSaleSettlementRuntimeCapability();
    const result = await capability.markSalePaidAction(42);

    expect(markSaleAsPaid).toHaveBeenCalledWith(42);
    expect(result).toEqual({
      ok: true,
      data: { id: 42, statusPayment: 'PAID' },
      error: '',
      code: null,
      status: 200,
      detail: null,
    });
  });

  it('projects deterministic failure without false success', async () => {
    vi.mocked(markSaleAsPaid).mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          message: 'ยอดชำระยังไม่ครบ ไม่สามารถปิดบิลได้',
          code: 'PAYMENT_EVIDENCE_INSUFFICIENT',
          detail: {
            totalAmount: 1000,
            paidAmount: 400,
            balanceAmount: 600,
          },
        },
      },
    });

    const capability = createSaleSettlementRuntimeCapability();
    const result = await capability.markSalePaidAction(42);

    expect(markSaleAsPaid).toHaveBeenCalledWith(42);
    expect(result).toEqual({
      ok: false,
      data: null,
      error: 'ยอดชำระยังไม่ครบ ไม่สามารถปิดบิลได้',
      code: 'PAYMENT_EVIDENCE_INSUFFICIENT',
      status: 409,
      detail: {
        totalAmount: 1000,
        paidAmount: 400,
        balanceAmount: 600,
      },
    });
  });
});
