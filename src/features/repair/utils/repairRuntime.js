export const REPAIR_LANES = [
  { key: 'RECEIVED', label: 'รับเข้าใหม่', description: 'รับเครื่องแล้ว รอเริ่มตรวจ' },
  { key: 'IN_PROGRESS', label: 'กำลังตรวจ/ซ่อม', description: 'ช่างกำลังดำเนินงาน' },
  { key: 'WAITING_PARTS', label: 'รออะไหล่', description: 'งานติดรอชิ้นส่วน' },
  { key: 'COMPLETED', label: 'พร้อมส่งมอบ', description: 'ซ่อมเสร็จแล้ว' },
  { key: 'CANCELLED', label: 'ยกเลิก', description: 'งานที่ยุติแล้ว' },
];

export const CLAIM_LANES = [
  { key: 'DRAFT', label: 'ร่างรายการ', description: 'เตรียมข้อมูลเคลม' },
  { key: 'SUBMITTED', label: 'ส่งเคลมแล้ว', description: 'รอการตอบรับ' },
  { key: 'IN_TRANSIT', label: 'ระหว่างขนส่ง', description: 'กำลังส่งไปศูนย์' },
  { key: 'RECEIVED_BY_PROVIDER', label: 'ศูนย์รับแล้ว', description: 'ศูนย์รับสินค้าแล้ว' },
  { key: 'INSPECTING', label: 'กำลังตรวจสอบ', description: 'ศูนย์กำลังประเมิน' },
  { key: 'REPAIRING', label: 'กำลังซ่อม', description: 'ศูนย์กำลังซ่อมสินค้า' },
  { key: 'REPLACEMENT_PENDING', label: 'รอสินค้าทดแทน', description: 'กำลังรอของเปลี่ยน' },
  { key: 'CREDIT_PENDING', label: 'รอเครดิต', description: 'กำลังรอเอกสารเครดิต' },
  { key: 'RESOLVED', label: 'เสร็จสิ้น', description: 'ปิดรายการแล้ว' },
  { key: 'REJECTED', label: 'ปฏิเสธ', description: 'ศูนย์ไม่อนุมัติ' },
  { key: 'CANCELLED', label: 'ยกเลิก', description: 'รายการที่ยุติแล้ว' },
];

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
  REPAIRING: ['RESOLVED'],
  REPLACEMENT_PENDING: ['RESOLVED'],
  CREDIT_PENDING: ['RESOLVED'],
  REJECTED: ['RESOLVED'],
  RESOLVED: [],
  CANCELLED: [],
};

export const REPAIR_LABELS = Object.fromEntries(REPAIR_LANES.map((item) => [item.key, item.label]));
export const CLAIM_LABELS = Object.fromEntries(CLAIM_LANES.map((item) => [item.key, item.label]));

export const groupByStatus = (items = [], lanes = []) =>
  lanes.map((lane) => ({
    ...lane,
    items: items.filter((item) => item.status === lane.key),
  }));

export const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const formatMoney = (value) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
