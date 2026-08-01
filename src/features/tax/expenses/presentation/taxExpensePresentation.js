export const formatTaxExpenseMoney = (value) => new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
}).format(Number(value || 0));

export const formatTaxExpenseDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date);
};

export const getTaxExpenseStatusClass = (status) => ({
  DRAFT: 'bg-slate-100 text-slate-700',
  RECORDED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  FINALIZED: 'bg-emerald-100 text-emerald-700',
  VOIDED: 'bg-rose-100 text-rose-700',
}[status] || 'bg-slate-100 text-slate-700');
