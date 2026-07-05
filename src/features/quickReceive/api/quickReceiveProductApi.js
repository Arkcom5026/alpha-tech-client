// src/features/quickReceive/api/quickReceiveProductApi.js
// Product APIs used by Quick Receive / QuickStock workflow only.
// This file intentionally keeps Quick Receive from importing Product Create APIs.

import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

const stripEmptyParams = (obj = {}) => Object.fromEntries(
  Object.entries(obj).filter(([, value]) => value !== '' && value !== undefined && value !== null)
);

const hasSearchIntent = (params = {}) => {
  const productTypeId = Number(params.productTypeId);
  const brandId = Number(params.brandId);
  const search = String(params.search || params.searchText || params.keyword || '').trim();
  return Boolean((Number.isFinite(productTypeId) && productTypeId > 0) || (Number.isFinite(brandId) && brandId > 0) || search);
};

const emptySearchResponse = Object.freeze({ items: [], products: [], total: 0, source: 'quick-receive-idle' });

export const getQuickReceiveOperationalProducts = async (filters = {}) => {
  try {
    const sanitized = stripEmptyParams({ ...filters });
    delete sanitized.branchId;

    if (!hasSearchIntent(sanitized)) {
      return emptySearchResponse;
    }

    const params = { ...sanitized, _ts: Date.now() };
    const { data } = await apiClient.get('products/pos/search', { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const getQuickReceiveTemplateProducts = async (filters = {}) => {
  try {
    const sanitized = stripEmptyParams({ ...filters });
    delete sanitized.branchId;
    delete sanitized.template;

    if (!hasSearchIntent(sanitized)) {
      return emptySearchResponse;
    }

    const params = { ...sanitized, _ts: Date.now() };
    const { data } = await apiClient.get('products/template/search', { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const getQuickReceiveOperationalProductByTemplateId = async (templateProductId) => {
  try {
    if (!templateProductId) {
      const error = new Error('ไม่พบ templateProductId');
      error.code = 'TEMPLATE_PRODUCT_ID_MISSING';
      throw error;
    }
    const { data } = await apiClient.get(`products/pos/runtime-by-template/${templateProductId}`, {
      params: { _ts: Date.now() },
    });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const createQuickReceiveOperationalProductFromTemplate = async (payload = {}) => {
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;
    const { data } = await apiClient.post('products/pos/create-from-template', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const createQuickReceiveLocalOperationalProduct = async (payload = {}) => {
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
  } catch (err) {
    throw parseApiError(err);
  }
};
