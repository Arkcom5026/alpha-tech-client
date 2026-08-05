import React from 'react';
import { Plus } from 'lucide-react';

export default function PurchaseOrderWorkspaceHeader({ onCreate }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-teal-700">งานจัดซื้อและเอกสารคู่ค้า</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 md:text-2xl">ใบสั่งซื้อ</h1>
          <p className="mt-1 text-sm text-slate-500">
            ค้นหา ตรวจสอบ แก้ไข และพิมพ์เอกสารจัดซื้อของร้านปัจจุบัน
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          สร้างใบสั่งซื้อ
        </button>
      </div>
    </section>
  );
}
