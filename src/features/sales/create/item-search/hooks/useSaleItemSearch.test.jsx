/* @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { searchSaleItems } from '../../../item-search/api/saleItemSearchApi';
import { useSaleItemSearch } from './useSaleItemSearch';

const toastError = vi.fn();

vi.mock('react-toastify', () => ({
  toast: { error: (...args) => toastError(...args) },
}));

vi.mock('../../../item-search/api/saleItemSearchApi', () => ({
  searchSaleItems: vi.fn(),
  mapSaleSearchItemToCartLine: vi.fn((item) => ({
    ...item,
    lineId: `stock-${item.stockItemId}`,
    lineType: 'STOCK_ITEM',
  })),
}));

const setup = () => {
  const addItem = vi.fn();
  const setError = vi.fn();
  const productSearchRef = { current: { focus: vi.fn() } };
  const hook = renderHook(() => useSaleItemSearch({
    selectedPriceType: 'retail',
    itemKeySet: new Set(),
    addItem,
    clearSaleError: vi.fn(),
    setError,
    productSearchRef,
  }));
  return { ...hook, addItem, setError };
};

const enterSearch = async (handler, value) => {
  await act(async () => {
    await handler({
      key: 'Enter',
      preventDefault: vi.fn(),
      target: { value },
    });
  });
};

const expectStandardErrorFeedback = (message) => {
  expect(toastError).toHaveBeenCalledWith(
    message,
    expect.objectContaining({ autoClose: 9000 }),
  );
};

describe('POS sale item search feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.requestAnimationFrame = (callback) => callback();
  });

  it('notifies the user and never adds a sold barcode or SN to the cart', async () => {
    searchSaleItems.mockRejectedValue({
      response: {
        status: 409,
        data: {
          code: 'SALE_ITEM_ALREADY_SOLD',
          message: 'สินค้ารายการนี้ถูกขายไปแล้ว ไม่สามารถเพิ่มเข้ารายการขายได้',
        },
      },
    });
    const { result, addItem, setError } = setup();

    await enterSearch(result.current.handleBarcodeSearch, 'SOLD-BARCODE-1');
    await enterSearch(result.current.handleBarcodeSearch, 'SOLD-SN-1');

    expect(toastError).toHaveBeenCalledTimes(2);
    expectStandardErrorFeedback('สินค้ารายการนี้ถูกขายไปแล้ว ไม่สามารถเพิ่มเข้ารายการขายได้');
    expect(setError).toHaveBeenCalled();
    expect(addItem).not.toHaveBeenCalled();
  });

  it('keeps unknown-item feedback distinct from sold-item feedback', async () => {
    searchSaleItems.mockResolvedValue({ items: [], message: 'ไม่พบสินค้าที่พร้อมขายจากข้อมูลค้นหานี้' });
    const { result, addItem } = setup();

    await enterSearch(result.current.handleBarcodeSearch, 'UNKNOWN-1');

    expectStandardErrorFeedback('ไม่พบสินค้าที่พร้อมขายจากข้อมูลค้นหานี้');
    expect(addItem).not.toHaveBeenCalled();
  });

  it('adds an available exact item without showing an error notification', async () => {
    searchSaleItems.mockResolvedValue({
      autoSelect: true,
      items: [{ type: 'STOCK', stockItemId: 422 }],
    });
    const { result, addItem } = setup();

    await enterSearch(result.current.handleBarcodeSearch, 'AVAILABLE-422');

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(toastError).not.toHaveBeenCalled();
  });
});
