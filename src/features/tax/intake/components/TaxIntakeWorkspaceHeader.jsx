import React from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const TaxIntakeWorkspaceHeader = ({ branchLabel, loading, onRefresh }) => (
  <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
        <ShieldCheck size={18} /> Tax Intake Workspace
      </div>
      <h1 className="mt-1 text-2xl font-black text-slate-900">
        เอกสารภาษีของสาขา {branchLabel}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        ติดตาม Candidate → Tax Document → Lifecycle จากข้อมูลต้นทาง
      </p>
    </div>

    <button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
    </button>
  </header>
);

export default TaxIntakeWorkspaceHeader;
