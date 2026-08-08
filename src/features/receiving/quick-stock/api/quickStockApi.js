// src/features/receiving/quick-stock/api/quickStockApi.js
//
// QuickStock Runtime API boundary.
//
// QuickStock owns its intake, dropdown, and product adapter transports.

import apiClient from "@/utils/apiClient";
import { parseApiError } from "@/utils/uiHelpers";
import {
  deleteProduct as deleteProductApi,
  updateProduct,
} from "@/features/product/api/productApi";
import { commitQuickStockExistingIntakeApi } from "./quickStockIntakeApi";

const stripEmptyParams = (obj = {}) => Object.fromEntries(
  Object.entries(obj).filter(([, value]) => value !== "" && value !== undefined && value !== null)
);

const hasSearchIntent = (params = {}) => {
  const productTypeId = Number(params.productTypeId);
  const brandId = Number(params.brandId);
  const search = String(params.search || params.searchText || params.keyword || "").trim();
  return Boolean((Number.isFinite(productTypeId) && productTypeId > 0) || (Number.isFinite(brandId) && brandId > 0) || search);
};

const emptySearchResponse = Object.freeze({ items: [], products: [], total: 0, source: "quick-receive-idle" });

const getQuickStockOperationalProducts = async (filters = {}) => {
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

const getQuickStockTemplateProducts = async (filters = {}) => {
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

const extractList = (raw) => {
  if (Array.isArray(raw)) return raw;

  const payload = raw?.data ?? raw;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const extractSingle = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] || null;

  return (
    raw?.product ||
    raw?.data?.product ||
    raw?.data?.item ||
    raw?.data ||
    raw?.result?.product ||
    raw?.result?.item ||
    raw?.result ||
    raw?.item ||
    null
  );
};

export const normalizeQuickStockError = (err, fallbackMessage = "เกิดข้อผิดพลาด") => ({
  code: err?.code || err?.error || err?.data?.error || err?.response?.data?.error,
  message:
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    (typeof err === "string" ? err : "") ||
    fallbackMessage,
  raw: err,
});

export const getQuickStockDropdowns = async ({ productTypeId } = {}) => {
  try {
    const params = stripEmptyParams({ productTypeId, _ts: Date.now() });
    const { data } = await apiClient.get('quick-stock/dropdowns', { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const searchQuickStockProducts = async (filters = {}) => {
  const [operationalResult, templateResult] = await Promise.allSettled([
    getQuickStockOperationalProducts(filters),
    getQuickStockTemplateProducts(filters),
  ]);

  const operationalProducts =
    operationalResult.status === "fulfilled" ? extractList(operationalResult.value) : [];
  const templateProducts =
    templateResult.status === "fulfilled" ? extractList(templateResult.value) : [];
  const searchProducts = [...operationalProducts, ...templateProducts];

  return {
    operationalProducts,
    templateProducts,
    searchProducts,
  };
};

export const getQuickStockOperationalProductByTemplateId = async (templateProductId) => {
  try {
    if (!templateProductId) {
      const error = new Error('ไม่พบ templateProductId');
      error.code = 'TEMPLATE_PRODUCT_ID_MISSING';
      throw error;
    }
    const { data } = await apiClient.get(`products/pos/runtime-by-template/${templateProductId}`, {
      params: { _ts: Date.now() },
    });
    return extractSingle(data);
  } catch (err) {
    throw parseApiError(err);
  }
};

export const createQuickStockOperationalProductFromTemplate = async (payload = {}) => {
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;
    const { data } = await apiClient.post('products/pos/create-from-template', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const createQuickStockLocalOperationalProduct = async (payload = {}) => {
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

export const updateQuickStockOperationalProduct = async (id, payload) => {
  return updateProduct(id, payload);
};

export const deleteQuickStockOperationalProduct = async (id) => {
  await deleteProductApi(id);
  return true;
};

export const commitQuickStockExistingIntake = async (payload) => {
  return commitQuickStockExistingIntakeApi(payload);
};

export default {
  getQuickStockDropdowns,
  searchQuickStockProducts,
  getQuickStockOperationalProductByTemplateId,
  createQuickStockOperationalProductFromTemplate,
  createQuickStockLocalOperationalProduct,
  updateQuickStockOperationalProduct,
  deleteQuickStockOperationalProduct,
  commitQuickStockExistingIntake,
};
