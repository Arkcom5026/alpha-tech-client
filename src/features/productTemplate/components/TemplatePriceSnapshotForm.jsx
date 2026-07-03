import React from 'react';

const PRICE_FIELDS = [
  { key: 'costPrice', label: 'Cost' },
  { key: 'priceRetail', label: 'Retail' },
  { key: 'priceWholesale', label: 'Wholesale' },
  { key: 'priceOnline', label: 'Online' },
  { key: 'priceTechnician', label: 'Technician' },
];

const TemplatePriceSnapshotForm = ({ form, setField }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900">Template Price Snapshot</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            ราคาใน Template เป็นค่าอ้างอิงสำหรับ clone source เท่านั้น ไม่ใช่ BranchPrice runtime ของสาขา
          </p>
        </div>
        <span className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
          Not BranchPrice
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PRICE_FIELDS.map((field) => (
          <label key={field.key} className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{field.label}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form[field.key] ?? ''}
              onChange={(event) => setField(field.key, event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          </label>
        ))}
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Template Branch</span>
          <input
            value={form.templateBranchCode ?? 'T01'}
            onChange={(event) => setField('templateBranchCode', event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          />
        </label>
      </div>
    </section>
  );
};

export default TemplatePriceSnapshotForm;
