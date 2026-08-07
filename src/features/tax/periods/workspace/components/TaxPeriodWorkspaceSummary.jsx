import React from 'react';
import { CalendarRange, CheckCircle2, FileCheck2, LockKeyhole, RotateCcw } from 'lucide-react';

const SummaryCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-900">{value ?? 0}</p>
      </div>
      <div className="rounded-xl bg-slate-100 p-3 text-slate-600"><Icon size={20} /></div>
    </div>
  </div>
);

const TaxPeriodWorkspaceSummary = ({ summary = null, totals = {} }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
    <SummaryCard label="ทั้งหมด" value={summary?.total} icon={CalendarRange} />
    <SummaryCard label="เปิดใช้งาน" value={totals.OPEN} icon={CheckCircle2} />
    <SummaryCard label="ปิดรอบแล้ว" value={totals.CLOSED} icon={CheckCircle2} />
    <SummaryCard label="ล็อกแล้ว" value={totals.LOCKED} icon={LockKeyhole} />
    <SummaryCard label="ยื่นแล้ว" value={totals.SUBMITTED} icon={FileCheck2} />
    <SummaryCard label="เปิดใหม่" value={totals.REOPENED} icon={RotateCcw} />
  </div>
);

export default TaxPeriodWorkspaceSummary;
