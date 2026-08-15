import React from 'react';

const SaleWorkspacePanel = ({ title, description, action, children, locked = false, className = '' }) => (
  <section
    className={`rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow md:p-4 ${locked ? 'pointer-events-none opacity-60' : ''} ${locked ? '' : 'hover:shadow-[0_10px_28px_rgba(15,23,42,0.05)]'} ${className}`}
    aria-disabled={locked}
  >
    {(title || description || action) && (
      <header className="mb-3 flex flex-col gap-2.5 border-b border-slate-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {title && (
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" aria-hidden="true" />
              <h2 className="text-sm font-bold tracking-tight text-slate-950">{title}</h2>
            </div>
          )}
          {description && <p className="mt-1 max-w-3xl pl-3 text-xs leading-5 text-slate-500">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
    )}
    {children}
  </section>
);

export default SaleWorkspacePanel;
