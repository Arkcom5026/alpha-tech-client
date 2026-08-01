import apiClient from '@/utils/apiClient';

const ROOT = '/inventory-recovery/missing-cost-resolutions';

const cleanParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

export const listMissingCostResolutions = async (filters = {}) => {
  const response = await apiClient.get(`${ROOT}/queue`, { params: cleanParams(filters) });
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

export const appendMissingCostEvidence = async ({ resolutionId, payload }) => {
  const response = await apiClient.post(`${ROOT}/${resolutionId}/evidence-versions`, payload);
  return response.data;
};

export const transitionMissingCostResolution = async ({ resolutionId, payload }) => {
  const response = await apiClient.post(`${ROOT}/${resolutionId}/transitions`, payload);
  return response.data;
};

export const getMissingCostRecoveryPreview = async (resolutionId) => {
  const response = await apiClient.get(`${ROOT}/${resolutionId}/recovery-preview`);
  return response.data;
};

export const getMissingCostRecoveryApprovalPlan = async (resolutionId) => {
  const response = await apiClient.get(`${ROOT}/${resolutionId}/recovery-approval-plan`);
  return response.data;
};

export const executeMissingCostRecovery = async ({ resolutionId, payload, idempotencyKey }) => {
  const response = await apiClient.post(`${ROOT}/${resolutionId}/recovery-execution`, payload, {
    headers: { 'X-Idempotency-Key': idempotencyKey },
  });
  return response.data;
};

export const getMissingCostRecoveryAudit = async (resolutionId) => {
  const response = await apiClient.get(`${ROOT}/${resolutionId}/recovery-audit`);
  return response.data;
};

export default {
  listMissingCostResolutions,
  getMissingCostResolutionDetail,
  getMissingCostResolutionAuditHistory,
  appendMissingCostEvidence,
  transitionMissingCostResolution,
  getMissingCostRecoveryPreview,
  getMissingCostRecoveryApprovalPlan,
  executeMissingCostRecovery,
  getMissingCostRecoveryAudit,
};
