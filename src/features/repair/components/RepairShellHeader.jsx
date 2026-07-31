import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import RepairHelpCenter from '../help/RepairHelpCenter';

const tabs = [
  { key: 'intake', label: 'รับเรื่อง', path: 'repair-intake' },
  { key: 'repairs', label: 'คิวงานซ่อม', path: 'repairs' },
  { key: 'claims', label: 'คิวงานเคลม', path: 'warranty-claims' },
];

const RepairShellHeader = ({ eyebrow, title, description }) => {
  const { shopSlug } = useParams();
  const prefix = `/${shopSlug}/pos/services`;
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <div className="mb-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">{title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2" aria-label="เมนูงานรับซ่อม">
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

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-black text-amber-900 transition hover:border-amber-500 hover:bg-amber-100"
              aria-haspopup="dialog"
            >
              <span aria-hidden="true">?</span>
              คู่มือ
            </button>
          </div>
        </div>
      </div>

      <RepairHelpCenter open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default RepairShellHeader;
