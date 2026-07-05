// src/features/product/api/productCreateApi.js

import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ''
    )
  );

// ======================================================
// Product Create Runtime
// ======================================================

export const getProductCreateDropdowns = async ({
  productTypeId,
  includeInactive = false,
  templateBranchCode,
} = {}) => {
  try {
    const params = cleanParams({
      productTypeId,
      includeInactive,
      templateBranchCode,
      _ts: Date.now(),
    });

    const { data } = await apiClient.get(
      'product-create/dropdowns',
      { params }
    );

    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ======================================================
// Brand Dropdown
// ======================================================

export const getProductCreateBrands = async ({
  productTypeId,
  includeInactive = false,
  templateBranchCode,
} = {}) => {
  try {
    const params = cleanParams({
      productTypeId,
      includeInactive,
      templateBranchCode,
      _ts: Date.now(),
    });

    const { data } = await apiClient.get(
      'product-create/brands',
      { params }
    );

    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ======================================================
// Existing Product Preview
// ======================================================

export const getExistingOperationalModels = async ({
  targetBranchId,
  productTypeId,
  brandId,
  search,
  limit = 30,
} = {}) => {
  try {
    const params = cleanParams({
      targetBranchId,
      productTypeId,
      brandId,
      q: search,
      limit,
      _ts: Date.now(),
    });

    const { data } = await apiClient.get(
      'product-create/existing-models',
      { params }
    );

    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};