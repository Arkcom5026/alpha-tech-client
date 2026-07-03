// src/features/product/templateCandidate/utils/candidateStatus.js
export const TEMPLATE_CANDIDATE_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  REJECTED: 'REJECTED',
  MERGED_EXISTING: 'MERGED_EXISTING',
  APPROVED: 'APPROVED',
  PROMOTED: 'PROMOTED',
};

export const TEMPLATE_CANDIDATE_STATUS_LABEL = {
  [TEMPLATE_CANDIDATE_STATUS.DRAFT]: 'Draft',
  [TEMPLATE_CANDIDATE_STATUS.SUBMITTED]: 'รอตรวจ Catalog',
  [TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW]: 'กำลังตรวจสอบ',
  [TEMPLATE_CANDIDATE_STATUS.REVISION_REQUESTED]: 'ขอแก้ไขข้อมูล',
  [TEMPLATE_CANDIDATE_STATUS.REJECTED]: 'ไม่ผ่านการตรวจ',
  [TEMPLATE_CANDIDATE_STATUS.MERGED_EXISTING]: 'รวมกับ Template เดิม',
  [TEMPLATE_CANDIDATE_STATUS.APPROVED]: 'อนุมัติแล้ว',
  [TEMPLATE_CANDIDATE_STATUS.PROMOTED]: 'สร้าง Template แล้ว',
};

export const TEMPLATE_CANDIDATE_STATUS_TONE = {
  [TEMPLATE_CANDIDATE_STATUS.DRAFT]: 'slate',
  [TEMPLATE_CANDIDATE_STATUS.SUBMITTED]: 'amber',
  [TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW]: 'blue',
  [TEMPLATE_CANDIDATE_STATUS.REVISION_REQUESTED]: 'orange',
  [TEMPLATE_CANDIDATE_STATUS.REJECTED]: 'red',
  [TEMPLATE_CANDIDATE_STATUS.MERGED_EXISTING]: 'purple',
  [TEMPLATE_CANDIDATE_STATUS.APPROVED]: 'green',
  [TEMPLATE_CANDIDATE_STATUS.PROMOTED]: 'green',
};

export const normalizeCandidateStatus = (status) => {
  const nextStatus = String(status || TEMPLATE_CANDIDATE_STATUS.SUBMITTED).trim().toUpperCase();
  return TEMPLATE_CANDIDATE_STATUS[nextStatus] || nextStatus;
};

export const getCandidateStatusLabel = (status) =>
  TEMPLATE_CANDIDATE_STATUS_LABEL[normalizeCandidateStatus(status)] || status || '-';

export const getCandidateStatusTone = (status) =>
  TEMPLATE_CANDIDATE_STATUS_TONE[normalizeCandidateStatus(status)] || 'slate';

export const isCandidateReviewOpen = (status) =>
  [
    TEMPLATE_CANDIDATE_STATUS.SUBMITTED,
    TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW,
    TEMPLATE_CANDIDATE_STATUS.REVISION_REQUESTED,
  ].includes(normalizeCandidateStatus(status));

export const isCandidateFinal = (status) =>
  [
    TEMPLATE_CANDIDATE_STATUS.REJECTED,
    TEMPLATE_CANDIDATE_STATUS.MERGED_EXISTING,
    TEMPLATE_CANDIDATE_STATUS.PROMOTED,
  ].includes(normalizeCandidateStatus(status));
