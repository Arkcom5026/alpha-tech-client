import React from 'react';
import { Barcode, RefreshCw, ArrowRight } from 'lucide-react';

export default function BarcodeWorkspaceHeader({
  loading = false,
  lastLoadedLabel = '',
  onRefresh,
  onOpenRangePrint,
}) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-teal-700">
            <Barcode className="h-5 w-5" />
            <span className="text-xs font-semibold">งานพิมพ์ฉลากสินค้า</span>
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950 md:text-2xl">
            รายการใบรับสินค้าที่รอพิมพ์บาร์โค้ด
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ตรวจสอบ เลือกรายการ และจัดคิวพิมพ์ฉลากจากใบตรวจรับสินค้า
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {lastLoadedLabel ? (
            <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-500">
              อัปเดตล่าสุด: {lastLoadedLabel}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
          <button
            type="button"
            onClick={onOpenRangePrint}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
          >
            พิมพ์บาร์โค้ดช่วงเลข
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
