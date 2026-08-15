import React from 'react';
import { CircleHelp, ShoppingCart } from 'lucide-react';

const SaleWorkspaceHeader = ({ title, description, status, tone = 'neutral', onHelp }) => {
  const tones = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
    critical: 'border-rose-200 bg-rose-50 text-rose-800',
  };

  const dots = {
    neutral: 'bg-slate-400',
    info: 'bg-blue-500',
    good: 'bg-emerald-500',
    warn: 'bg-amber-500',
    critical: 'bg-rose-500',
  };

  return (
    <header className="overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/70 shadow-sm">
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm sm:flex">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Sales workspace</p>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 md:text-2xl">{title}</h1>
            {description && <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
            {status && (
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tones[tone] || tones.neutral}`}>
                <span className={`h-2 w-2 rounded-full ${dots[tone] || dots.neutral}`} aria-hidden="true" />
                {status}
              </div>
            )}
          </div>
        </div>
        {onHelp && (
          <button
            type="button"
            onClick={onHelp}
            aria-label="เปิดคู่มือการขายสินค้า"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <CircleHelp className="h-4 w-4" />
            คู่มือการขาย
          </button>
        )}
      </div>
    </header>
  );
};

export default SaleWorkspaceHeader;
