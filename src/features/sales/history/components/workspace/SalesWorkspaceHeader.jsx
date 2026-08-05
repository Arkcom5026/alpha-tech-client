import React from 'react';

const SalesWorkspaceHeader = ({ title, description, meta, actions }) => (
  <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
        {meta && <p className="mt-2 text-xs text-slate-400">{meta}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </header>
);

export default SalesWorkspaceHeader;
