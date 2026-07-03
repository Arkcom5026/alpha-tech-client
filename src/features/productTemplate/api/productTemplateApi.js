// src/features/productTemplate/api/productTemplateApi.js
// Mission C — Product Template Governance API

import apiClient from '@/utils/apiClient';

const unwrapItem = (p) => p?.data ?? p?.item ?? p;
const unwrapList = (p) => {
  const data = p?.data ?? p;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const sanitizeParams = (params = {}) => {
  const out = {};
  const q = params.q ?? params.search ?? params.searchText;
  if (q != null && String(q).trim()) out.q = String(q).trim();
  ['page', 'limit', 'productTypeId', 'brandId', 'categoryId'].forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null && v !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) out[k] = n;
    }
  });
  if (params.includeInactive !== undefined) out.includeInactive = typeof params.includeInactive === 'string' ? params.includeInactive === 'true' : !!params.includeInactive;
  if (params.mode) out.mode = String(params.mode);
  if (params.templateBranchCode) out.templateBranchCode = String(params.templateBranchCode);
  return out;
};

const normalizeListResponse = (res) => {
  const data = res?.data ?? {};
  if (Array.isArray(data)) {
    const totalItems = Number((res?.headers?.['x-total-count'] ?? data.length) || 0);
    const page = Number(res?.headers?.['x-page'] ?? 1);
    const rawLimit = res?.headers?.['x-limit'] ?? data.length;
    const limit = Number(rawLimit || 20);
    return { items: data, totalItems, page, limit, totalPages: Math.max(1, Math.ceil(totalItems / (limit || 1))) };
  }
  const items = Array.isArray(data.items) ? data.items : Array.isArray(data.data) ? data.data : [];
  const totalItems = Number(data.totalItems ?? data.total ?? data.count ?? items.length) || 0;
  const limit = Number(data.limit ?? data.pageSize ?? 20) || 20;
  return { items, totalItems, limit, page: Number(data.page ?? 1) || 1, totalPages: Number(data.totalPages ?? Math.max(1, Math.ceil(totalItems / limit))) || 1, templateBranch: data.templateBranch ?? null };
};

const mapOption = (item) => ({
  id: item?.id,
  name: item?.name || item?.title || item?.label || `ID ${item?.id}`,
  branchId: item?.branchId,
  active: item?.active !== false,
  raw: item,
});

export const getProductTemplates = async (params = {}) => normalizeListResponse(await apiClient.get('/product-templates', { params: sanitizeParams(params) }));
export const getProductTemplateById = async (id) => unwrapItem((await apiClient.get(`/product-templates/${id}`)).data);
export const createProductTemplate = async (payload) => unwrapItem((await apiClient.post('/product-templates', payload)).data);
export const updateProductTemplate = async (id, payload) => unwrapItem((await apiClient.patch(`/product-templates/${id}`, payload)).data);
export const archiveProductTemplate = async (id) => unwrapItem((await apiClient.patch(`/product-templates/${id}/archive`)).data);
export const restoreProductTemplate = async (id) => unwrapItem((await apiClient.patch(`/product-templates/${id}/restore`)).data);
export const toggleActive = async (id) => unwrapItem((await apiClient.patch(`/product-templates/${id}/toggle-active`)).data);

export const getCatalogMasterOptions = async () => {
  const [productTypesRes, brandsRes, categoriesRes, unitsRes] = await Promise.allSettled([
    apiClient.get('/product-types', { params: { includeInactive: false, take: 1000, limit: 1000 } }),
    apiClient.get('/brands', { params: { includeInactive: false, take: 1000, limit: 1000 } }),
    apiClient.get('/categories', { params: { includeInactive: false, take: 1000, limit: 1000 } }),
    apiClient.get('/units', { params: { take: 1000, limit: 1000 } }),
  ]);

  const toOptions = (settled) => (settled.status === 'fulfilled' ? unwrapList(settled.value.data).map(mapOption).filter((item) => item.id) : []);

  return {
    productTypes: toOptions(productTypesRes),
    brands: toOptions(brandsRes),
    categories: toOptions(categoriesRes),
    units: toOptions(unitsRes),
    errors: [productTypesRes, brandsRes, categoriesRes, unitsRes].filter((item) => item.status === 'rejected').map((item) => item.reason?.message || 'load failed'),
  };
};
