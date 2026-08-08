const BUSINESS_TYPE_LABELS = Object.freeze({
  GENERAL: 'ธุรกิจทั่วไป',
  IT: 'ไอที / คอมพิวเตอร์',
  ELECTRONICS: 'อิเล็กทรอนิกส์',
  CONSTRUCTION: 'วัสดุก่อสร้าง',
  GROCERY: 'ร้านขายของชำ',
});

export const BUSINESS_TYPE_OPTIONS = [
  { value: 'IT', label: BUSINESS_TYPE_LABELS.IT },
];

export const getBusinessTypeLabel = (value) =>
  BUSINESS_TYPE_LABELS[String(value || '').trim().toUpperCase()] || value || '-';
