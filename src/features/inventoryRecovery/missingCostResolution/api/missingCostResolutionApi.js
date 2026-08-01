import apiClient from '@/utils/apiClient';

const ROOT = '/inventory-recovery/missing-cost-resolutions';

const cleanParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

export const listMissingCostResolutions = async (filters = {}) => {
  const response = await apiClient.get(`${ROOT}/queue`, {
    params: cleanParams(filters),
  });
  return response.data;
};

export const getMissingCostResolutionDetail = async (resolutionId) => {
  const response = await apiClient.get(`${ROOT}/${resolutionId}`);
  return response.data;
};

export const getMissingCostResolutionAuditHistory = async (resolutionId) => {
  const response = await apiClient.get(`${ROOT}/${resolutionId}/audit-history`);
  return response.data;
};

export default {
  listMissingCostResolutions,
  getMissingCostResolutionDetail,
  getMissingCostResolutionAuditHistory,
};
