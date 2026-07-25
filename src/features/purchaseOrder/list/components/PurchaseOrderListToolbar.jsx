import React from 'react';
import { Plus, Search } from 'lucide-react';

export default function PurchaseOrderListToolbar({
  searchQuery,
  onSearchQueryChange,
  showAllHistory,
  onShowAllHistoryChange,
  onCreate,
}) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-black tracking-tight text-slate-900">ใบสั่งซื้อ</h1>
        <p className="mt-1 text-xs font-bold text-slate-400">
          ค้นหา ตรวจสอบ แก้ไข และพิมพ์เอกสารจัดซื้อ
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ PO หรือชื่อคู่ค้า..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="w-64 rounded-xl border border-slate-200 bg-slate-100 py-2 pl-10 pr-4 text-sm font-bold outline-none transition focus:border-orange-500 focus:bg-white"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
          <input
            type="checkbox"
            checked={showAllHistory}
            onChange={(event) => onShowAllHistoryChange(event.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          <span>แสดงประวัติทั้งหมด</span>
        </label>

        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          สร้างใบสั่งซื้อ
        </button>
      </div>
    </div>
  );
}
