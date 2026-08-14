export const TEMPLATE_CANDIDATE_TYPE = {
  POSSIBLE_DUPLICATE: 'POSSIBLE_DUPLICATE',
  QUALITY_REVIEW: 'QUALITY_REVIEW',
  ORPHAN_UNUSED: 'ORPHAN_UNUSED',
};

export const TEMPLATE_CANDIDATE_TYPE_LABEL = {
  [TEMPLATE_CANDIDATE_TYPE.POSSIBLE_DUPLICATE]: 'อาจเป็นสินค้าต้นแบบซ้ำ',
  [TEMPLATE_CANDIDATE_TYPE.QUALITY_REVIEW]: 'ตรวจคุณภาพข้อมูล',
  [TEMPLATE_CANDIDATE_TYPE.ORPHAN_UNUSED]: 'ไม่มีร้านอ้างอิง',
};

export const TEMPLATE_CANDIDATE_STATUS = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  REJECTED: 'REJECTED',
  MERGED: 'MERGED',
  PROMOTED: 'PROMOTED',
  CANCELLED: 'CANCELLED',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
  ARCHIVED: 'ARCHIVED',
};

export const TEMPLATE_CANDIDATE_STATUS_LABEL = {
  [TEMPLATE_CANDIDATE_STATUS.DRAFT]: 'รอเริ่มตรวจ',
  [TEMPLATE_CANDIDATE_STATUS.OPEN]: 'รอตรวจสอบ',
  [TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW]: 'กำลังตรวจสอบ',
  [TEMPLATE_CANDIDATE_STATUS.REJECTED]: 'ไม่ผ่านการตรวจ',
  [TEMPLATE_CANDIDATE_STATUS.MERGED]: 'รวมกับ Template เดิม',
  [TEMPLATE_CANDIDATE_STATUS.PROMOTED]: 'สร้าง Template ใหม่แล้ว',
  [TEMPLATE_CANDIDATE_STATUS.CANCELLED]: 'ยกเลิกแล้ว',
  [TEMPLATE_CANDIDATE_STATUS.RESOLVED]: 'จัดการแล้ว',
  [TEMPLATE_CANDIDATE_STATUS.DISMISSED]: 'ยกเลิก Candidate',
  [TEMPLATE_CANDIDATE_STATUS.ARCHIVED]: 'นำออกจาก Catalog แล้ว',
};

export const TEMPLATE_CANDIDATE_STATUS_TONE = {
  [TEMPLATE_CANDIDATE_STATUS.DRAFT]: 'slate',
  [TEMPLATE_CANDIDATE_STATUS.OPEN]: 'amber',
  [TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW]: 'blue',
  [TEMPLATE_CANDIDATE_STATUS.REJECTED]: 'red',
  [TEMPLATE_CANDIDATE_STATUS.MERGED]: 'purple',
  [TEMPLATE_CANDIDATE_STATUS.PROMOTED]: 'green',
  [TEMPLATE_CANDIDATE_STATUS.CANCELLED]: 'slate',
  [TEMPLATE_CANDIDATE_STATUS.RESOLVED]: 'green',
  [TEMPLATE_CANDIDATE_STATUS.DISMISSED]: 'slate',
  [TEMPLATE_CANDIDATE_STATUS.ARCHIVED]: 'slate',
};

export const normalizeCandidateType = (type) => {
  const normalized = String(type || '').trim().toUpperCase();
  return TEMPLATE_CANDIDATE_TYPE[normalized] || normalized || null;
};

export const getCandidateTypeLabel = (type) =>
  TEMPLATE_CANDIDATE_TYPE_LABEL[normalizeCandidateType(type)] || type || '-';

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
  [TEMPLATE_CANDIDATE_STATUS.OPEN, TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW].includes(
    normalizeCandidateStatus(status)
  );

export const isCandidateFinal = (status) =>
  [
    TEMPLATE_CANDIDATE_STATUS.REJECTED,
    TEMPLATE_CANDIDATE_STATUS.MERGED,
    TEMPLATE_CANDIDATE_STATUS.PROMOTED,
    TEMPLATE_CANDIDATE_STATUS.CANCELLED,
    TEMPLATE_CANDIDATE_STATUS.RESOLVED,
    TEMPLATE_CANDIDATE_STATUS.DISMISSED,
    TEMPLATE_CANDIDATE_STATUS.ARCHIVED,
  ].includes(normalizeCandidateStatus(status));
