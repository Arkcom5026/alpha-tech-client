import React from 'react';

const SaleWorkspaceHeader = ({ title, description, status, tone = 'neutral', onHelp }) => {
  const tones = {
    neutral: 'border-slate-200 bg-white text-slate-700',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
    critical: 'border-rose-200 bg-rose-50 text-rose-800',
  };

  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-950 md:text-xl">{title}</h1>
          {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
          {status && (
            <div className={`mt-3 inline-flex rounded-lg border px-3 py-1.5 text-xs font-semibold ${tones[tone] || tones.neutral}`}>
              {status}
            </div>
          )}
        </div>
        {onHelp && (
          <button
            type="button"
            onClick={onHelp}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            เปิดคู่มือการขายสินค้า
          </button>
        )}
      </div>
    </header>
  );
};

export default SaleWorkspaceHeader;
