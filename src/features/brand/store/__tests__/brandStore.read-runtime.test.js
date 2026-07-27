import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loading } from '@/runtime';
import { BRAND_RUNTIME_OPERATIONS } from '../../runtime/brandRuntime';

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

vi.mock('../../api/brandApi', () => brandApi);

import { useBrandStore } from '../brandStore';

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

describe('brand store ADS read runtime adoption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loading.reset();
    resetStore();
  });

  it('tracks fetch list in ADS loading while preserving the result contract', async () => {
    const request = deferred();
    brandApi.getBrands.mockReturnValue(request.promise);

    const actionPromise = useBrandStore.getState().fetchBrandsAction();

    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.FETCH_LIST)).toBe(true);
    expect(useBrandStore.getState().loading).toBe(true);

    request.resolve({ items: [{ id: 1, name: 'Canon' }], page: 1, pageSize: 20, total: 1 });

    await expect(actionPromise).resolves.toEqual({
      ok: true,
      items: [{ id: 1, name: 'Canon' }],
    });
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.FETCH_LIST)).toBe(false);
    expect(useBrandStore.getState().loading).toBe(false);
  });

  it('normalizes read failures and clears both loading authorities', async () => {
    const request = deferred();
    brandApi.getRuntimeProductTypes.mockReturnValue(request.promise);

    const actionPromise = useBrandStore.getState().fetchRuntimeProductTypesAction();

    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.FETCH_RUNTIME_PRODUCT_TYPES)).toBe(true);
    request.reject({ response: { status: 503, data: { error: 'SERVICE_UNAVAILABLE' } } });

    const result = await actionPromise;
    expect(result.ok).toBe(false);
    expect(result.error).toMatchObject({ status: 503 });
    expect(useBrandStore.getState().error).toEqual(result.error);
    expect(useBrandStore.getState().runtimeProductTypesLoading).toBe(false);
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.FETCH_RUNTIME_PRODUCT_TYPES)).toBe(false);
  });

  it('returns cached dropdowns without opening an ADS loading operation', async () => {
    const fetchKey = JSON.stringify({ includeInactive: false, productTypeId: 7 });
    useBrandStore.setState({
      items: [{ id: 2, name: 'Epson' }],
      dropdownsLoaded: true,
      lastFetchKey: fetchKey,
    });

    const result = await useBrandStore
      .getState()
      .fetchBrandDropdownsAction({ productTypeId: 7, includeInactive: false });

    expect(result).toEqual({
      ok: true,
      cached: true,
      items: [{ id: 2, name: 'Epson' }],
    });
    expect(brandApi.getBrandDropdowns).not.toHaveBeenCalled();
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.FETCH_DROPDOWNS)).toBe(false);
  });

  it.each([
    ['all options', 'fetchAllBrandOptionsAction', 'getBrandDropdowns', BRAND_RUNTIME_OPERATIONS.FETCH_ALL_OPTIONS],
    ['product type links', 'fetchProductTypeBrandLinksAction', 'getProductTypeBrandLinks', BRAND_RUNTIME_OPERATIONS.FETCH_PRODUCT_TYPE_LINKS],
  ])('tracks %s with its own operation key', async (_label, actionName, apiName, operation) => {
    const request = deferred();
    brandApi[apiName].mockReturnValue(request.promise);

    const actionPromise =
      actionName === 'fetchProductTypeBrandLinksAction'
        ? useBrandStore.getState()[actionName]({ productTypeId: 9 })
        : useBrandStore.getState()[actionName]();

    expect(loading.isLoading(operation)).toBe(true);
    request.resolve(actionName === 'fetchProductTypeBrandLinksAction' ? { items: [] } : []);
    await actionPromise;
    expect(loading.isLoading(operation)).toBe(false);
  });
});
