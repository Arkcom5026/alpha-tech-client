import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePurchaseReceiptFinalize } from './usePurchaseReceiptFinalize';

const completeInput = {
  receiptId: 91,
  items: [{ id: 1, quantity: 1, receivedQuantity: 0 }],
  savedRows: { 1: true },
  sessionSavedQuantity: { 1: 1 },
};

describe('usePurchaseReceiptFinalize', () => {
  it('exposes projected finalize eligibility', () => {
    const { result } = renderHook(() => usePurchaseReceiptFinalize({
      ...completeInput,
      finalizeReceipt: vi.fn(),
    }));

    expect(result.current).toMatchObject({
      canFinalize: true,
      allRowsConfirmed: true,
      allItemsComplete: true,
      legacyPurchaseOrderStatus: 'RECEIVED',
    });
  });

  it('finalizes the receipt resource and prevents repeated submission', async () => {
    const finalizeReceipt = vi.fn().mockResolvedValue({ id: 91, statusReceipt: 'COMPLETED' });
    const onFinalized = vi.fn();
    const { result } = renderHook(() => usePurchaseReceiptFinalize({
      ...completeInput,
      finalizeReceipt,
      onFinalized,
    }));

    let outcome;
    await act(async () => {
      outcome = await result.current.finalize();
    });

    expect(finalizeReceipt).toHaveBeenCalledWith(91);
    expect(onFinalized).toHaveBeenCalledWith({ id: 91, statusReceipt: 'COMPLETED' });
    expect(outcome).toMatchObject({ finalized: true, legacyPurchaseOrderStatus: 'RECEIVED' });
    expect(result.current).toMatchObject({ finalizedOnce: true, canFinalize: false });
  });

  it('returns a no-op contract when finalization is not allowed', async () => {
    const finalizeReceipt = vi.fn();
    const { result } = renderHook(() => usePurchaseReceiptFinalize({
      items: [{ id: 1, quantity: 1, receivedQuantity: 0 }],
      finalizeReceipt,
    }));

    let outcome;
    await act(async () => {
      outcome = await result.current.finalize();
    });

    expect(outcome).toMatchObject({ finalized: false, reason: 'FINALIZE_NOT_ALLOWED' });
    expect(finalizeReceipt).not.toHaveBeenCalled();
  });

  it('projects backend failure text and remains retryable', async () => {
    const failure = {
      message: 'Request failed with status code 500',
      response: { data: { error: 'ไม่สามารถปิดใบรับสินค้าได้' } },
    };
    const finalizeReceipt = vi.fn().mockRejectedValue(failure);
    const { result } = renderHook(() => usePurchaseReceiptFinalize({
      ...completeInput,
      finalizeReceipt,
    }));

    await act(async () => {
      await expect(result.current.finalize()).rejects.toBe(failure);
    });

    expect(result.current.finalizeError).toBe('ไม่สามารถปิดใบรับสินค้าได้');
    expect(result.current.isFinalizing).toBe(false);
    expect(result.current.canFinalize).toBe(true);
  });
});
