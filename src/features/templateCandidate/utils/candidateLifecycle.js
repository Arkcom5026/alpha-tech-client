// src/features/product/templateCandidate/utils/candidateLifecycle.js
import { TEMPLATE_CANDIDATE_STATUS, normalizeCandidateStatus } from './candidateStatus';

export const CANDIDATE_LIFECYCLE_STEPS = [
  TEMPLATE_CANDIDATE_STATUS.DRAFT,
  TEMPLATE_CANDIDATE_STATUS.SUBMITTED,
  TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW,
  TEMPLATE_CANDIDATE_STATUS.REVISION_REQUESTED,
  TEMPLATE_CANDIDATE_STATUS.APPROVED,
  TEMPLATE_CANDIDATE_STATUS.PROMOTED,
];

export const CANDIDATE_REVIEW_ACTIONS = {
  START_REVIEW: 'START_REVIEW',
  REQUEST_REVISION: 'REQUEST_REVISION',
  REJECT: 'REJECT',
  MERGE_EXISTING: 'MERGE_EXISTING',
  APPROVE: 'APPROVE',
  PROMOTE: 'PROMOTE',
};

export const getNextCandidateStatuses = (status) => {
  switch (normalizeCandidateStatus(status)) {
    case TEMPLATE_CANDIDATE_STATUS.DRAFT:
      return [TEMPLATE_CANDIDATE_STATUS.SUBMITTED];
    case TEMPLATE_CANDIDATE_STATUS.SUBMITTED:
      return [
        TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW,
        TEMPLATE_CANDIDATE_STATUS.REJECTED,
        TEMPLATE_CANDIDATE_STATUS.MERGED_EXISTING,
      ];
    case TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW:
      return [
        TEMPLATE_CANDIDATE_STATUS.REVISION_REQUESTED,
        TEMPLATE_CANDIDATE_STATUS.REJECTED,
        TEMPLATE_CANDIDATE_STATUS.MERGED_EXISTING,
        TEMPLATE_CANDIDATE_STATUS.APPROVED,
      ];
    case TEMPLATE_CANDIDATE_STATUS.REVISION_REQUESTED:
      return [TEMPLATE_CANDIDATE_STATUS.SUBMITTED, TEMPLATE_CANDIDATE_STATUS.REJECTED];
    case TEMPLATE_CANDIDATE_STATUS.APPROVED:
      return [TEMPLATE_CANDIDATE_STATUS.PROMOTED];
    default:
      return [];
  }
};

export const canTransitionCandidate = (fromStatus, toStatus) =>
  getNextCandidateStatuses(fromStatus).includes(normalizeCandidateStatus(toStatus));

export const getCandidateLifecycleIndex = (status) => {
  const normalized = normalizeCandidateStatus(status);
  const index = CANDIDATE_LIFECYCLE_STEPS.indexOf(normalized);
  return index >= 0 ? index : 0;
};
