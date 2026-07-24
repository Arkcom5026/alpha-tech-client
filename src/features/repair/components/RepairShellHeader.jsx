import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

const tabs = [
  { key: 'intake', label: 'รับเรื่อง', path: 'repair-intake' },
  { key: 'repairs', label: 'คิวงานซ่อม', path: 'repairs' },
  { key: 'claims', label: 'คิวงานเคลม', path: 'warranty-claims' },
];

const RepairShellHeader = ({ eyebrow, title, description }) => {
  const { shopSlug } = useParams();
  const prefix = `/${shopSlug}/pos/services`;

  return (
    <div className="mb-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={`${prefix}/${tab.path}`}
              className={({ isActive }) =>
                `rounded-xl border px-4 py-2 text-sm font-black transition ${
                  isActive
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default RepairShellHeader;
