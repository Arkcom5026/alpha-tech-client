import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const filters = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'SN', label: 'SN เท่านั้น' },
  { value: 'LOT', label: 'LOT เท่านั้น' },
];

export default function StockIntakeToolbar({ filter = 'ALL', onFilterChange, resultCount = 0 }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="ตัวกรองคิวรับสินค้าเข้าสู่สต๊อก">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <SlidersHorizontal className="h-4 w-4" />
          เลือกประเภทงานค้าง
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {filters.map((item) => {
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onFilterChange?.(item.value)}
                className={`min-h-11 shrink-0 rounded-xl border px-4 text-sm font-bold transition ${
                  active
                    ? 'border-teal-300 bg-teal-100 text-teal-950'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                aria-pressed={active}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500">
        แสดง <strong className="text-slate-950">{resultCount}</strong> ใบรับ
      </p>
    </section>
  );
}
