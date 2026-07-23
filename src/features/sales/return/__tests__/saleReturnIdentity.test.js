import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSaleReturnIdentity,
  fingerprintSaleReturn,
  getSaleReturnIdentity,
} from '../workflows/saleReturnIdentity';

const storage = new Map();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('sessionStorage', {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  });
});

describe('sale return durable identity', () => {
  it('keeps command identity when material payload is unchanged', () => {
    const first = getSaleReturnIdentity(1, { reason: 'คืน', items: [{ id: 1 }] });
    const replay = getSaleReturnIdentity(1, { items: [{ id: 1 }], reason: 'คืน' });
    expect(replay.commandId).toBe(first.commandId);
  });

  it('rotates command identity when material payload changes', () => {
    const first = getSaleReturnIdentity(1, { refund: 100 });
    const changed = getSaleReturnIdentity(1, { refund: 90 });
    expect(changed.commandId).not.toBe(first.commandId);
  });

  it('clears identity only when explicitly requested', () => {
    const first = getSaleReturnIdentity(1, { refund: 100 });
    clearSaleReturnIdentity(1);
    const next = getSaleReturnIdentity(1, { refund: 100 });
    expect(next.commandId).not.toBe(first.commandId);
  });

  it('fingerprints object keys deterministically', () => {
    expect(fingerprintSaleReturn({ b: 2, a: 1 }))
      .toBe(fingerprintSaleReturn({ a: 1, b: 2 }));
  });
});
