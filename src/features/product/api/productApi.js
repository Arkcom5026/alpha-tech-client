import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';
import { getProductTypeDropdowns, getProductTypes } from '@/features/productType/api/productTypeApi';

export const getProducts = async ({ search, status, categoryId, productTypeId, brandId, take, takeNum, page, skipNum } = {}) => {
  try {
    const params = { _ts: Date.now() };
    if (search?.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;
    if (categoryId) params.categoryId = categoryId;
    if (productTypeId) params.productTypeId = productTypeId;
    if (brandId) params.brandId = brandId;
    if (take || takeNum) params.take = take || takeNum;
    if (page) params.page = page;
    if (skipNum !== undefined) params.skipNum = skipNum;
    const { data } = await apiClient.get('products', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductById = async (id) => {
  try {
    const { data } = await apiClient.get(`products/${id}`, { params: { _ts: Date.now(), v: 'full' }});
    if (import.meta.env?.DEV) console.log('[productApi] getProductById', id, data);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const createProduct = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] createProduct payload', payload);
    const { data } = await apiClient.post('products', payload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const updateProduct = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`products/${id}`, payload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const updateProductAndGet = async (id, payload) => {
  try {
    await apiClient.patch(`products/${id}`, payload);
    const { data: fresh } = await apiClient.get(`products/${id}`, { params: { _ts: Date.now(), v: 'full' } });
    if (import.meta.env?.DEV) console.log('[productApi] updateProductAndGet fresh', id, fresh);
    return fresh;
  } catch (err) { throw parseApiError(err); }
};

export const saveProduct = updateProductAndGet;

export const deleteProduct = async (id) => {
  try {
    const { data } = await apiClient.delete(`products/${id}`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const disableProduct = async (id) => {
  try {
    const { data } = await apiClient.post(`products/${id}/disable`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const enableProduct = async (id) => {
  try {
    const { data } = await apiClient.post(`products/${id}/enable`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductDropdownsPublic = async () => {
  try {
    const { data } = await apiClient.get('products/online/dropdowns', { params: { _ts: Date.now() }});
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductDropdowns = async () => {
  try {
    const { data } = await apiClient.get('products/dropdowns', { params: { _ts: Date.now() }});
    return data;
  } catch (err) { throw parseApiError(err); }
};

const pickDropdownItems = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.rows)) return raw.rows;
  if (Array.isArray(raw?.records)) return raw.records;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.items)) return raw.data.items;
  if (Array.isArray(raw?.data?.rows)) return raw.data.rows;
  if (Array.isArray(raw?.data?.records)) return raw.data.records;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
};

const getDropdownId = (item) => item?.id ?? item?.value ?? item?.productTypeId ?? item?.typeId ?? item?.product_type_id;
const getDropdownName = (item) => item?.name ?? item?.label ?? item?.title ?? item?.text ?? item?.productTypeName ?? item?.typeName;

const mergeUniqueById = (...lists) => {
  const map = new Map();
  lists.flat().forEach((item) => {
    const id = getDropdownId(item);
    const name = getDropdownName(item);
    if (id == null || !String(name ?? '').trim()) return;
    map.set(String(id), {
      ...item,
      id: Number.isFinite(Number(id)) ? Number(id) : id,
      name: String(name).trim(),
    });
  });
  return Array.from(map.values()).sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'th'));
};

const loadProductCreateTypeOptions = async () => {
  const results = await Promise.allSettled([
    getProductTypeDropdowns({ active: true }),
    getProductTypes({ includeInactive: false, limit: 1000 }),
  ]);

  return mergeUniqueById(
    ...results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => pickDropdownItems(result.value))
  );
};

export const getCatalogDropdowns = async ({ scope = 'pos' } = {}) => {
  try {
    const raw = scope === 'online'
      ? await getProductDropdownsPublic()
      : await getProductDropdowns();

    const {
      categories = [],
      productTypes = [],
      productProfiles = [],
      brands = [],
      productTypeBrands = [],
      productTypeBrandMap = {},
      units = [],
      productTemplates,
      templates = [],
    } = raw || {};

    let productTypeDropdowns = [];
    if (scope !== 'online') {
      try {
        productTypeDropdowns = await loadProductCreateTypeOptions();
      } catch (_) {
        productTypeDropdowns = [];
      }
    }

    const tpl = Array.isArray(productTemplates) ? productTemplates : (templates || []);

    return {
      categories,
      productTypes: mergeUniqueById(productTypes, productTypeDropdowns),
      profiles: productProfiles,
      productProfiles,
      brands,
      productTypeBrands,
      productTypeBrandMap,
      units,
      templates: tpl,
      productTemplates: tpl,
    };
  } catch (err) { throw parseApiError(err); }
};

const __buildOnlineParams = (obj = {}) => Object.fromEntries(
  Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
);

export const getOnlineProducts = async ({
  search,
  page = 1,
  pageSize = 24,
  sort = 'newest',
  categoryId,
  productTypeId,
  productProfileId,
  productTemplateId,
  branch,
} = {}) => {
  try {
    const params = __buildOnlineParams({ search, page, pageSize, sort, categoryId, productTypeId, productProfileId, productTemplateId, branch, _ts: Date.now() });
    const { data } = await apiClient.get('products/online/search', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductOnlineById = async (id, { branch } = {}) => {
  try {
    const params = __buildOnlineParams({ branch, _ts: Date.now() });
    const { data = {} } = await apiClient.get(`products/online/detail/${id}`, { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductPrices = async (productId) => {
  try {
    const { data } = await apiClient.get(`products/${productId}/prices`, { params: { _ts: Date.now() }});
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const updateProductPrices = async (productId, prices) => {
  try {
    const { data } = await apiClient.put(`products/${productId}/prices`, { prices });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const addProductPrice = async (productId, priceData) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] addProductPrice', { productId, priceData });
    const { data } = await apiClient.post(`products/${productId}/prices`, priceData);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const deleteProductPrice = async (productId, priceId) => {
  try {
    const { data } = await apiClient.delete(`products/${productId}/prices/${priceId}`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductsForPos = async (filters = {}) => {
  try {
    const sanitized = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    delete sanitized.branchId;

    const params = { ...sanitized, _ts: Date.now() };
    const { data } = await apiClient.get('products/pos/search', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const searchTemplateProducts = async (filters = {}) => {
  try {
    const sanitized = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    delete sanitized.branchId;
    delete sanitized.template;

    const params = { ...sanitized, _ts: Date.now() };
    const { data } = await apiClient.get('products/template/search', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getTemplateProductsForPos = searchTemplateProducts;

export const migrateSnToSimple = async (productId) => {
  try {
    const { data } = await apiClient.post(`products/${productId}/migrate-to-simple`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getReadyToSell = async ({ branchId, q = '', mode = 'ALL', page = 1, pageSize = 50, sort = 'receivedAt_desc' } = {}) => {
  try {
    if (!branchId) {
      const e = new Error('ไม่พบ branchId กรุณา login ใหม่');
      e.code = 'BRANCH_ID_MISSING';
      throw e;
    }

    const params = {
      branchId,
      q: q?.trim() ? q.trim() : undefined,
      mode,
      page,
      pageSize,
      sort,
      _ts: Date.now(),
    };

    const { data } = await apiClient.get('products/ready-to-sell', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getReadyToSellStructuredDetails = async ({ branchId, productId, q = '' } = {}) => {
  try {
    if (!branchId) {
      const e = new Error('ไม่พบ branchId กรุณา login ใหม่');
      e.code = 'BRANCH_ID_MISSING';
      throw e;
    }
    if (!productId) {
      const e = new Error('ไม่พบ productId');
      e.code = 'PRODUCT_ID_MISSING';
      throw e;
    }

    const params = {
      branchId,
      q: q?.trim() ? q.trim() : undefined,
      _ts: Date.now(),
    };

    const { data } = await apiClient.get(`products/ready-to-sell/structured/${productId}`, { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const enrollQuickStock = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] enrollQuickStock payload', payload);
    const { data } = await apiClient.post('quick-stock/quick-enroll', payload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const quickStockInAllInOneApi = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] quickStockInAllInOneApi payload', payload);
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;

    const { data } = await apiClient.post('quick-stock/all-in-one', sanitizedPayload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const quickReceiveExistingProductApi = async (payload = {}) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] quickReceiveExistingProductApi payload', payload);

    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;
    delete sanitizedPayload.movementType;
    delete sanitizedPayload.source;

    const rawItems = sanitizedPayload.items ?? sanitizedPayload.barcodes ?? sanitizedPayload.queue ?? [];
    const items = Array.isArray(rawItems)
      ? rawItems
          .map((item) => {
            if (typeof item === 'string') {
              return { barcode: item, serialNumber: item };
            }
            const barcode = item?.barcode ?? item?.serialNumber ?? item?.sn ?? '';
            const serialNumber = item?.serialNumber ?? item?.barcode ?? item?.sn ?? '';
            return { ...item, barcode, serialNumber };
          })
          .filter((item) => item?.barcode || item?.serialNumber)
      : [];

    sanitizedPayload.items = items;
    delete sanitizedPayload.barcodes;
    delete sanitizedPayload.queue;

    const { data } = await apiClient.post('quick-stock/existing', sanitizedPayload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const createOperationalProductFromTemplateApi = async (payload = {}) => {
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;

    const { data } = await apiClient.post('products/pos/create-from-template', sanitizedPayload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const createLocalOperationalProductApi = async (payload = {}) => {
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;
    delete sanitizedPayload.templateProductId;
    delete sanitizedPayload.productTemplateId;
    delete sanitizedPayload.items;
    delete sanitizedPayload.barcodes;
    delete sanitizedPayload.queue;
    delete sanitizedPayload.quantity;
    delete sanitizedPayload.stock;
    delete sanitizedPayload.movementType;
    delete sanitizedPayload.source;

    const { data } = await apiClient.post('products/pos/create-local', sanitizedPayload);
    return data;
  } catch (err) { throw parseApiError(err); }
};
