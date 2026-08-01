import { describe, expect, it, vi } from 'vitest';
import { createSaleHistoryRuntimeSlice } from '../src/features/sales/history/store/saleHistoryRuntimeSlice';

vi.mock('../src/features/sales/history/api/saleHistoryApi', () => ({
  getAllSales: vi.fn(async () => []),
  getSaleById: vi.fn(async () => ({ id: 1 })),
  markSaleAsPaid: vi.fn(async () => ({ id: 1, statusPayment: 'PAID' })),
  searchPrintableSales: vi.fn(async () => []),
}));

describe('Sale History runtime capability separation', () => {
  it('preserves the existing store surface while composing capability owners', () => {
    const state = {};
    const set = (patch) => Object.assign(state, patch);
    const get = () => state;
    Object.assign(state, createSaleHistoryRuntimeSlice(set, get));

    expect(state).toMatchObject({
      salesOverviewLoading: false,
      salesOverviewError: null,
      salesOverviewLastLoadedAt: null,
      sales: [],
      currentSale: null,
      printableSales: [],
    });

    expect(typeof state.fetchSalesDashboardOverviewAction).toBe('function');
    expect(typeof state.loadSalesAction).toBe('function');
    expect(typeof state.setCurrentSaleAction).toBe('function');
    expect(typeof state.getSaleByIdAction).toBe('function');
    expect(typeof state.loadPrintableSalesAction).toBe('function');
    expect(typeof state.markSalePaidAction).toBe('function');
  });
});
