import React from 'react';
import { CalendarRange, RefreshCw, ShieldCheck } from 'lucide-react';

const TaxPeriodWorkspaceHeader = ({
  branchName,
  branchId,
  loading = false,
  busyKey = '',
  onRefresh,
  onEnsureCurrentPeriod,
}) => (
  <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-blue-700"><ShieldCheck size={18} /> ระบบจัดการรอบภาษี</div>
      <h1 className="mt-1 text-2xl font-black text-slate-900">รอบภาษีของสาขา {branchName || branchId}</h1>
      <p className="mt-1 text-sm text-slate-500">จัดการสถานะรอบภาษีจากกฎของระบบโดยตรง</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading || !!busyKey}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
      </button>
      <button
        type="button"
        onClick={onEnsureCurrentPeriod}
        disabled={loading || !!busyKey}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <CalendarRange size={17} /> {busyKey === 'ensure' ? 'กำลังตรวจสอบ...' : 'เตรียมรอบเดือนปัจจุบัน'}
      </button>
    </div>
  </header>
);

export default TaxPeriodWorkspaceHeader;
