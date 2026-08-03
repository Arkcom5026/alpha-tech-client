import { normalizeCandidateStatus } from './candidateStatus';

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const unwrapCandidate = (response) => {
  if (!response) return null;
  if (response.candidate) return response.candidate;
  if (response.data?.candidate) return response.data.candidate;
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) return response.data;
  return response;
};

export const extractCandidateList = (response) => {
  if (Array.isArray(response)) return response;
  const sources = [response?.items, response?.data?.items, response?.candidates, response?.data?.candidates];
  return sources.find(Array.isArray) || [];
};

export const mapCandidateResponse = (response) => {
  const candidate = unwrapCandidate(response);
  if (!candidate || typeof candidate !== 'object') return null;

  const sourceSnapshot = candidate.sourceSnapshot && typeof candidate.sourceSnapshot === 'object'
    ? candidate.sourceSnapshot
    : {};
  const proposedTemplateData = candidate.proposedTemplateData && typeof candidate.proposedTemplateData === 'object'
    ? candidate.proposedTemplateData
    : {};

  return {
    ...candidate,
    id: toNumberOrNull(candidate.id),
    status: normalizeCandidateStatus(candidate.status),
    sourceProductId: toNumberOrNull(candidate.sourceProductId),
    sourceBranchId: toNumberOrNull(candidate.sourceBranchId),
    targetTemplateBranchId: toNumberOrNull(candidate.targetTemplateBranchId),
    targetTemplateProductId: toNumberOrNull(candidate.targetTemplateProductId),
    createdByEmployeeId: toNumberOrNull(candidate.createdByEmployeeId),
    reviewedByEmployeeId: toNumberOrNull(candidate.reviewedByEmployeeId),
    sourceProductName: candidate.sourceProduct?.name || sourceSnapshot.name || '-',
    sourceBranchName: candidate.sourceBranch?.name || sourceSnapshot.branchName || '-',
    targetTemplateBranchName: candidate.targetTemplateBranch?.name || '-',
    targetTemplateProductName: candidate.targetTemplateProduct?.name || '-',
    creatorName: candidate.createdByEmployee?.name || '-',
    reviewerName: candidate.reviewedByEmployee?.name || '-',
    sourceSnapshot,
    proposedTemplateData,
    events: Array.isArray(candidate.events) ? candidate.events : [],
    decisionNote: candidate.decisionNote || '',
  };
};

export const mapCandidateListResponse = (response) => ({
  candidates: extractCandidateList(response).map(mapCandidateResponse).filter(Boolean),
  pagination: response?.pagination || response?.data?.pagination || null,
  summary: response?.summary || response?.data?.summary || { total: 0, byStatus: {} },
  reviewerWorkload: response?.reviewerWorkload || response?.data?.reviewerWorkload || [],
});
