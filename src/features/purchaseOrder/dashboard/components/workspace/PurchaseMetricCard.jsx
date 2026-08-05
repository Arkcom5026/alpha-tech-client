import React from 'react';

const PurchaseMetricCard = ({ label, value, hint, tone = 'neutral', onClick }) => {
  const tones = {
    neutral: 'border-slate-200 bg-slate-50',
    good: 'border-emerald-200 bg-emerald-50',
    warn: 'border-amber-200 bg-amber-50',
    critical: 'border-rose-200 bg-rose-50',
    info: 'border-blue-200 bg-blue-50',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${onClick ? 'hover:-translate-y-0.5 hover:shadow-sm' : ''} ${tones[tone] || tones.neutral}`}
    >
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      {hint && <p className="mt-2 text-xs leading-5 text-slate-600">{hint}</p>}
    </Component>
  );
};

export default PurchaseMetricCard;
