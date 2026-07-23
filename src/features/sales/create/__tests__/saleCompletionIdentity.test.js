import { describe, expect, it, vi } from 'vitest';
import {
  clearSaleCompletionIdentity,
  getSaleCompletionIdentity,
} from '../workflows/saleCompletionIdentity';

const storage = () => {
  const values = new Map();
  return {
    getItem: vi.fn((key) => values.get(key) || null),
    setItem: vi.fn((key, value) => values.set(key, value)),
    removeItem: vi.fn((key) => values.delete(key)),
  };
};

describe('durable sale completion identity', () => {
  it('reuses identity for unchanged checkout and refresh recovery', () => {
    const session = storage();
    const first = getSaleCompletionIdentity({ sale: { total: 10 }, payment: { cash: 10 } }, session);
    const retry = getSaleCompletionIdentity({ payment: { cash: 10 }, sale: { total: 10 } }, session);
    expect(retry.commandId).toBe(first.commandId);
    expect(retry.receivedAt).toBe(first.receivedAt);
  });

  it('ignores volatile receivedAt while fingerprinting material payment intent', () => {
    const session = storage();
    const first = getSaleCompletionIdentity({
      sale: { total: 10 },
      payment: { receivedAt: '2026-01-01T00:00:00Z', paymentItems: [{ amount: 10 }] },
    }, session);
    const retry = getSaleCompletionIdentity({
      sale: { total: 10 },
      payment: { receivedAt: '2030-01-01T00:00:00Z', paymentItems: [{ amount: 10 }] },
    }, session);
    expect(retry.commandId).toBe(first.commandId);
    expect(retry.receivedAt).toBe(first.receivedAt);
  });

  it.each(['cart', 'customer', 'mode', 'totals', 'payment', 'deposit'])(
    'invalidates identity when %s material changes',
    (field) => {
      const session = storage();
      const first = getSaleCompletionIdentity({ [field]: 1 }, session);
      const changed = getSaleCompletionIdentity({ [field]: 2 }, session);
      expect(changed.commandId).not.toBe(first.commandId);
    }
  );

  it('clears only when explicitly completed or abandoned', () => {
    const session = storage();
    getSaleCompletionIdentity({ sale: 1 }, session);
    clearSaleCompletionIdentity(session);
    expect(session.removeItem).toHaveBeenCalledOnce();
  });
});
