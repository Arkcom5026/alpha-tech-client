import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loading } from '@/runtime';
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

const createDeferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

const EMPTY_LIST_RESPONSE = { items: [], total: 0, totalPages: 1 };

describe('productTypeStore ADS loading runtime adoption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loading.reset();
    getProductTypes.mockResolvedValue(EMPTY_LIST_RESPONSE);
    useProductTypeStore.setState({
      items: [],
      current: null,
      isLoading: false,
      isSubmitting: false,
      error: null,
    });
  });

  it.each([
    {
      name: 'fetchListAction',
      key: 'productType.fetchList',
      apiMock: getProductTypes,
      run: () => useProductTypeStore.getState().fetchListAction(),
      result: EMPTY_LIST_RESPONSE,
      stateKey: 'isLoading',
    },
    {
      name: 'fetchByIdAction',
      key: 'productType.fetchById',
      apiMock: getProductTypeById,
      run: () => useProductTypeStore.getState().fetchByIdAction(1),
      result: { id: 1, name: 'Printer' },
      stateKey: 'isLoading',
    },
    {
      name: 'createProductTypeAction',
      key: 'productType.create',
      apiMock: createProductType,
      run: () => useProductTypeStore.getState().createProductTypeAction({ name: 'Printer' }),
      result: { id: 1, name: 'Printer' },
      stateKey: 'isSubmitting',
    },
    {
      name: 'updateProductTypeAction',
      key: 'productType.update',
      apiMock: updateProductType,
      run: () => useProductTypeStore.getState().updateProductTypeAction(1, { name: 'Printer' }),
      result: { id: 1, name: 'Printer' },
      stateKey: 'isSubmitting',
    },
    {
      name: 'archiveProductTypeAction',
      key: 'productType.archive',
      apiMock: archiveProductType,
      run: () => useProductTypeStore.getState().archiveProductTypeAction(1),
      result: undefined,
      stateKey: 'isSubmitting',
    },
    {
      name: 'restoreProductTypeAction',
      key: 'productType.restore',
      apiMock: restoreProductType,
      run: () => useProductTypeStore.getState().restoreProductTypeAction(1),
      result: undefined,
      stateKey: 'isSubmitting',
    },
  ])('tracks $name through the ADS loading runtime', async ({ key, apiMock, run, result, stateKey }) => {
    const deferred = createDeferred();
    apiMock.mockReturnValueOnce(deferred.promise);

    const actionPromise = run();

    expect(loading.isLoading(key)).toBe(true);
    expect(useProductTypeStore.getState()[stateKey]).toBe(true);

    deferred.resolve(result);
    await actionPromise;

    expect(loading.isLoading(key)).toBe(false);
    expect(useProductTypeStore.getState()[stateKey]).toBe(false);
  });
});
