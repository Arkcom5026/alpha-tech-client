// src/features/product/templateCandidate/api/templateCandidateApi.js
import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

const BASE_PATH = 'products/template-candidates';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries({ _ts: Date.now(), ...params }).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    })
  );

export const listTemplateCandidatesApi = async (params = {}) => {
  try {
    const { data } = await apiClient.get(BASE_PATH, { params: cleanParams(params) });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const getTemplateCandidateApi = async (id) => {
  try {
    const { data } = await apiClient.get(`${BASE_PATH}/${id}`, {
      params: cleanParams(),
    });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const submitTemplateCandidateApi = async (payload) => {
  try {
    if (import.meta.env?.DEV) {
      console.log('[templateCandidateApi] submit payload', payload);
    }
    const { data } = await apiClient.post(BASE_PATH, payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const updateTemplateCandidateStatusApi = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`${BASE_PATH}/${id}/status`, payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const promoteTemplateCandidateApi = async (id, payload = {}) => {
  try {
    if (import.meta.env?.DEV) {
      console.log('[templateCandidateApi] promote', id, payload);
    }
    const { data } = await apiClient.post(`${BASE_PATH}/${id}/promote`, payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const rejectTemplateCandidateApi = async (id, payload = {}) => {
  try {
    const { data } = await apiClient.post(`${BASE_PATH}/${id}/reject`, payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const requestTemplateCandidateRevisionApi = async (id, payload = {}) => {
  try {
    const { data } = await apiClient.post(`${BASE_PATH}/${id}/request-revision`, payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const mergeTemplateCandidateApi = async (id, payload = {}) => {
  try {
    const { data } = await apiClient.post(`${BASE_PATH}/${id}/merge-existing`, payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};
