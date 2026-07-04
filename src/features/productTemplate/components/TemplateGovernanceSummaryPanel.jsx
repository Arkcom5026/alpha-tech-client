import React from 'react';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

const SummaryCard = ({ label, value, tone = 'slate' }) => {
  const toneClass = tone === 'green'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
    : tone === 'amber'
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-slate-50 text-slate-800 border-slate-100';

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className="mt-1 break-words text-sm font-black">{value ?? '-'}</p>
    </div>
  );
};

const TemplateGovernanceSummaryPanel = ({ template }) => {
  const active = template?.active !== false;
  const hasPrice = ['costPrice', 'priceRetail', 'priceWholesale', 'priceOnline', 'priceTechnician'].some((key) => template?.[key] != null);
  const imageCount = Array.isArray(template?.images) ? template.images.length : 0;

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Status" value={active ? 'ACTIVE' : 'INACTIVE'} tone={active ? 'green' : 'slate'} />
      <SummaryCard label="Price Snapshot" value={hasPrice ? 'READY' : 'MISSING'} tone={hasPrice ? 'green' : 'amber'} />
      <SummaryCard label="Images" value={`${imageCount} image${imageCount === 1 ? '' : 's'}`} />
      <SummaryCard label="Updated" value={formatDate(template?.updatedAt || template?.createdAt)} />
    </section>
  );
};

export default TemplateGovernanceSummaryPanel;
