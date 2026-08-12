import React from 'react';

export const MobileWorkspace = ({ title, description, eyebrow, actions, children }) => (
  <div className="min-h-screen bg-slate-50 px-3 py-4 text-slate-900 sm:px-4 md:p-6">
    <div className="mx-auto max-w-7xl space-y-4 pb-24 md:space-y-6 md:pb-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">{eyebrow}</p> : null}
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight md:text-2xl">{title}</h1>
            {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      </header>
      {children}
    </div>
  </div>
);

export const MobileWorkspaceSection = ({ title, description, actions, children, className = '' }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 ${className}`}>
    {(title || actions) ? (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h2 className="font-black">{title}</h2>{description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}</div>
        {actions}
      </div>
    ) : null}
    {children}
  </section>
);

export const MobileActionBar = ({ children }) => (
  <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none">
    <div className="mx-auto flex max-w-7xl gap-2 [&>*]:min-h-12 [&>*]:flex-1 md:[&>*]:flex-none">{children}</div>
  </div>
);
