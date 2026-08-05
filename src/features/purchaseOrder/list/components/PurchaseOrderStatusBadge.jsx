import React from 'react';

const TONE_STYLES = {
  pending: {
    badge: 'border-slate-300 bg-slate-100 text-slate-700',
    dot: 'bg-slate-500',
  },
  partial: {
    badge: 'border-amber-200 bg-amber-50 text-amber-900',
    dot: 'bg-amber-500',
  },
  completed: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    dot: 'bg-emerald-500',
  },
  neutral: {
    badge: 'border-slate-200 bg-white text-slate-600',
    dot: 'bg-slate-400',
  },
};

export default function PurchaseOrderStatusBadge({ status }) {
  const tone = TONE_STYLES[status?.tone] || TONE_STYLES.neutral;
  const label = status?.label || '-';

  return (
    <span
      className={`inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
      aria-label={`สถานะ ${label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}
