import React from 'react';
import { Search, SlidersHorizontal, Tag, User, X } from 'lucide-react';

export default function BarcodeListToolbar({
  mode,
  onModeChange,
  activeFilterChips = [],
  onRemoveFilter,
  onClearFilters,
  codeKeyword,
  onCodeKeywordChange,
  supplierNameKeyword,
  onSupplierNameKeywordChange,
  onSupplierSearch,
  supplierSelected,
  onSupplierSelectedChange,
  supplierOptions = [],
  resultCount = 0,
  supplierCount = 0,
}) {
  return (
    <section className="space-y-4" aria-label="ตัวกรองรายการพิมพ์บาร์โค้ด">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-1 sm:inline-grid sm:w-auto">
        <button
          type="button"
          onClick={() => onModeChange?.('UNPRINTED')}
          className={`min-h-11 rounded-xl px-4 text-sm font-bold transition ${
            mode === 'UNPRINTED'
              ? 'bg-teal-100 text-teal-950 shadow-sm ring-1 ring-teal-300'
              : 'text-slate-600 hover:bg-white hover:text-slate-950'
          }`}
        >
          ยังไม่ได้พิมพ์
        </button>
        <button
          type="button"
          onClick={() => onModeChange?.('REPRINT')}
          className={`min-h-11 rounded-xl px-4 text-sm font-bold transition ${
            mode === 'REPRINT'
              ? 'bg-teal-100 text-teal-950 shadow-sm ring-1 ring-teal-300'
              : 'text-slate-600 hover:bg-white hover:text-slate-950'
          }`}
        >
          พิมพ์ซ้ำ
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        {activeFilterChips.length > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <SlidersHorizontal className="h-4 w-4" />
              ตัวกรองที่ใช้งาน
            </span>
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 text-xs font-semibold text-teal-800"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={() => onRemoveFilter?.(chip.key)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-teal-100"
                  aria-label={`ลบตัวกรอง ${chip.label}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={onClearFilters}
              className="min-h-9 px-2 text-xs font-semibold text-slate-500 underline hover:text-teal-700"
            >
              ล้างทั้งหมด
            </button>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {mode === 'REPRINT' ? (
            <label className="space-y-1.5">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Search className="h-4 w-4" /> เลข RC หรือ PO
              </span>
              <input
                type="search"
                value={codeKeyword}
                onChange={(event) => onCodeKeywordChange?.(event.target.value)}
                placeholder="เช่น RC-... หรือ PO-..."
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          ) : null}

          {mode === 'REPRINT' ? (
            <label className="space-y-1.5">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                <User className="h-4 w-4" /> ค้นหาคู่ค้า
              </span>
              <div className="flex gap-2">
                <input
                  type="search"
                  value={supplierNameKeyword}
                  onChange={(event) => onSupplierNameKeywordChange?.(event.target.value)}
                  placeholder="ชื่อ Supplier"
                  className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
                <button
                  type="button"
                  onClick={onSupplierSearch}
                  className="min-h-11 shrink-0 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white hover:bg-teal-800"
                >
                  ค้นหา
                </button>
              </div>
            </label>
          ) : null}

          <label className="space-y-1.5">
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Tag className="h-4 w-4" /> Supplier
            </span>
            <select
              value={supplierSelected}
              onChange={(event) => onSupplierSelectedChange?.(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              <option value="ALL">ทั้งหมด</option>
              {supplierOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>พบ <strong className="text-slate-950">{resultCount}</strong> ใบรับสินค้า</span>
          <span>คู่ค้าในรายการ <strong className="text-slate-950">{supplierCount}</strong> ราย</span>
        </div>
      </div>
    </section>
  );
}
