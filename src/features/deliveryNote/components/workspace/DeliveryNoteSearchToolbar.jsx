import React from 'react';
import { RefreshCw, Search } from 'lucide-react';

const inputClass = 'h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100';

const DeliveryNoteSearchToolbar = ({
  search,
  onSearchChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  limit,
  onLimitChange,
  onLimitBlur,
  onSearch,
  loading,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto_auto_100px_auto] lg:items-end">
      <label className="space-y-1.5">
        <span className="text-xs font-medium text-slate-600">ค้นหาเอกสาร</span>
        <span className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={onSearchChange}
            onKeyDown={(event) => event.key === 'Enter' && onSearch()}
            placeholder="ชื่อลูกค้า เบอร์โทร หรือเลขที่ใบขาย"
            className={`${inputClass} w-full pl-10`}
          />
        </span>
      </label>
      <label className="space-y-1.5">
        <span className="text-xs font-medium text-slate-600">ตั้งแต่วันที่</span>
        <input type="date" value={fromDate} onChange={onFromDateChange} className={inputClass} />
      </label>
      <label className="space-y-1.5">
        <span className="text-xs font-medium text-slate-600">ถึงวันที่</span>
        <input type="date" value={toDate} onChange={onToDateChange} className={inputClass} />
      </label>
      <label className="space-y-1.5">
        <span className="text-xs font-medium text-slate-600">จำนวน</span>
        <input type="number" min="1" value={limit} onChange={onLimitChange} onBlur={onLimitBlur} className={`${inputClass} w-full text-center`} />
      </label>
      <button
        type="button"
        onClick={onSearch}
        disabled={loading}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        ค้นหา
      </button>
    </div>
  </section>
);

export default DeliveryNoteSearchToolbar;
