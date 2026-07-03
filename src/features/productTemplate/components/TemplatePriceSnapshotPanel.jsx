import React from 'react';

const money = (value) => {
  if (value === undefined || value === null || value === '') return '-';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const PriceField = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-black text-slate-900">{money(value)}</p>
  </div>
);

const TemplatePriceSnapshotPanel = ({ template }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900">Template Price Snapshot</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            ราคาใน Template เป็นข้อมูลอ้างอิงสำหรับ clone source ไม่ใช่ BranchPrice runtime ของร้าน
          </p>
        </div>
        <span className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
          Runtime price is not edited here
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <PriceField label="Cost" value={template?.costPrice} />
        <PriceField label="Retail" value={template?.priceRetail} />
        <PriceField label="Wholesale" value={template?.priceWholesale} />
        <PriceField label="Online" value={template?.priceOnline} />
        <PriceField label="Technician" value={template?.priceTechnician} />
        <PriceField label="Template Branch" value={template?.templateBranchCode || 'T01'} />
      </div>
    </section>
  );
};

export default TemplatePriceSnapshotPanel;
