import React from 'react';

const StockAuditListPanel = ({
  title,
  description,
  count,
  accent = 'teal',
  scanner,
  children,
}) => {
  const accentClass = accent === 'emerald'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : 'border-teal-200 bg-teal-50 text-teal-900';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-950">{title}</h2>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums ${accentClass}`}>
                {count}
              </span>
            </div>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
        </div>
        {scanner ? <div className="mt-4">{scanner}</div> : null}
      </header>

      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
};

export default StockAuditListPanel;
