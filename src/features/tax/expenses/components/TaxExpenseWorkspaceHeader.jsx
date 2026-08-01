import React from 'react';
import { ReceiptText, RefreshCw } from 'lucide-react';

const TaxExpenseWorkspaceHeader = ({ branchLabel, loading, onRefresh }) => (
  <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
        <ReceiptText size={18} /> Tax Expense Workspace
      </div>
      <h1 className="mt-1 text-2xl font-black text-slate-900">บันทึกค่าใช้จ่ายของร้าน {branchLabel}</h1>
      <p className="mt-1 text-sm text-slate-500">บันทึกหลักฐานค่าใช้จ่ายก่อนเข้าสู่ขั้นประเมินภาษี</p>
    </div>
    <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">
      <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
    </button>
  </header>
);

export default TaxExpenseWorkspaceHeader;
