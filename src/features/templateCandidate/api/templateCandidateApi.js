import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

const BASE_PATH = 'product-templates/candidates';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries({ _ts: Date.now(), ...params }).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    })
  );

const request = async (operation) => {
  try {
    const { data } = await operation();
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const listCanonicalProductGroupsApi = (params = {}) =>
  request(() => apiClient.get(`${BASE_PATH}/groups`, { params: cleanParams(params) }));

export const getCanonicalProductGroupApi = (groupKey, params = {}) =>
  request(() =>
    apiClient.get(`${BASE_PATH}/groups/${encodeURIComponent(groupKey)}`, {
      params: cleanParams(params),
    })
  );

export const listTemplateCandidatesApi = (params = {}) =>
  request(() => apiClient.get(BASE_PATH, { params: cleanParams(params) }));

export const getTemplateCandidateApi = (id) =>
  request(() => apiClient.get(`${BASE_PATH}/${id}`, { params: cleanParams() }));

export const createTemplateCandidateApi = (payload) =>
  request(() => apiClient.post(BASE_PATH, payload));

export const startTemplateCandidateReviewApi = (id) =>
  request(() => apiClient.post(`${BASE_PATH}/${id}/start-review`));

export const rejectTemplateCandidateApi = (id, payload = {}) =>
  request(() => apiClient.post(`${BASE_PATH}/${id}/reject`, payload));

export const mergeTemplateCandidateApi = (id, payload = {}) =>
  request(() => apiClient.post(`${BASE_PATH}/${id}/merge`, payload));

export const promoteTemplateCandidateApi = (id, payload = {}) =>
  request(() => apiClient.post(`${BASE_PATH}/${id}/promote`, payload));
