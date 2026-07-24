import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSaleReturnCommandId,
  getSaleReturnCommandId,
} from '../workflows/saleReturnIdentity';

const storage = new Map();

beforeEach(() => {
  storage.clear();

  vi.stubGlobal('sessionStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    key: (index) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size;
    },
  });
});

describe('sale return command identity', () => {
  it('reuses the same command id for the same sale', () => {
    const first = getSaleReturnCommandId(1);
    const second = getSaleReturnCommandId(1);

    expect(second).toBe(first);
  });

  it('keeps command ids isolated by sale', () => {
    const firstSale = getSaleReturnCommandId(1);
    const secondSale = getSaleReturnCommandId(2);

    expect(secondSale).not.toBe(firstSale);
  });

  it('creates a new command id after explicit clear', () => {
    const first = getSaleReturnCommandId(1);

    clearSaleReturnCommandId(1);

    const next = getSaleReturnCommandId(1);

    expect(next).not.toBe(first);
  });
});
