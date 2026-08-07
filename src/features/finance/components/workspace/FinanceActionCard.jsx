import React from 'react';
import { ArrowRight } from 'lucide-react';

const FinanceActionCard = ({ title, description, icon: Icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex min-h-24 w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
  >
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
        {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-950">{title}</p>
        {description ? <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{description}</p> : null}
      </div>
    </div>
    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-teal-700" aria-hidden="true" />
  </button>
);

export default FinanceActionCard;
