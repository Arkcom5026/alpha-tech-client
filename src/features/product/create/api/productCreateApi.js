// src/features/product/create/api/productCreateApi.js

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

const stripCreateRuntimeContext = (payload = {}) => {
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

  return sanitizedPayload;
};

const normalizeFiles = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof FileList !== 'undefined' && input instanceof FileList) return Array.from(input);
  return [input];
};

const normalizeCaptions = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return [String(input)];
};

// ======================================================
// Product Create Runtime Dropdowns
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
// Product Create Brand Dropdown
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
// Product Create Existing Product Preview
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

// ======================================================
// Product Create Submit
// ======================================================

export const createLocalOperationalProductCreateApi = async (payload = {}) => {
  try {
    const sanitizedPayload = stripCreateRuntimeContext(payload);
    const { data } = await apiClient.post('products/pos/create-local', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const createOperationalProductFromTemplateCreateApi = async (payload = {}) => {
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;

    const { data } = await apiClient.post('products/pos/create-from-template', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ======================================================
// Product Create Image Upload
// ======================================================

export const uploadProductCreateImages = async (productId, {
  files = [],
  captions = [],
  coverIndex = 0,
} = {}) => {
  const safeProductId = Number(productId);
  const safeFiles = normalizeFiles(files).filter((file) => {
    if (!file) return false;
    if (typeof File !== 'undefined' && file instanceof File) return true;
    if (typeof Blob !== 'undefined' && file instanceof Blob) return true;
    return false;
  });

  const safeCaptions = normalizeCaptions(captions);

  if (!Number.isFinite(safeProductId) || safeProductId <= 0) {
    throw new Error('productId is required for product image upload');
  }

  if (!safeFiles.length) return [];

  const results = [];

  for (let i = 0; i < safeFiles.length; i += 1) {
    const file = safeFiles[i];

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', String(safeCaptions?.[i] ?? ''));
      formData.append('coverIndex', String(coverIndex ?? 0));

      const { data } = await apiClient.post(
        `products/${safeProductId}/images/upload-full`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const uploaded = Array.isArray(data?.images) ? data.images : [];
      uploaded.forEach((image) => {
        if (!image?.url && !image?.secure_url) return;
        results.push({
          ...image,
          url: image.url || image.secure_url,
          secure_url: image.secure_url || image.url,
          caption: image.caption || '',
          isCover: !!image.isCover,
        });
      });
    } catch (err) {
      throw parseApiError(err);
    }
  }

  return results;
};
