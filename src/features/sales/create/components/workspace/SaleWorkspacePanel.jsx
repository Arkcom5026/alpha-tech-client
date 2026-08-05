import React from 'react';

const SaleWorkspacePanel = ({ title, description, action, children, locked = false, className = '' }) => (
  <section
    className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 ${locked ? 'pointer-events-none opacity-60' : ''} ${className}`}
    aria-disabled={locked}
  >
    {(title || description || action) && (
      <header className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {title && <h2 className="text-base font-semibold text-slate-950">{title}</h2>}
          {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        {action}
      </header>
    )}
    {children}
  </section>
);

export default SaleWorkspacePanel;
