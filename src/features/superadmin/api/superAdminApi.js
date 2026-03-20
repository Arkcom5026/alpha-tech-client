

// ===============================
// superAdminApi.js
// Location: src/features/superadmin/api/superAdminApi.js
// ===============================

import apiClient from '@/utils/apiClient';

const SUPERADMIN_CATEGORY_ENDPOINT = '/superadmin/categories';

const normalizeQueryParams = (params = {}) => {
  const query = {};

  if (params && typeof params.q === 'string' && params.q.trim()) {
    query.q = params.q.trim();
  }

  if (params && typeof params.active === 'boolean') {
    query.active = params.active;
  }

  if (params && typeof params.includeSystem === 'boolean') {
    query.includeSystem = params.includeSystem;
  }

  return query;
};

const normalizeCategoryPayload = (payload = {}) => {
  return {
    name: String((payload && payload.name) || '').trim(),
    active: payload && typeof payload.active === 'boolean' ? payload.active : true,
  };
};

export const getSuperAdminCategories = async (params = {}) => {
  const response = await apiClient.get(SUPERADMIN_CATEGORY_ENDPOINT, {
    params: normalizeQueryParams(params),
  });

  return response && response.data;
};

export const createSuperAdminCategory = async (payload = {}) => {
  const response = await apiClient.post(
    SUPERADMIN_CATEGORY_ENDPOINT,
    normalizeCategoryPayload(payload)
  );

  return response && response.data;
};

export const updateSuperAdminCategory = async (categoryId, payload = {}) => {
  const safeCategoryId = Number(categoryId);

  if (!Number.isInteger(safeCategoryId) || safeCategoryId <= 0) {
    throw new Error('Invalid category id');
  }

  const response = await apiClient.put(
    `${SUPERADMIN_CATEGORY_ENDPOINT}/${safeCategoryId}`,
    normalizeCategoryPayload(payload)
  );

  return response && response.data;
};

// NOTE:
// - Do NOT wrap with try/catch here; let errors bubble to the store layer
// - This API layer is the only place that should call apiClient for SuperAdmin categories
// - FE endpoint uses '/superadmin/categories' because apiClient already injects '/api' as baseURL
// - Effective request path becomes: /api/superadmin/categories








