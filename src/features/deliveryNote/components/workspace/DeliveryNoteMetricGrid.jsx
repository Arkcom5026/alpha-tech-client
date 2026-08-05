import React from 'react';

const formatMoney = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

const DeliveryNoteMetricGrid = ({ summary }) => {
  const metrics = [
    { label: 'เอกสารค้างชำระ', value: `${summary.count.toLocaleString('th-TH')} ใบ`, tone: 'text-slate-950' },
    { label: 'มูลค่ารวม', value: `฿${formatMoney(summary.totalSum)}`, tone: 'text-blue-700' },
    { label: 'ยอดค้างชำระ', value: `฿${formatMoney(summary.balanceSum)}`, tone: 'text-rose-700' },
    { label: 'เฉลี่ยต่อใบ', value: `฿${formatMoney(summary.avg)}`, tone: 'text-emerald-700' },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">{metric.label}</p>
          <p className={`mt-2 text-xl font-semibold ${metric.tone}`}>{metric.value}</p>
        </article>
      ))}
    </section>
  );
};

export default DeliveryNoteMetricGrid;
