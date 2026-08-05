import React, { useMemo } from 'react';

const normalizeStatus = (status) => String(status || '').toUpperCase();

export default function ReceiptSummary({ purchaseOrders }) {
  const summary = useMemo(() => {
    const list = Array.isArray(purchaseOrders) ? purchaseOrders : [];
    return list.reduce(
      (acc, purchaseOrder) => {
        const status = normalizeStatus(purchaseOrder?.status);
        acc.total += 1;
        if (status === 'PENDING') acc.pending += 1;
        if (status === 'PARTIALLY_RECEIVED') acc.partial += 1;
        if (status === 'COMPLETED' || status === 'RECEIVED') acc.completed += 1;
        return acc;
      },
      { total: 0, pending: 0, partial: 0, completed: 0 }
    );
  }, [purchaseOrders]);

  const items = [
    { label: 'ทั้งหมด', value: summary.total },
    { label: 'รอดำเนินการ', value: summary.pending },
    { label: 'รับบางส่วน', value: summary.partial },
    { label: 'เสร็จสมบูรณ์', value: summary.completed },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="สรุปสถานะการตรวจรับ">
      {items.map((item) => (
        <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-950">{item.value}</p>
        </article>
      ))}
    </section>
  );
}
