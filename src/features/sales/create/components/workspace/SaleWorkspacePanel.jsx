import React from 'react';

const SaleWorkspacePanel = ({ title, description, action, children, locked = false, className = '' }) => (
  <section
    className={`rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-shadow md:p-5 ${locked ? 'pointer-events-none opacity-60' : 'hover:shadow-[0_14px_36px_rgba(15,23,42,0.06)]'} ${className}`}
    aria-disabled={locked}
  >
    {(title || description || action) && (
      <header className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {title && (
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 rounded-full bg-emerald-500" aria-hidden="true" />
              <h2 className="text-base font-bold tracking-tight text-slate-950">{title}</h2>
            </div>
          )}
          {description && <p className="mt-1.5 max-w-3xl pl-3.5 text-sm leading-6 text-slate-500">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
    )}
    {children}
  </section>
);

export default SaleWorkspacePanel;
