import React from 'react';
import { Link } from 'react-router-dom';

const RepairPageHeader = ({ eyebrow, title, description, actions = [] }) => (
  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-black text-slate-950">{title}</h1>
      {description ? <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p> : null}
    </div>
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700"
        >
          {action.label}
        </Link>
      ))}
    </div>
  </div>
);

export default RepairPageHeader;
