import { describe, expect, it, vi } from 'vitest';

import {
  classifySaleCompletionFailure,
  projectSaleCompletionRecovery,
} from '../src/features/sales/create/completion/services/saleCompletionRecovery';
import {
  SALE_COMPLETION_IDENTITY_STORAGE_KEY,
  clearSaleCompletionIdentity,
  getSaleCompletionIdentity,
  readSaleCompletionIdentity,
} from '../src/features/sales/create/workflows/saleCompletionIdentity';
import { executeSaleCompletion } from '../src/features/sales/create/workflows/saleCompletionWorkflow';

const createMemoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
};

const commandPayload = () => ({
  sale: {
    customerId: 101,
    totalAmount: 100,
    items: [{ lineId: 'stock-1', lineType: 'STOCK_ITEM', stockItemId: 1, price: 100 }],
  },
  payment: {
    paymentItems: [{ method: 'CASH', amount: 100 }],
  },
});

describe('Sale Completion Recovery authority', () => {
  it('reuses the same durable command identity for the same material payload', () => {
    const storage = createMemoryStorage();
    const payload = commandPayload();

    const first = getSaleCompletionIdentity(payload, storage);
    const second = getSaleCompletionIdentity(payload, storage);

    expect(second.commandId).toBe(first.commandId);
    expect(second.fingerprint).toBe(first.fingerprint);
    expect(readSaleCompletionIdentity(storage)).toEqual(second);
  });

  it('creates a new identity when the material payload changes', () => {
    const storage = createMemoryStorage();
    const first = getSaleCompletionIdentity(commandPayload(), storage);
    const changed = commandPayload();
    changed.sale.totalAmount = 120;

    const second = getSaleCompletionIdentity(changed, storage);

    expect(second.commandId).not.toBe(first.commandId);
    expect(second.fingerprint).not.toBe(first.fingerprint);
  });

  it('classifies transport and server uncertainty as retryable while preserving checkout', () => {
    const identity = { commandId: 'cmd-uncertain', receivedAt: '2026-08-01T00:00:00.000Z' };
    const failure = classifySaleCompletionFailure(new Error('Network Error'));
    const recovery = projectSaleCompletionRecovery({ identity, failure });

    expect(failure.kind).toBe('UNCERTAIN');
    expect(failure.retryable).toBe(true);
    expect(recovery.state).toBe('UNCERTAIN');
    expect(recovery.commandId).toBe(identity.commandId);
    expect(recovery.retryable).toBe(true);
    expect(recovery.preserveCheckout).toBe(true);
  });

  it('classifies changed-payload command conflicts as deterministic non-retryable conflicts', () => {
    const failure = classifySaleCompletionFailure({
      status: 409,
      response: { status: 409, data: { code: 'SALE_COMPLETION_COMMAND_CONFLICT' } },
    });

    expect(failure.kind).toBe('CONFLICT');
    expect(failure.retryable).toBe(false);
    expect(failure.uncertain).toBe(false);
  });

  it('clears durable identity only after canonical successful completion', async () => {
    const storage = createMemoryStorage();
    const payload = commandPayload();
    const identity = getSaleCompletionIdentity(payload, storage);
    expect(storage.getItem(SALE_COMPLETION_IDENTITY_STORAGE_KEY)).toBeTruthy();

    const result = await executeSaleCompletion({
      ...payload,
      storage,
      submit: vi.fn(async (command) => ({ saleId: 501, command })),
    });

    expect(result.saleId).toBe(501);
    expect(result.completionRecovery.state).toBe('CONFIRMED');
    expect(result.completionRecovery.commandId).toBe(identity.commandId);
    expect(storage.getItem(SALE_COMPLETION_IDENTITY_STORAGE_KEY)).toBeNull();
  });

  it('preserves the same identity when completion result is uncertain', async () => {
    const storage = createMemoryStorage();
    const payload = commandPayload();
    let capturedIdentity = null;
    let capturedFailure = null;

    await expect(executeSaleCompletion({
      ...payload,
      storage,
      submit: vi.fn(async () => {
        const error = new Error('timeout');
        error.status = 504;
        error.response = { status: 504 };
        throw error;
      }),
      onIdentity: (identity) => { capturedIdentity = identity; },
      onFailure: (outcome) => { capturedFailure = outcome; },
    })).rejects.toThrow('timeout');

    const persisted = readSaleCompletionIdentity(storage);
    expect(persisted.commandId).toBe(capturedIdentity.commandId);
    expect(capturedFailure.identity.commandId).toBe(capturedIdentity.commandId);
    expect(capturedFailure.failure.kind).toBe('UNCERTAIN');
    expect(capturedFailure.failure.retryable).toBe(true);
  });

  it('allows explicit identity cleanup only through the identity authority', () => {
    const storage = createMemoryStorage();
    getSaleCompletionIdentity(commandPayload(), storage);
    clearSaleCompletionIdentity(storage);
    expect(readSaleCompletionIdentity(storage)).toBeNull();
  });
});
