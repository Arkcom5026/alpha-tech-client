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

describe('brand store ADS product type link runtime adoption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loading.reset();
    resetStore();
  });

  it('keeps the attach operation active through nested refreshes', async () => {
    const attachRequest = deferred();
    brandApi.attachBrandToProductType.mockReturnValue(attachRequest.promise);
    brandApi.getProductTypeBrandLinks.mockResolvedValue({
      items: [{ id: 31, productTypeId: 7, brandId: 9 }],
    });
    brandApi.getBrands.mockResolvedValue({
      items: [{ id: 9, name: 'Canon' }],
      page: 1,
      pageSize: 20,
      total: 1,
    });

    const actionPromise = useBrandStore
      .getState()
      .attachBrandToProductTypeAction({ productTypeId: 7, brandId: 9 });

    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.ATTACH_TO_PRODUCT_TYPE)).toBe(true);
    expect(useBrandStore.getState().saving).toBe(true);

    attachRequest.resolve({ id: 31, productTypeId: 7, brandId: 9 });

    await expect(actionPromise).resolves.toEqual({
      ok: true,
      data: { id: 31, productTypeId: 7, brandId: 9 },
    });

    expect(brandApi.getProductTypeBrandLinks).toHaveBeenCalledWith({
      productTypeId: 7,
      includeInactive: true,
    });
    expect(brandApi.getBrands).toHaveBeenCalledWith({
      q: '',
      page: 1,
      pageSize: 20,
      includeInactive: false,
      productTypeId: 7,
    });
    expect(
      brandApi.getProductTypeBrandLinks.mock.invocationCallOrder[0]
    ).toBeLessThan(brandApi.getBrands.mock.invocationCallOrder[0]);
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.ATTACH_TO_PRODUCT_TYPE)).toBe(false);
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.FETCH_PRODUCT_TYPE_LINKS)).toBe(false);
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.FETCH_LIST)).toBe(false);
    expect(useBrandStore.getState().saving).toBe(false);
  });

  it('tracks detach separately and preserves refresh order', async () => {
    brandApi.detachBrandFromProductType.mockResolvedValue({ id: 31 });
    brandApi.getProductTypeBrandLinks.mockResolvedValue({ items: [] });
    brandApi.getBrands.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0 });

    const result = await useBrandStore
      .getState()
      .detachBrandFromProductTypeAction({ id: 31, productTypeId: 7 });

    expect(result).toEqual({ ok: true, data: { id: 31 } });
    expect(brandApi.detachBrandFromProductType).toHaveBeenCalledWith({ id: 31 });
    expect(
      brandApi.getProductTypeBrandLinks.mock.invocationCallOrder[0]
    ).toBeLessThan(brandApi.getBrands.mock.invocationCallOrder[0]);
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.DETACH_FROM_PRODUCT_TYPE)).toBe(false);
    expect(useBrandStore.getState().saving).toBe(false);
  });

  it('normalizes invalid attach input without calling the API', async () => {
    const result = await useBrandStore
      .getState()
      .attachBrandToProductTypeAction({ productTypeId: '', brandId: null });

    expect(result.ok).toBe(false);
    expect(result.error).toMatchObject({ message: 'INVALID_PRODUCTTYPE_OR_BRAND' });
    expect(useBrandStore.getState().error).toEqual(result.error);
    expect(useBrandStore.getState().saving).toBe(false);
    expect(brandApi.attachBrandToProductType).not.toHaveBeenCalled();
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.ATTACH_TO_PRODUCT_TYPE)).toBe(false);
  });

  it('normalizes detach API failures and clears mutation loading', async () => {
    brandApi.detachBrandFromProductType.mockRejectedValue({
      response: { status: 409, data: { error: 'LINK_IN_USE' } },
    });

    const result = await useBrandStore
      .getState()
      .detachBrandFromProductTypeAction({ id: 31, productTypeId: 7 });

    expect(result.ok).toBe(false);
    expect(result.error).toMatchObject({ status: 409 });
    expect(useBrandStore.getState().error).toEqual(result.error);
    expect(useBrandStore.getState().saving).toBe(false);
    expect(brandApi.getProductTypeBrandLinks).not.toHaveBeenCalled();
    expect(brandApi.getBrands).not.toHaveBeenCalled();
    expect(loading.isLoading(BRAND_RUNTIME_OPERATIONS.DETACH_FROM_PRODUCT_TYPE)).toBe(false);
  });
});
