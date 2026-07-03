// src/features/productTemplate/api/productTemplateApi.js
// Mission C — Product Template Governance API

import apiClient from '@/utils/apiClient';

const unwrapItem = (payload) => payload?.data ?? payload?.item ?? payload;

const sanitizeParams = (params = {}) => {
  const out = {};
  const q = params.q ?? params.search ?? params.searchText;
  if (q != null && String(q).trim()) out.q = String(q).trim();

  ['page', 'limit', 'productTypeId', 'brandId', 'categoryId'].forEach((key) => {
    const value = params[key];
    if (value === undefined || value === null || value === '') return;
    const n = Number(value);
    if (!Number.isNaN(n)) out[key] = n;
  });

  if (params.includeInactive !== undefined) {
    const value = params.includeInactive;
    out.includeInactive = typeof value === 'string' ? value === 'true' : !!value;
  }

  if (params.mode) out.mode = String(params.mode);
  if (params.templateBranchCode) out.templateBranchCode = String(params.templateBranchCode);
  return out;
};

const normalizeListResponse = (res) => {
  const data = res?.data ?? {};

  if (Array.isArray(data)) {
    const totalItems = Number(res?.headers?.['x-total-count'] ?? data.length);
    const page = Number(res?.headers?.['x-page'] ?? 1);
    const limit = Number(res?.headers?.['x-limit'] ?? data.length || 20);
    const totalPages = Math.max(1, Math.ceil(totalItems / (limit || 1)));
    return { items: data, totalPages, totalItems, page, limit };
  }

  const items = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.data)
      ? data.data
      : [];

  const totalItems = Number(data.totalItems ?? data.total ?? data.count ?? items.length) || 0;
  const limit = Number(data.limit ?? data.pageSize ?? 20) || 20;

  return {
    items,
    totalPages: Number(data.totalPages ?? Math.max(1, Math.ceil(totalItems / limit))) || 1,
    totalItems,
    page: Number(data.page ?? 1) || 1,
    limit,
    templateBranch: data.templateBranch ?? null,
  };
};

export const getProductTemplates = async (params = {}) => {
  const qp = sanitizeParams(params);
  const res = await apiClient.get('/product-templates', { params: qp });
  return normalizeListResponse(res);
};

export const getProductTemplateById = async (id) => {
  const res = await apiClient.get(`/product-templates/${id}`);
  return unwrapItem(res.data);
};

export const createProductTemplate = async (payload) => {
  const res = await apiClient.post('/product-templates', payload);
  return unwrapItem(res.data);
};

export const updateProductTemplate = async (id, payload) => {
  const res = await apiClient.patch(`/product-templates/${id}`, payload);
  return unwrapItem(res.data);
};

export const archiveProductTemplate = async (id) => {
  const res = await apiClient.patch(`/product-templates/${id}/archive`);
  return unwrapItem(res.data);
};

export const restoreProductTemplate = async (id) => {
  const res = await apiClient.patch(`/product-templates/${id}/restore`);
  return unwrapItem(res.data);
};

export const toggleActive = async (id) => {
  const res = await apiClient.patch(`/product-templates/${id}/toggle-active`);
  return unwrapItem(res.data);
};
