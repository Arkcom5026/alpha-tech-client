// src/features/receiving/quick-stock/api/quickStockApi.js
//
// QuickStock Runtime API boundary.
//
// QuickStock owns its intake and dropdown transports while legacy product adapters
// continue delegating to existing feature APIs until their separate governance cutover.

import apiClient from "@/utils/apiClient";
import { parseApiError } from "@/utils/uiHelpers";
import {
  createQuickReceiveLocalOperationalProduct,
  createQuickReceiveOperationalProductFromTemplate,
  getQuickReceiveOperationalProductByTemplateId,
  getQuickReceiveOperationalProducts,
  getQuickReceiveTemplateProducts,
} from "@/features/quickReceive/api/quickReceiveProductApi";
import {
  deleteProduct as deleteProductApi,
  updateProduct,
} from "@/features/product/api/productApi";
import { commitQuickStockExistingIntakeApi } from "./quickStockIntakeApi";

const stripEmptyParams = (obj = {}) => Object.fromEntries(
  Object.entries(obj).filter(([, value]) => value !== "" && value !== undefined && value !== null)
);

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
    getQuickReceiveOperationalProducts(filters),
    getQuickReceiveTemplateProducts(filters),
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
  const raw = await getQuickReceiveOperationalProductByTemplateId(templateProductId);
  return extractSingle(raw);
};

export const createQuickStockOperationalProductFromTemplate = async (payload) => {
  return createQuickReceiveOperationalProductFromTemplate(payload);
};

export const createQuickStockLocalOperationalProduct = async (payload) => {
  return createQuickReceiveLocalOperationalProduct(payload);
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
