

// ===============================
// features/bill/store/billStore.test.js
// ===============================
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockGetSaleById = vi.fn();

vi.mock('@/features/sales/api/saleApi', () => ({
  getSaleById: (...args) => mockGetSaleById(...args),
}));

const makeSaleFixture = (overrides = {}) => {
  const saleId = overrides.id ?? 496;

  return {
    id: saleId,
    createdAt: '2026-05-28T05:00:00.000Z',
    paymentMethod: 'CASH',
    note: '',
    branch: {
      id: 1,
      name: 'บริษัท แอดวานซ์เทค บรรพต จำกัด',
      address: 'นครสวรรค์',
      phone: '0000000000',
      taxId: '0000000000000',
      englishBranchName: 'ADVANCED TECH BANPHOT CO.,LTD',
      receiptConfig: {
        branchName: 'บริษัท แอดวานซ์เทค บรรพต จำกัด',
        address: 'นครสวรรค์',
        phone: '0000000000',
        taxId: '0000000000000',
        vatRate: 7,
      },
    },
    payments: [
      {
        id: 10,
        saleId,
        paymentMethod: 'CASH',
        amount: 120,
        receivedAt: '2026-05-28T05:00:00.000Z',
      },
    ],
    items: [
      {
        id: 1,
        price: 120,
        stockItem: {
          product: {
            name: 'Cable PRINTER USB (3M)',
            model: 'GLINK CB145',
            template: {
              unit: { name: 'ชิ้น' },
            },
          },
        },
      },
    ],
    ...overrides,
  };
};

const makeUnauthorizedError = () => {
  const error = new Error('Request failed with status code 401');
  error.response = { status: 401 };
  return error;
};

const importFreshStore = async () => {
  vi.resetModules();
  const module = await import('./billStore');
  return module.useBillStore;
};

describe('billStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('loads sale data for print layout successfully', async () => {
    const saleId = 1001;
    const sale = makeSaleFixture({ id: saleId });
    mockGetSaleById.mockResolvedValueOnce(sale);

    const useBillStore = await importFreshStore();
    useBillStore.getState().resetAction();

    const result = await useBillStore.getState().loadSaleByIdAction(saleId);
    const state = useBillStore.getState();

    expect(mockGetSaleById).toHaveBeenCalledTimes(1);
    expect(result.sale.id).toBe(saleId);
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.sale.id).toBe(saleId);
    expect(state.payment.amount).toBe(120);
    expect(state.saleItems).toHaveLength(1);
    expect(state.config.totals.total).toBe(120);
  });

  it('retries once when the first print sale request receives transient 401', async () => {
    const saleId = 1002;
    const sale = makeSaleFixture({ id: saleId });
    mockGetSaleById
      .mockRejectedValueOnce(makeUnauthorizedError())
      .mockResolvedValueOnce(sale);

    const useBillStore = await importFreshStore();
    useBillStore.getState().resetAction();

    const result = await useBillStore.getState().loadSaleByIdAction(saleId);
    const state = useBillStore.getState();

    expect(mockGetSaleById).toHaveBeenCalledTimes(2);
    expect(result.sale.id).toBe(saleId);
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.sale.id).toBe(saleId);
    expect(state.payment.amount).toBe(120);
  });

  it('shows a friendly Thai auth message when 401 retry still fails', async () => {
    const saleId = 1003;
    mockGetSaleById
      .mockRejectedValueOnce(makeUnauthorizedError())
      .mockRejectedValueOnce(makeUnauthorizedError());

    const useBillStore = await importFreshStore();
    useBillStore.getState().resetAction();

    await expect(useBillStore.getState().loadSaleByIdAction(saleId)).rejects.toThrow(
      'Request failed with status code 401',
    );

    const state = useBillStore.getState();

    expect(mockGetSaleById).toHaveBeenCalledTimes(2);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(
      'สิทธิ์การใช้งานหมดอายุชั่วคราว กรุณารอสักครู่แล้วลองโหลดใบเสร็จใหม่อีกครั้ง',
    );
  });
});
