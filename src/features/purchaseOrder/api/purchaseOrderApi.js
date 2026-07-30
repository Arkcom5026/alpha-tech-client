// src/features/purchaseOrder/api/purchaseOrderApi.js
import apiClient from '@/utils/apiClient.js';

const buildParams = ({ search, status, page, pageSize } = {}) => {
  const params = {};
  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
  }
  if (status && status !== 'all') {
    const list = Array.isArray(status) ? status : String(status).split(',');
    params.status = list
      .map((s) => String(s).trim().toUpperCase())
      .filter(Boolean)
      .join(',');
  }
  if (Number.isFinite(page)) params.page = page;
  if (Number.isFinite(pageSize)) params.pageSize = pageSize;
  return params;
};

const unwrapData = (payload) => (
  payload && payload.success && Object.prototype.hasOwnProperty.call(payload, 'data')
    ? payload.data
    : payload
);

export const getSuppliers = async (params = {}) => {
  const res = await apiClient.get('/suppliers', { params });
  return res.data;
};

export const getPurchaseOrderDropdowns = async () => {
  const [productTypes, brands] = await Promise.allSettled([
    apiClient.get('/product-types/dropdowns', {
      params: { includeInactive: 'false', _ts: Date.now() },
    }),
    apiClient.get('/brands/dropdowns', {
      params: { includeInactive: 'false', _ts: Date.now() },
    }),
  ]);

  return {
    productTypes: productTypes.status === 'fulfilled' ? productTypes.value.data : [],
    brands: brands.status === 'fulfilled' ? brands.value.data : [],
  };
};

export const getPurchaseOrderBrandsByProductType = async (productTypeId) => {
  const res = await apiClient.get('/brands/dropdowns', {
    params: {
      productTypeId,
      includeInactive: 'false',
      _ts: Date.now(),
    },
  });
  return res.data;
};

export const searchPurchaseOrderProducts = async ({ productTypeId, brandId, search } = {}) => {
  const res = await apiClient.get('/products/pos/search', {
    params: {
      productTypeId: productTypeId || undefined,
      brandId: brandId || undefined,
      search: search || undefined,
      take: 50,
      pageSize: 50,
      activeOnly: 'true',
      _ts: Date.now(),
    },
  });
  return res.data;
};

export const getPurchaseOrders = async (opts = {}) => {
  const res = await apiClient.get('/purchase-orders', {
    params: buildParams(opts),
  });
  return res.data;
};

export const getPurchaseOrderById = async (id) => {
  const res = await apiClient.get(`/purchase-orders/${id}`);
  return unwrapData(res.data);
};

export const getPurchaseOrderDetailById = getPurchaseOrderById;

export const createPurchaseOrder = async (data) => {
  const res = await apiClient.post('/purchase-orders', data);
  return res.data;
};

export const updatePurchaseOrder = async (id, data) => {
  const res = await apiClient.put(`/purchase-orders/${id}`, data);
  return res.data;
};

export const updatePurchaseOrderStatus = async ({ id, status }) => {
  const res = await apiClient.patch(`/purchase-orders/${id}/status`, { status });
  return res.data;
};

export const deletePurchaseOrder = async (id) => {
  const res = await apiClient.delete(`/purchase-orders/${id}`);
  return res.data;
};
