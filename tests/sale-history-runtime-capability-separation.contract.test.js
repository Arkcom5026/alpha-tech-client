import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSaleHistoryRuntimeSlice } from '../src/features/sales/history/store/saleHistoryRuntimeSlice';
import {
  getAllSales,
  getSaleById,
  markSaleAsPaid,
  searchPrintableSales,
} from '../src/features/sales/history/api/saleHistoryApi';

vi.mock('../src/features/sales/history/api/saleHistoryApi', () => ({
  getAllSales: vi.fn(),
  getSaleById: vi.fn(),
  markSaleAsPaid: vi.fn(),
  searchPrintableSales: vi.fn(),
}));

const createStore = () => {
  const state = {};
  const set = (patch) => Object.assign(state, patch);
  const get = () => state;
  Object.assign(state, createSaleHistoryRuntimeSlice(set, get));
  return state;
};

describe('Sale History runtime capability separation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('preserves the existing store surface while composing capability owners', () => {
    const state = createStore();

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

  it('delegates list and detail queries while preserving normalized state updates', async () => {
    const state = createStore();
    getAllSales.mockResolvedValueOnce([{ id: 7 }]);
    getSaleById.mockResolvedValueOnce({ id: 7, saleItems: [], simpleItems: [] });

    await state.loadSalesAction();
    await state.getSaleByIdAction(7);

    expect(getAllSales).toHaveBeenCalledTimes(1);
    expect(getSaleById).toHaveBeenCalledWith(7, {
      includePayments: true,
      includeBranch: true,
    });
    expect(state.sales).toEqual([{ id: 7 }]);
    expect(state.currentSale).toMatchObject({ id: 7 });
  });

  it('delegates printable search with bounded filters and exposes deterministic success', async () => {
    const state = createStore();
    searchPrintableSales.mockResolvedValueOnce([{ id: 9 }]);

    const result = await state.loadPrintableSalesAction({
      fromDate: '2026-08-01',
      toDate: '2026-08-02',
      keyword: 'INV-9',
      limit: 999,
      onlyPaid: true,
    });

    expect(searchPrintableSales).toHaveBeenCalledWith({
      fromDate: '2026-08-01',
      toDate: '2026-08-02',
      keyword: 'INV-9',
      limit: 500,
      onlyPaid: true,
    });
    expect(state.printableSales).toEqual([{ id: 9 }]);
    expect(result).toEqual({ ok: true });
    expect(state.loading).toBe(false);
  });

  it('keeps settlement projection behavior at the composition boundary', async () => {
    const state = createStore();
    markSaleAsPaid.mockResolvedValueOnce({ id: 11, statusPayment: 'PAID' });

    const result = await state.markSalePaidAction(11);

    expect(markSaleAsPaid).toHaveBeenCalledWith(11);
    expect(result).toMatchObject({
      ok: true,
      data: { id: 11, statusPayment: 'PAID' },
    });
  });
});
