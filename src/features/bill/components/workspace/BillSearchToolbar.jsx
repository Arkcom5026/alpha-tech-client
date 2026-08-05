import React from 'react';
import { RefreshCw, Search } from 'lucide-react';

const formatOptions = [
  { value: 'short', label: 'ใบเสร็จแบบย่อ' },
  { value: 'full', label: 'ใบเสร็จแบบเต็ม' },
];

const BillSearchToolbar = ({
  keyword,
  onKeywordChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  limit,
  onLimitChange,
  onLimitBlur,
  printFormat,
  onPrintFormatChange,
  onSearch,
  loading = false,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
    <div className="grid gap-3 lg:grid-cols-[minmax(240px,1.4fr)_minmax(150px,0.75fr)_minmax(150px,0.75fr)_100px]">
      <label className="space-y-1.5">
        <span className="text-xs font-medium text-slate-600">ค้นหา</span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && onSearch()}
            placeholder="ชื่อลูกค้า เบอร์โทร หรือเลขที่บิล"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
      </label>

      <label className="space-y-1.5">
        <span className="text-xs font-medium text-slate-600">ตั้งแต่วันที่</span>
        <input type="date" value={fromDate} onChange={(event) => onFromDateChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
      </label>

      <label className="space-y-1.5">
        <span className="text-xs font-medium text-slate-600">ถึงวันที่</span>
        <input type="date" value={toDate} onChange={(event) => onToDateChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
      </label>

      <label className="space-y-1.5">
        <span className="text-xs font-medium text-slate-600">จำนวนสูงสุด</span>
        <input type="number" min="1" max="500" value={limit} onChange={(event) => onLimitChange(event.target.value)} onBlur={onLimitBlur} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-center text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
      </label>
    </div>

    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex w-full rounded-xl border border-teal-100 bg-teal-50 p-1 sm:w-auto">
        {formatOptions.map((option) => {
          const active = printFormat === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onPrintFormatChange(option.value)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition sm:flex-none ${active ? 'bg-emerald-100 text-emerald-900 shadow-sm' : 'text-teal-800 hover:bg-white/70'}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onSearch} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'กำลังค้นหา' : 'ค้นหารายการ'}
      </button>
    </div>
  </section>
);

export default BillSearchToolbar;
