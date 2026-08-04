export const BUSINESS_TYPE_OPTIONS = [
  { value: 'GENERAL', label: 'ธุรกิจทั่วไป' },
  { value: 'IT', label: 'ไอที / คอมพิวเตอร์' },
  { value: 'ELECTRONICS', label: 'อิเล็กทรอนิกส์' },
  { value: 'CONSTRUCTION', label: 'วัสดุก่อสร้าง' },
  { value: 'GROCERY', label: 'ร้านขายของชำ' },
];

const BUSINESS_TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPE_OPTIONS.map((item) => [item.value, item.label])
);

export const getBusinessTypeLabel = (value) =>
  BUSINESS_TYPE_LABELS[String(value || '').trim().toUpperCase()] || value || '-';
