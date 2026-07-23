import { beforeEach, describe, expect, it, vi } from 'vitest';

const { submitSaleCompletion } = vi.hoisted(() => ({ submitSaleCompletion: vi.fn() }));
vi.mock('../api/saleCompletionApi', () => ({ submitSaleCompletion }));

import { executeSaleCompletion } from '../workflows/saleCompletionWorkflow';

const makeStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: vi.fn((key) => values.delete(key)),
  };
};

describe('sale completion workflow', () => {
  beforeEach(() => {
    submitSaleCompletion.mockReset();
    vi.useRealTimers();
  });

  it('retains commandId and canonical receivedAt across failure, retry, and refresh', async () => {
    const storage = makeStorage();
    submitSaleCompletion.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({ saleId: 1 });
    await expect(executeSaleCompletion({
      sale: { customerId: 1, items: [1] },
      payment: { receivedAt: '2026-01-01T00:00:00.000Z', paymentItems: [{ amount: 10 }] },
      storage,
    })).rejects.toThrow('network');
    const firstCommand = submitSaleCompletion.mock.calls[0][0];

    // A new module/runtime instance after refresh receives a newly generated UI timestamp.
    await executeSaleCompletion({
      sale: { customerId: 1, items: [1] },
      payment: { receivedAt: '2030-12-31T23:59:59.999Z', paymentItems: [{ amount: 10 }] },
      storage,
    });
    const retryCommand = submitSaleCompletion.mock.calls[1][0];
    expect(retryCommand.commandId).toBe(firstCommand.commandId);
    expect(retryCommand.payment.receivedAt).toBe(firstCommand.payment.receivedAt);
  });

  it('clears durable identity only after success', async () => {
    const storage = makeStorage();
    submitSaleCompletion.mockResolvedValue({ saleId: 1 });
    await executeSaleCompletion({ sale: { total: 10 }, payment: {}, storage });
    expect(storage.removeItem).toHaveBeenCalledOnce();
  });

  it('rotates commandId and receivedAt after a material checkout change', async () => {
    vi.useFakeTimers();
    const storage = makeStorage();
    submitSaleCompletion.mockRejectedValue(new Error('retain'));
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    await expect(executeSaleCompletion({
      sale: { customerId: 1, items: [1] },
      payment: { paymentItems: [{ amount: 10 }] },
      storage,
    })).rejects.toThrow();
    const first = submitSaleCompletion.mock.calls[0][0];

    vi.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
    await expect(executeSaleCompletion({
      sale: { customerId: 2, items: [1, 2] },
      payment: { paymentItems: [{ amount: 20 }] },
      storage,
    })).rejects.toThrow();
    const changed = submitSaleCompletion.mock.calls[1][0];
    expect(changed.commandId).not.toBe(first.commandId);
    expect(changed.payment.receivedAt).not.toBe(first.payment.receivedAt);
  });
});
