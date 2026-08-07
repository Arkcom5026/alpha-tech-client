import React from 'react';

const FinanceWorkspaceSection = ({ title, description, children }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
    <div>
      <h2 className="text-base font-black text-slate-950 md:text-lg">{title}</h2>
      {description ? <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{description}</p> : null}
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

export default FinanceWorkspaceSection;
