import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePurchaseReceiptDraft } from './usePurchaseReceiptDraft';

describe('usePurchaseReceiptDraft', () => {
  it('remembers a newly created receipt identity', () => {
    const { result } = renderHook(() => usePurchaseReceiptDraft({ purchaseOrderId: 644 }));

    act(() => {
      result.current.rememberReceipt({ id: 91, statusReceipt: 'PENDING' });
    });

    expect(result.current.receiptId).toBe(91);
    expect(result.current.receipt).toMatchObject({ id: 91 });
  });

  it('preserves the receipt identity from an item-save failure', () => {
    const { result } = renderHook(() => usePurchaseReceiptDraft({ purchaseOrderId: 644 }));

    act(() => {
      result.current.rememberSaveFailure({
        message: 'item save failed',
        receiptId: 92,
        stage: 'SAVE_ITEM',
      });
    });

    expect(result.current.receiptId).toBe(92);
    expect(result.current.resumeError).toBe('item save failed');
  });

  it('resumes the currently remembered receipt and resets loading state', async () => {
    const getReceipt = vi.fn().mockResolvedValue({
      id: 93,
      purchaseOrderId: 644,
      statusReceipt: 'PENDING',
    });
    const { result } = renderHook(() => usePurchaseReceiptDraft({
      purchaseOrderId: 644,
      initialReceiptId: 93,
      getReceipt,
    }));

    await act(async () => {
      await result.current.resume();
    });

    expect(getReceipt).toHaveBeenCalledWith(93);
    expect(result.current.receiptId).toBe(93);
    expect(result.current.receipt).toMatchObject({ id: 93 });
    expect(result.current.isResuming).toBe(false);
    expect(result.current.resumeError).toBe(null);
  });

  it('keeps a recoverable id and exposes a readable error when resume fails', async () => {
    const failure = Object.assign(new Error('network failed'), { receiptId: 94 });
    const getReceipt = vi.fn().mockRejectedValue(failure);
    const { result } = renderHook(() => usePurchaseReceiptDraft({
      purchaseOrderId: 644,
      initialReceiptId: 94,
      getReceipt,
    }));

    await act(async () => {
      await expect(result.current.resume()).rejects.toThrow('network failed');
    });

    expect(result.current.receiptId).toBe(94);
    expect(result.current.resumeError).toBe('network failed');
    expect(result.current.isResuming).toBe(false);
  });

  it('clears all draft state explicitly', () => {
    const { result } = renderHook(() => usePurchaseReceiptDraft({
      purchaseOrderId: 644,
      initialReceiptId: 95,
    }));

    act(() => result.current.resetDraft());

    expect(result.current.receiptId).toBe(null);
    expect(result.current.receipt).toBe(null);
    expect(result.current.resumeError).toBe(null);
  });
});
