import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));
vi.mock('@/utils/apiClient', () => ({
  default: { get: mocks.get, post: mocks.post },
}));

const api = await import('./taxExpenseApi');

describe('tax expense API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the dedicated expense endpoints', async () => {
    mocks.get.mockResolvedValue({ data: { data: [] } });
    mocks.post.mockResolvedValue({ data: { data: { id: 1 } } });

    await api.listTaxExpenseCategories();
    await api.listExpensePayeeSuppliers({ q: 'ค่าไฟ' });
    await api.listTaxExpenses({ status: 'RECORDED', q: 'INV-1' });
    await api.createTaxExpenseCategory({ code: 'UTILITY', name: 'ค่าสาธารณูปโภค' });
    await api.createTaxExpense({ supplierId: 7, documentNumber: 'INV-1', items: [] });

    expect(mocks.get).toHaveBeenCalledWith('/tax-expenses/categories');
    expect(mocks.get).toHaveBeenCalledWith('/tax-expenses/expense-payees', { params: { q: 'ค่าไฟ' } });
    expect(mocks.get).toHaveBeenCalledWith('/tax-expenses', expect.objectContaining({
      params: expect.objectContaining({ status: 'RECORDED', q: 'INV-1' }),
    }));
    expect(mocks.post).toHaveBeenCalledWith('/tax-expenses/categories', { code: 'UTILITY', name: 'ค่าสาธารณูปโภค' });
    expect(mocks.post).toHaveBeenCalledWith('/tax-expenses', expect.objectContaining({
      supplierId: 7, documentNumber: 'INV-1',
    }));
  });

  it('shares only concurrent expense-payee reads with the same normalized query', async () => {
    let resolveRead;
    mocks.get.mockReturnValue(new Promise((resolve) => {
      resolveRead = resolve;
    }));

    const first = api.listExpensePayees({ q: '  Vendor A  ' });
    const duplicate = api.listExpensePayees({ q: 'vendor a' });

    expect(first).toBe(duplicate);
    expect(mocks.get).toHaveBeenCalledTimes(1);
    expect(mocks.get).toHaveBeenCalledWith('/tax-expenses/expense-payees', {
      params: { q: 'Vendor A' },
    });

    resolveRead({ data: { data: [{ id: 1 }] } });
    await expect(first).resolves.toEqual([{ id: 1 }]);

    mocks.get.mockResolvedValue({ data: { data: [{ id: 2 }] } });
    await api.listExpensePayees({ q: 'vendor a' });
    expect(mocks.get).toHaveBeenCalledTimes(2);
  });
});
