import React from 'react';
import { Search } from 'lucide-react';

export default function PurchaseOrderListToolbar({
  searchQuery,
  onSearchQueryChange,
  showAllHistory,
  onShowAllHistoryChange,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4" aria-label="เครื่องมือค้นหาใบสั่งซื้อ">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <label className="relative block min-w-0">
          <span className="sr-only">ค้นหาใบสั่งซื้อ</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="ค้นหาเลขที่ PO หรือชื่อคู่ค้า"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
          />
        </label>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white">
          <input
            type="checkbox"
            checked={showAllHistory}
            onChange={(event) => onShowAllHistoryChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-teal-700"
          />
          <span>แสดงประวัติทั้งหมด</span>
        </label>
      </div>
    </section>
  );
}
