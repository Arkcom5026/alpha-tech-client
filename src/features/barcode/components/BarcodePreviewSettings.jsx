import React from 'react';
import { Columns3, Maximize2, Type } from 'lucide-react';

export default function BarcodePreviewSettings({
  columns,
  onColumnsChange,
  fontSize,
  onFontSizeChange,
  labelScale,
  onLabelScaleChange,
  disabled = false,
}) {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5"
      aria-labelledby="barcode-preview-settings-title"
    >
      <div className="mb-4">
        <h2 id="barcode-preview-settings-title" className="text-base font-bold text-slate-950">
          ตั้งค่าการพิมพ์
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          ปรับจำนวนคอลัมน์ ขนาดตัวอักษร และสัดส่วนฉลากก่อนสั่งพิมพ์
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Columns3 className="h-4 w-4" /> จำนวนคอลัมน์
          </span>
          <select
            value={columns}
            onChange={(event) => onColumnsChange?.(Number(event.target.value))}
            disabled={disabled}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>{value} คอลัมน์</option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Type className="h-4 w-4" /> ขนาดตัวอักษร
          </span>
          <input
            type="number"
            min="8"
            max="24"
            step="1"
            value={fontSize}
            onChange={(event) => onFontSizeChange?.(Number(event.target.value))}
            disabled={disabled}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Maximize2 className="h-4 w-4" /> สัดส่วนฉลาก
          </span>
          <input
            type="range"
            min="80"
            max="140"
            step="5"
            value={labelScale}
            onChange={(event) => onLabelScaleChange?.(Number(event.target.value))}
            disabled={disabled}
            className="min-h-11 w-full accent-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="text-right text-xs font-semibold text-slate-500">{labelScale}%</div>
        </label>
      </div>
    </section>
  );
}
