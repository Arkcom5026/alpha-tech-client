import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loading } from '@/runtime';
import { BRAND_RUNTIME_OPERATIONS } from '../runtime/brandRuntime';

const brandApi = vi.hoisted(() => ({
  getRuntimeProductTypes: vi.fn(),
  getBrandDropdowns: vi.fn(),
  getBrands: vi.fn(),
  getProductTypeBrandLinks: vi.fn(),
  createBrand: vi.fn(),
  updateBrand: vi.fn(),
  toggleBrandActive: vi.fn(),
  attachBrandToProductType: vi.fn(),
  detachBrandFromProductType: vi.fn(),
}));

vi.mock('../api/brandApi', () => brandApi);

import { useBrandStore } from './brandStore';

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const resetStore = () => {
  useBrandStore.setState({
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
    q: '',
    includeInactive: false,
    loading: false,
    saving: false,
    error: null,
    dropdownsLoaded: false,
    dropdownsLoading: false,
    lastFetchKey: null,
    runtimeProductTypes: [],
    runtimeProductTypesLoading: false,
    allBrandOptions: [],
    allBrandOptionsLoading: false,
    productTypeBrandLinks: [],
    productTypeBrandLinksLoading: false,
  });
};

describe('brand store ADS CRUD runtime adoption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loading.reset();
    resetStore();
  });

  it('tracks create in ADS loading and preserves sorted store synchronization', async () => {
    useBrandStore.setState({
      items: [{ id: 1, name: 'Zebra', isActive: true }],
      allBrandOptions: [{ id: 1, name: 'Zebra', isActive: true }],
    });
    const request = deferred();
    brandApi.createBrand.mockReturnValue(request.promise);

    const actionPromise = useBrandStore.getState().createBrandAction({ name: 'Canon' });

    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.CREATE)).toBe(true);
    expect(useBrandStore.getState().saving).toBe(true);

    request.resolve({ id: 2, name: 'Canon', isActive: true });

    await expect(actionPromise).resolves.toEqual({
      ok: true,
      data: { id: 2, name: 'Canon', isActive: true },
    });
    expect(useBrandStore.getState().items.map((item) => item.name)).toEqual(['Canon', 'Zebra']);
    expect(useBrandStore.getState().allBrandOptions.map((item) => item.name)).toEqual([
      'Canon',
      'Zebra',
    ]);
    expect(useBrandStore.getState().saving).toBe(false);
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.CREATE)).toBe(false);
  });

  it.each([
    ['update', 'updateBrandAction', 'updateBrand', BRAND_RUNTIME_OPERATIONS.UPDATE],
    [
      'toggle active',
      'toggleBrandActiveAction',
      'toggleBrandActive',
      BRAND_RUNTIME_OPERATIONS.TOGGLE_ACTIVE,
    ],
  ])('tracks %s with its own operation key and synchronizes both collections', async (_label, actionName, apiName, operation) => {
    useBrandStore.setState({
      items: [{ id: 7, name: 'Old', isActive: true }],
      allBrandOptions: [{ id: 7, name: 'Old', isActive: true }],
    });
    const request = deferred();
    brandApi[apiName].mockReturnValue(request.promise);

    const actionPromise =
      actionName === 'updateBrandAction'
        ? useBrandStore.getState()[actionName]({ id: 7, name: 'New' })
        : useBrandStore.getState()[actionName]({ id: 7, isActive: false });

    expect(loading.isLoading(operation)).toBe(true);
    request.resolve({ id: 7, name: 'New', isActive: false });

    const result = await actionPromise;
    expect(result).toEqual({ ok: true, data: { id: 7, name: 'New', isActive: false } });
    expect(useBrandStore.getState().items[0]).toEqual(result.data);
    expect(useBrandStore.getState().allBrandOptions[0]).toEqual(result.data);
    expect(useBrandStore.getState().saving).toBe(false);
    expect(loading.isLoading(operation)).toBe(false);
  });

  it('normalizes CRUD failures and preserves the ok/error contract', async () => {
    const request = deferred();
    brandApi.createBrand.mockReturnValue(request.promise);

    const actionPromise = useBrandStore.getState().createBrandAction({ name: 'Canon' });
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.CREATE)).toBe(true);

    request.reject({ response: { status: 409, data: { error: 'BRAND_ALREADY_EXISTS' } } });

    const result = await actionPromise;
    expect(result.ok).toBe(false);
    expect(result.error).toMatchObject({ status: 409 });
    expect(useBrandStore.getState().error).toEqual(result.error);
    expect(useBrandStore.getState().saving).toBe(false);
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.CREATE)).toBe(false);
  });
});
