import React from 'react';

const STATUS_CONFIG = {
  PENDING: {
    label: 'รอดำเนินการ',
    className: 'border-slate-300 bg-slate-100 text-slate-700',
    dotClassName: 'bg-slate-500',
  },
  PARTIALLY_RECEIVED: {
    label: 'รับบางส่วน',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    dotClassName: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'เสร็จสมบูรณ์',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dotClassName: 'bg-emerald-500',
  },
  RECEIVED: {
    label: 'เสร็จสมบูรณ์',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dotClassName: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'ยกเลิก',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    dotClassName: 'bg-rose-500',
  },
};

export default function ReceiptStatusBadge({ status }) {
  const key = String(status || '').toUpperCase();
  const config = STATUS_CONFIG[key] || {
    label: status || '-',
    className: 'border-slate-200 bg-white text-slate-600',
    dotClassName: 'bg-slate-400',
  };

  return (
    <span
      aria-label={`สถานะ ${config.label}`}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`} />
      {config.label}
    </span>
  );
}
