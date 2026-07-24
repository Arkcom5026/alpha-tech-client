export const REPAIR_STATUS_LABELS = {
  RECEIVED: 'รับเครื่องแล้ว',
  IN_PROGRESS: 'กำลังซ่อม',
  WAITING_PARTS: 'รออะไหล่',
  COMPLETED: 'ซ่อมเสร็จ',
  CANCELLED: 'ยกเลิก',
};

export const CLAIM_STATUS_LABELS = {
  DRAFT: 'ร่างรายการ',
  SUBMITTED: 'ส่งเคลมแล้ว',
  IN_TRANSIT: 'อยู่ระหว่างขนส่ง',
  RECEIVED_BY_PROVIDER: 'ศูนย์รับสินค้าแล้ว',
  INSPECTING: 'กำลังตรวจสอบ',
  APPROVED: 'อนุมัติเคลม',
  REJECTED: 'ปฏิเสธเคลม',
  REPAIRING: 'ศูนย์กำลังซ่อม',
  REPLACEMENT_PENDING: 'รอสินค้าทดแทน',
  CREDIT_PENDING: 'รอเครดิต',
  RESOLVED: 'ปิดเคลมแล้ว',
  CANCELLED: 'ยกเลิก',
};

export const CLAIM_RESOLUTION_LABELS = {
  REPAIRED: 'ซ่อมคืน',
  REPLACED: 'เปลี่ยนสินค้าใหม่',
  CREDITED: 'รับเครดิต',
  REFUNDED: 'คืนเงิน',
  RETURNED_UNCHANGED: 'ส่งคืนโดยไม่แก้ไข',
  REJECTED: 'ปฏิเสธ',
  WRITTEN_OFF: 'ตัดจำหน่าย',
};

export const REPAIR_TRANSITIONS = {
  RECEIVED: ['IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_PARTS', 'COMPLETED', 'CANCELLED'],
  WAITING_PARTS: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const CLAIM_TRANSITIONS = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['IN_TRANSIT', 'RECEIVED_BY_PROVIDER', 'CANCELLED'],
  IN_TRANSIT: ['RECEIVED_BY_PROVIDER', 'CANCELLED'],
  RECEIVED_BY_PROVIDER: ['INSPECTING', 'APPROVED', 'REJECTED'],
  INSPECTING: ['APPROVED', 'REJECTED', 'REPAIRING', 'REPLACEMENT_PENDING', 'CREDIT_PENDING'],
  APPROVED: ['REPAIRING', 'REPLACEMENT_PENDING', 'CREDIT_PENDING', 'RESOLVED'],
  REJECTED: ['RESOLVED'],
  REPAIRING: ['RESOLVED'],
  REPLACEMENT_PENDING: ['RESOLVED'],
  CREDIT_PENDING: ['RESOLVED'],
  RESOLVED: [],
  CANCELLED: [],
};

export const statusTone = (status) => {
  if (['COMPLETED', 'RESOLVED', 'APPROVED'].includes(status)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  if (['CANCELLED', 'REJECTED'].includes(status)) {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }
  if (['WAITING_PARTS', 'REPLACEMENT_PENDING', 'CREDIT_PENDING'].includes(status)) {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }
  return 'border-blue-200 bg-blue-50 text-blue-700';
};
