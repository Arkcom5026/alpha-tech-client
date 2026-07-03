// src/features/product/templateCandidate/utils/candidateMapper.js
import { TEMPLATE_CANDIDATE_STATUS, normalizeCandidateStatus } from './candidateStatus';

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const pickObject = (input) => {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] || null;
  if (input.candidate) return input.candidate;
  if (input.templateCandidate) return input.templateCandidate;
  if (input.data?.candidate) return input.data.candidate;
  if (input.data?.templateCandidate) return input.data.templateCandidate;
  if (input.data && typeof input.data === 'object' && !Array.isArray(input.data)) return input.data;
  return input;
};

export const extractCandidateList = (response) => {
  if (Array.isArray(response)) return response;
  const candidates = [
    response?.candidates,
    response?.templateCandidates,
    response?.items,
    response?.data,
    response?.data?.candidates,
    response?.data?.templateCandidates,
    response?.data?.items,
    response?.result,
    response?.result?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

export const mapCandidateResponse = (response) => {
  const candidate = pickObject(response);
  if (!candidate || typeof candidate !== 'object') return null;

  const product = candidate.product || candidate.sourceProduct || candidate.localProduct || {};
  const branch = candidate.branch || product.branch || {};
  const branchPrice = candidate.branchPrice || product.branchPrice?.[0] || product.branchPrice || {};

  return {
    ...candidate,
    id: toNumberOrNull(candidate.id),
    status: normalizeCandidateStatus(candidate.status || candidate.reviewStatus),
    sourceProductId: toNumberOrNull(
      candidate.sourceProductId || candidate.localProductId || candidate.productId || product.id
    ),
    sourceBranchId: toNumberOrNull(candidate.sourceBranchId || candidate.branchId || branch.id),
    sourceBranchName: candidate.sourceBranchName || branch.name || product.branchName || '-',
    proposedName: candidate.proposedName || candidate.name || product.name || '',
    productTypeId: toNumberOrNull(candidate.productTypeId || product.productTypeId),
    productTypeName:
      candidate.productTypeName ||
      candidate.productType?.name ||
      product.productTypeName ||
      product.productType?.name ||
      '-',
    brandId: toNumberOrNull(candidate.brandId || product.brandId),
    brandName: candidate.brandName || candidate.brand?.name || product.brandName || product.brand?.name || '-',
    unitId: toNumberOrNull(candidate.unitId || product.unitId),
    unitName: candidate.unitName || candidate.unit?.name || product.unitName || product.unit?.name || '-',
    trackSerialNumber: Boolean(candidate.trackSerialNumber ?? product.trackSerialNumber),
    noSN: Boolean(candidate.noSN ?? product.noSN),
    mode: candidate.mode || product.mode || 'STRUCTURED',
    costPrice: candidate.costPrice ?? branchPrice.costPrice ?? product.costPrice ?? null,
    priceRetail: candidate.priceRetail ?? branchPrice.priceRetail ?? product.priceRetail ?? null,
    images: candidate.images || candidate.productImages || product.productImages || [],
    adminNote: candidate.adminNote || candidate.reviewNote || '',
    creatorNote: candidate.creatorNote || candidate.note || '',
    createdAt: candidate.createdAt || product.createdAt,
    updatedAt: candidate.updatedAt || product.updatedAt,
  };
};

export const mapCandidateListResponse = (response) => ({
  candidates: extractCandidateList(response).map(mapCandidateResponse).filter(Boolean),
  pagination: response?.pagination || response?.data?.pagination || response?.meta || null,
});

export const buildCandidatePayloadFromLocalProduct = ({
  localProduct,
  branchPrice,
  source = 'LOCAL_PRODUCT',
  note,
  metadata,
} = {}) => {
  if (!localProduct?.id) {
    throw new Error('Local Operational Product is required before submitting Template Candidate');
  }

  return {
    source,
    sourceProductId: toNumberOrNull(localProduct.id),
    sourceBranchId: toNumberOrNull(localProduct.branchId || localProduct.branch?.id),
    proposedName: localProduct.name,
    productTypeId: toNumberOrNull(localProduct.productTypeId || localProduct.productType?.id),
    brandId: toNumberOrNull(localProduct.brandId || localProduct.brand?.id),
    unitId: toNumberOrNull(localProduct.unitId || localProduct.unit?.id),
    mode: localProduct.mode || 'STRUCTURED',
    trackSerialNumber: Boolean(localProduct.trackSerialNumber),
    noSN: Boolean(localProduct.noSN ?? !localProduct.trackSerialNumber),
    productConfig: localProduct.productConfig || null,
    branchPrice: branchPrice || localProduct.branchPrice?.[0] || localProduct.branchPrice || null,
    images: localProduct.productImages || localProduct.images || [],
    creatorNote: note || '',
    metadata: metadata || {},
    status: TEMPLATE_CANDIDATE_STATUS.SUBMITTED,
  };
};
