import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePurchaseReceiptItems } from './usePurchaseReceiptItems';

describe('usePurchaseReceiptItems', () => {
  it('projects draft quantity and cost without mutating the source item', () => {
    const item = { id: 12, quantity: 5, receivedQuantity: 2, costPrice: 100 };
    const { result } = renderHook(() => usePurchaseReceiptItems({ purchaseOrderId: 644 }));

    act(() => {
      result.current.setRowDraft(12, { quantity: 2, costPrice: 90 });
    });

    expect(result.current.projectRow(item)).toMatchObject({
      ordered: 5,
      previouslyReceived: 2,
      input: 2,
      cost: 90,
      receivedAfterInput: 4,
      remainingAfterInput: 1,
      lineTotal: 180,
    });
    expect(item).toEqual({ id: 12, quantity: 5, receivedQuantity: 2, costPrice: 100 });
  });

  it('creates the first receipt, saves the row, and records session quantity', async () => {
    const createReceipt = vi.fn().mockResolvedValue({ id: 91 });
    const addReceiptItem = vi.fn().mockResolvedValue({ id: 301 });
    const onReceiptResolved = vi.fn();
    const { result } = renderHook(() => usePurchaseReceiptItems({
      purchaseOrderId: 644,
      receiptHeader: { receivedAt: '2026-07-30' },
      createReceipt,
      addReceiptItem,
      onReceiptResolved,
    }));

    act(() => {
      result.current.setRowDraft(12, { quantity: 2, costPrice: 50 });
    });

    await act(async () => {
      await result.current.saveRow({ id: 12, quantity: 5, receivedQuantity: 0, costPrice: 60 });
    });

    expect(createReceipt).toHaveBeenCalledOnce();
    expect(addReceiptItem).toHaveBeenCalledWith(expect.objectContaining({
      purchaseOrderReceiptId: 91,
      purchaseOrderItemId: 12,
      quantity: 2,
      costPrice: 50,
    }));
    expect(onReceiptResolved).toHaveBeenCalledWith(91, { id: 91 });
    expect(result.current.savedRows[12]).toBe(true);
    expect(result.current.sessionSavedQuantity[12]).toBe(2);
    expect(result.current.rowErrors[12]).toBe(null);
    expect(result.current.isSaving).toBe(false);
  });

  it('reuses an existing receipt and accumulates separately saved quantities', async () => {
    const createReceipt = vi.fn();
    const addReceiptItem = vi.fn().mockResolvedValue({ id: 302 });
    const { result } = renderHook(() => usePurchaseReceiptItems({
      purchaseOrderId: 644,
      receiptId: 91,
      createReceipt,
      addReceiptItem,
    }));

    act(() => result.current.setRowDraft(13, { quantity: 1, costPrice: 25 }));
    await act(async () => result.current.saveRow({ id: 13, quantity: 3, receivedQuantity: 0 }));

    act(() => result.current.setRowDraft(13, { quantity: 1, costPrice: 25 }));
    await act(async () => result.current.saveRow({ id: 13, quantity: 3, receivedQuantity: 0 }));

    expect(createReceipt).not.toHaveBeenCalled();
    expect(addReceiptItem).toHaveBeenCalledTimes(2);
    expect(result.current.sessionSavedQuantity[13]).toBe(2);
  });

  it('projects backend error text and preserves the failure for draft recovery', async () => {
    const failure = Object.assign(new Error('Request failed with status code 500'), {
      receiptId: 92,
      stage: 'SAVE_ITEM',
      response: { data: { error: 'บันทึกรายการรับสินค้าไม่สำเร็จ' } },
    });
    const onSaveFailure = vi.fn();
    const { result } = renderHook(() => usePurchaseReceiptItems({
      purchaseOrderId: 644,
      createReceipt: vi.fn().mockResolvedValue({ id: 92 }),
      addReceiptItem: vi.fn().mockRejectedValue(failure),
      onSaveFailure,
    }));

    act(() => result.current.setRowDraft(14, { quantity: 1, costPrice: 10 }));
    await act(async () => {
      await expect(result.current.saveRow({ id: 14, quantity: 1 })).rejects.toBeTruthy();
    });

    expect(result.current.rowErrors[14]).toBe('บันทึกรายการรับสินค้าไม่สำเร็จ');
    expect(onSaveFailure).toHaveBeenCalledOnce();
    expect(onSaveFailure.mock.calls[0][0]).toMatchObject({ receiptId: 92, stage: 'SAVE_ITEM' });
    expect(result.current.isSaving).toBe(false);
  });

  it('resets all row workflow state explicitly', () => {
    const { result } = renderHook(() => usePurchaseReceiptItems({ purchaseOrderId: 644 }));
    act(() => result.current.setRowDraft(15, { quantity: 1, costPrice: 10 }));
    act(() => result.current.resetItems());

    expect(result.current.draftRows).toEqual({});
    expect(result.current.savedRows).toEqual({});
    expect(result.current.sessionSavedQuantity).toEqual({});
    expect(result.current.rowErrors).toEqual({});
  });
});
