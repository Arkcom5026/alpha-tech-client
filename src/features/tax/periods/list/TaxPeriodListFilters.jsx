import React from 'react';
import { RotateCcw, Search } from 'lucide-react';

const TaxPeriodListFilters = ({
  searchText,
  status,
  fromDate,
  toDate,
  statusOptions,
  onSearchTextChange,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
  onReset,
}) => {
  const hasFilters = Boolean(searchText || status || fromDate || toDate);

  return (
    <div className="grid gap-3 border-b border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_180px_180px_auto]">
      <label className="relative block">
        <span className="sr-only">ค้นหารหัสรอบภาษี</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          type="search"
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          placeholder="ค้นหารหัสรอบภาษี"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="sr-only">สถานะ</span>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">ทุกสถานะ</option>
          {statusOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold text-slate-500">ตั้งแต่วันที่</span>
        <input
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(event) => onFromDateChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold text-slate-500">ถึงวันที่</span>
        <input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(event) => onToDateChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <button
        type="button"
        onClick={onReset}
        disabled={!hasFilters}
        className="inline-flex items-center justify-center gap-2 self-end rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RotateCcw size={16} /> ล้างตัวกรอง
      </button>
    </div>
  );
};

export default TaxPeriodListFilters;
