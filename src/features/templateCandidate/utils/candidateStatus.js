export const TEMPLATE_CANDIDATE_STATUS = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  REJECTED: 'REJECTED',
  MERGED: 'MERGED',
  PROMOTED: 'PROMOTED',
  CANCELLED: 'CANCELLED',
};

export const TEMPLATE_CANDIDATE_STATUS_LABEL = {
  [TEMPLATE_CANDIDATE_STATUS.DRAFT]: 'รอเริ่มตรวจ',
  [TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW]: 'กำลังตรวจสอบ',
  [TEMPLATE_CANDIDATE_STATUS.REJECTED]: 'ไม่ผ่านการตรวจ',
  [TEMPLATE_CANDIDATE_STATUS.MERGED]: 'รวมกับ Template เดิม',
  [TEMPLATE_CANDIDATE_STATUS.PROMOTED]: 'สร้าง Template ใหม่แล้ว',
  [TEMPLATE_CANDIDATE_STATUS.CANCELLED]: 'ยกเลิกแล้ว',
};

export const TEMPLATE_CANDIDATE_STATUS_TONE = {
  [TEMPLATE_CANDIDATE_STATUS.DRAFT]: 'slate',
  [TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW]: 'blue',
  [TEMPLATE_CANDIDATE_STATUS.REJECTED]: 'red',
  [TEMPLATE_CANDIDATE_STATUS.MERGED]: 'purple',
  [TEMPLATE_CANDIDATE_STATUS.PROMOTED]: 'green',
  [TEMPLATE_CANDIDATE_STATUS.CANCELLED]: 'slate',
};

export const normalizeCandidateStatus = (status) => {
  const normalized = String(status || TEMPLATE_CANDIDATE_STATUS.DRAFT).trim().toUpperCase();
  return TEMPLATE_CANDIDATE_STATUS[normalized] || normalized;
};

export const getCandidateStatusLabel = (status) =>
  TEMPLATE_CANDIDATE_STATUS_LABEL[normalizeCandidateStatus(status)] || status || '-';

export const getCandidateStatusTone = (status) =>
  TEMPLATE_CANDIDATE_STATUS_TONE[normalizeCandidateStatus(status)] || 'slate';

export const canStartCandidateReview = (status) =>
  normalizeCandidateStatus(status) === TEMPLATE_CANDIDATE_STATUS.DRAFT;

export const isCandidateReviewOpen = (status) =>
  normalizeCandidateStatus(status) === TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW;

export const isCandidateFinal = (status) =>
  [
    TEMPLATE_CANDIDATE_STATUS.REJECTED,
    TEMPLATE_CANDIDATE_STATUS.MERGED,
    TEMPLATE_CANDIDATE_STATUS.PROMOTED,
    TEMPLATE_CANDIDATE_STATUS.CANCELLED,
  ].includes(normalizeCandidateStatus(status));
