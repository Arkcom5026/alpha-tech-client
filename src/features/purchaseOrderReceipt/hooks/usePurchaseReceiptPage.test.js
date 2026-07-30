import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePurchaseReceiptPage } from './usePurchaseReceiptPage';

const purchaseOrder = {
  id: 644,
  status: 'APPROVED',
  items: [
    { id: 11, quantity: 2, receivedQuantity: 0, costPrice: 25 },
    { id: 12, quantity: 1, receivedQuantity: 1, costPrice: 100 },
  ],
};

const createApi = () => ({
  getReceipt: vi.fn(),
  createReceipt: vi.fn().mockResolvedValue({ id: 91, purchaseOrderId: 644, statusReceipt: 'PENDING' }),
  addReceiptItem: vi.fn().mockResolvedValue({ id: 301 }),
  finalizeReceipt: vi.fn().mockResolvedValue({ id: 91, statusReceipt: 'COMPLETED' }),
});

describe('usePurchaseReceiptPage', () => {
  it('projects source items into module-owned row view models', () => {
    const api = createApi();
    const { result } = renderHook(() => usePurchaseReceiptPage({ purchaseOrder, api }));

    expect(result.current.viewModel).toMatchObject({
      purchaseOrderId: 644,
      receiptId: null,
      isBusy: false,
      canFinalize: false,
    });
    expect(result.current.viewModel.rows).toHaveLength(2);
    expect(result.current.viewModel.rows[0]).toMatchObject({
      item: { id: 11 },
      isSaving: false,
      isSaved: false,
      error: null,
    });
    expect(result.current.viewModel.rows[0].state.remainingBeforeInput).toBe(2);
  });

  it('composes row editing, first-save draft creation, and finalize eligibility', async () => {
    const api = createApi();
    const { result } = renderHook(() => usePurchaseReceiptPage({
      purchaseOrder,
      receiptHeader: { receivedAt: '2026-07-30' },
      api,
    }));

    act(() => {
      result.current.actions.updateRow(11, { quantity: 2, costPrice: 25 });
    });

    let saved;
    await act(async () => {
      saved = await result.current.actions.saveRow(purchaseOrder.items[0]);
    });

    expect(api.createReceipt).toHaveBeenCalledWith({
      purchaseOrderId: 644,
      receivedAt: '2026-07-30',
    });
    expect(api.addReceiptItem).toHaveBeenCalledWith({
      purchaseOrderReceiptId: 91,
      purchaseOrderItemId: 11,
      quantity: 2,
      costPrice: 25,
      forceAccept: false,
    });
    expect(saved).toMatchObject({ receiptId: 91, savedItem: { id: 301 } });
    expect(result.current.viewModel.receiptId).toBe(91);
    expect(result.current.viewModel.rows[0].isSaved).toBe(true);
    expect(result.current.viewModel.canFinalize).toBe(true);
  });

  it('finalizes through the receipt resource and resets all composed state', async () => {
    const api = createApi();
    const { result } = renderHook(() => usePurchaseReceiptPage({ purchaseOrder, api }));

    act(() => {
      result.current.actions.updateRow(11, { quantity: 2, costPrice: 25 });
    });
    await act(async () => {
      await result.current.actions.saveRow(purchaseOrder.items[0]);
    });
    await act(async () => {
      await result.current.actions.finalize();
    });

    expect(api.finalizeReceipt).toHaveBeenCalledWith(91);
    expect(result.current.finalize.finalizedOnce).toBe(true);

    act(() => {
      result.current.actions.reset();
    });

    expect(result.current.viewModel.receiptId).toBe(null);
    expect(result.current.items.savedRows).toEqual({});
    expect(result.current.finalize.finalizedOnce).toBe(false);
  });
});
