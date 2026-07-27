import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  archiveProductType,
  createProductType,
  getProductTypeById,
  getProductTypes,
  restoreProductType,
  updateProductType,
} from '../../api/productTypeApi';
import useProductTypeStore from '../productTypeStore';

vi.mock('../../api/productTypeApi', () => ({
  getProductTypes: vi.fn(),
  getProductTypeById: vi.fn(),
  createProductType: vi.fn(),
  updateProductType: vi.fn(),
  archiveProductType: vi.fn(),
  restoreProductType: vi.fn(),
}));

const apiError = {
  response: {
    status: 409,
    data: {
      code: 'PRODUCT_TYPE_CONFLICT',
      message: 'ประเภทสินค้านี้มีอยู่แล้ว',
    },
  },
};

const expectedRuntimeError = {
  kind: 'conflict',
  message: 'ประเภทสินค้านี้มีอยู่แล้ว',
  status: 409,
  code: 'PRODUCT_TYPE_CONFLICT',
  retryable: false,
  cause: apiError,
};

describe('productTypeStore ADS error normalization adoption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProductTypeStore.setState({
      items: [],
      current: null,
      isLoading: false,
      isSubmitting: false,
      error: null,
    });
  });

  it.each([
    ['fetchListAction', getProductTypes, () => useProductTypeStore.getState().fetchListAction()],
    ['fetchByIdAction', getProductTypeById, () => useProductTypeStore.getState().fetchByIdAction(1)],
    [
      'createProductTypeAction',
      createProductType,
      () => useProductTypeStore.getState().createProductTypeAction({ name: 'Printer' }),
    ],
    [
      'updateProductTypeAction',
      updateProductType,
      () => useProductTypeStore.getState().updateProductTypeAction(1, { name: 'Printer' }),
    ],
    ['archiveProductTypeAction', archiveProductType, () => useProductTypeStore.getState().archiveProductTypeAction(1)],
    ['restoreProductTypeAction', restoreProductType, () => useProductTypeStore.getState().restoreProductTypeAction(1)],
  ])('normalizes %s failures with the ADS runtime contract', async (_name, apiMock, runAction) => {
    apiMock.mockRejectedValueOnce(apiError);

    await expect(runAction()).rejects.toBe(apiError);

    expect(useProductTypeStore.getState().error).toEqual(expectedRuntimeError);
    expect(useProductTypeStore.getState().isLoading).toBe(false);
    expect(useProductTypeStore.getState().isSubmitting).toBe(false);
  });
});
