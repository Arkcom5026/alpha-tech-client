import { normalizeRuntimeError, withLoading } from '@/runtime';

export const BRAND_RUNTIME_OPERATION = Object.freeze({
  FETCH_RUNTIME_PRODUCT_TYPES: 'brand.fetchRuntimeProductTypes',
  FETCH_DROPDOWNS: 'brand.fetchDropdowns',
  FETCH_LIST: 'brand.fetchList',
  FETCH_ALL_OPTIONS: 'brand.fetchAllOptions',
  CREATE: 'brand.create',
  UPDATE: 'brand.update',
  TOGGLE_ACTIVE: 'brand.toggleActive',
  FETCH_PRODUCT_TYPE_LINKS: 'brand.fetchProductTypeLinks',
  ATTACH_TO_PRODUCT_TYPE: 'brand.attachToProductType',
  DETACH_FROM_PRODUCT_TYPE: 'brand.detachFromProductType',
});

export const normalizeBrandRuntimeError = (error) => normalizeRuntimeError(error);

export const withBrandRuntime = (operation, task) => withLoading(operation, task);
