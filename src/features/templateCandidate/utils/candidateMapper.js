import { normalizeCandidateStatus, normalizeCandidateType } from './candidateStatus';

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

const normalizeObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const employeeName = (employee) => {
  if (!employee) return '-';
  if (employee.name) return employee.name;
  return [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim() || '-';
};

export const extractCandidateList = (response) => {
  if (Array.isArray(response)) return response;
  const sources = [response?.items, response?.data?.items, response?.candidates, response?.data?.candidates];
  return sources.find(Array.isArray) || [];
};

export const mapCandidateResponse = (response) => {
  const candidate = unwrapCandidate(response);
  if (!candidate || typeof candidate !== 'object') return null;

  const sourceSnapshot = normalizeObject(candidate.sourceSnapshot);
  const proposedTemplateData = normalizeObject(candidate.proposedTemplateData);
  const assessment = normalizeObject(candidate.assessment);
  const resolution = normalizeObject(candidate.resolution);
  const primarySnapshot = normalizeObject(assessment.primary);
  const comparisonSnapshot = normalizeObject(assessment.comparison);

  return {
    ...candidate,
    id: toNumberOrNull(candidate.id),
    type: normalizeCandidateType(candidate.type),
    status: normalizeCandidateStatus(candidate.status),
    templateBranchId: toNumberOrNull(candidate.templateBranchId),
    primaryTemplateProductId: toNumberOrNull(candidate.primaryTemplateProductId),
    comparisonTemplateProductId: toNumberOrNull(candidate.comparisonTemplateProductId),
    sourceProductId: toNumberOrNull(candidate.sourceProductId),
    sourceBranchId: toNumberOrNull(candidate.sourceBranchId),
    targetTemplateBranchId: toNumberOrNull(candidate.targetTemplateBranchId),
    targetTemplateProductId: toNumberOrNull(candidate.targetTemplateProductId),
    createdByEmployeeId: toNumberOrNull(candidate.createdByEmployeeId),
    reviewedByEmployeeId: toNumberOrNull(candidate.reviewedByEmployeeId),
    businessType: assessment.businessType || candidate.sourceBranch?.businessType || sourceSnapshot.businessType || null,
    sourceProductName:
      primarySnapshot.name || candidate.sourceProduct?.name || sourceSnapshot.name || '-',
    comparisonProductName:
      comparisonSnapshot.name || candidate.comparisonTemplateProduct?.name || '-',
    sourceBranchName: candidate.sourceBranch?.name || sourceSnapshot.branchName || '-',
    targetTemplateBranchName: candidate.targetTemplateBranch?.name || '-',
    targetTemplateProductName: candidate.targetTemplateProduct?.name || '-',
    creatorName: employeeName(candidate.createdByEmployee),
    reviewerName: employeeName(candidate.reviewedByEmployee),
    sourceSnapshot,
    proposedTemplateData,
    assessment,
    resolution,
    primarySnapshot,
    comparisonSnapshot,
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
