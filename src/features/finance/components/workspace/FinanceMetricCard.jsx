import React from 'react';

const TONES = {
  neutral: 'border-slate-200 bg-white text-slate-950',
  info: 'border-teal-200 bg-teal-50/50 text-teal-900',
  warn: 'border-amber-200 bg-amber-50/60 text-amber-900',
  danger: 'border-rose-200 bg-rose-50/60 text-rose-900',
};

const FinanceMetricCard = ({ label, value, hint, tone = 'neutral' }) => (
  <div className={`rounded-2xl border p-5 shadow-sm ${TONES[tone] || TONES.neutral}`}>
    <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
    {hint ? <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{hint}</p> : null}
  </div>
);

export default FinanceMetricCard;
