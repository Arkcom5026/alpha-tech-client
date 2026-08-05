import React from 'react';
import { PackageCheck, RefreshCw } from 'lucide-react';

export default function StockIntakeWorkspaceHeader({ loading = false, onRefresh }) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-teal-700">
            <PackageCheck className="h-5 w-5" />
            <span className="text-xs font-semibold">จัดซื้อ · รับสินค้าเข้าสู่สต๊อก</span>
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950 md:text-2xl">คิวรับสินค้าเข้าสู่สต๊อก</h1>
          <p className="mt-1 text-sm text-slate-500">เลือกใบรับที่ยังมี SN หรือ LOT ค้าง แล้วดำเนินการยิงรับสต๊อก</p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'กำลังโหลด' : 'รีเฟรช'}
        </button>
      </div>
    </header>
  );
}
