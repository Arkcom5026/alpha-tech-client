import React from 'react';

const FinanceWorkspaceHeader = ({ title, description, badge = 'บัญชีและการเงิน', actions = null }) => (
  <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-teal-700">Finance Workspace</p>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 md:text-2xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">{description}</p> : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="inline-flex min-h-11 items-center rounded-2xl border border-teal-200 bg-teal-50 px-4 text-xs font-black text-teal-800">
          {badge}
        </span>
        {actions}
      </div>
    </div>
  </header>
);

export default FinanceWorkspaceHeader;
