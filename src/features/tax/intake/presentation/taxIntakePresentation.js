export const formatTaxIntakeDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatTaxIntakeMoney = (value) => new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
}).format(Number(value || 0));

export const getTaxIntakeBadgeClass = (status) => ({
  DRAFT: 'bg-slate-100 text-slate-700',
  REGISTERED: 'bg-blue-50 text-blue-700',
  MAPPED: 'bg-amber-50 text-amber-700',
  CONVERTED: 'bg-emerald-50 text-emerald-700',
  UNDER_REVIEW: 'bg-violet-50 text-violet-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-rose-50 text-rose-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}[status] || 'bg-slate-100 text-slate-600');

export const taxDocumentLifecycleActions = Object.freeze({
  DRAFT: [{ status: 'REGISTERED', label: 'ลงทะเบียนเอกสาร' }],
  REGISTERED: [{ status: 'UNDER_REVIEW', label: 'ส่งตรวจสอบ' }],
  UNDER_REVIEW: [
    { status: 'APPROVED', label: 'อนุมัติ', primary: true },
    { status: 'REJECTED', label: 'ส่งกลับแก้ไข' },
  ],
  REJECTED: [{ status: 'UNDER_REVIEW', label: 'ส่งตรวจสอบอีกครั้ง' }],
});
