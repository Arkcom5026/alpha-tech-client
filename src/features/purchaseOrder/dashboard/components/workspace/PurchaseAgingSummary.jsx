import React from 'react';

const toneClasses = {
  neutral: 'border-slate-200 bg-slate-50',
  warning: 'border-amber-200 bg-amber-50',
  critical: 'border-rose-200 bg-rose-50',
};

const PurchaseAgingSummary = ({ buckets, onClick }) => {
  const values = buckets || { d0_7: 0, d8_14: 0, d15p: 0 };
  const total = Number(values.d0_7 || 0) + Number(values.d8_14 || 0) + Number(values.d15p || 0);
  const items = [
    { label: '0–7 วัน', value: values.d0_7, tone: 'neutral' },
    { label: '8–14 วัน', value: values.d8_14, tone: 'warning' },
    { label: '15 วันขึ้นไป', value: values.d15p, tone: 'critical' },
  ];

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">อายุงานค้าง</h2>
          <p className="mt-1 text-sm text-slate-500">ติดตามใบสั่งซื้อที่ยังอยู่ระหว่างดำเนินการ</p>
        </div>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">รวม {total} ใบ</span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={onClick}
            className={`rounded-xl border p-4 text-left transition-colors hover:border-teal-300 ${toneClasses[item.tone]}`}
          >
            <p className="text-xs font-semibold text-slate-600">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{Number(item.value || 0)} ใบ</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default PurchaseAgingSummary;
