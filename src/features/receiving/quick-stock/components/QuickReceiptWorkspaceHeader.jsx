import React from 'react';
import { ClipboardList, RotateCcw } from 'lucide-react';

const QuickReceiptWorkspaceHeader = ({ hasActiveReceipt = false, receiptCode, receiptStatus, onReset }) => (
  <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-teal-700">
          <ClipboardList className="h-5 w-5" />
          <span className="text-xs font-semibold">จัดซื้อ · รับสินค้าด่วน</span>
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950 md:text-2xl">รับสินค้าด่วนตามใบส่งของ</h1>
        <p className="mt-1 text-sm text-slate-500">บันทึกข้อมูลใบส่งของ เลือกสินค้า สแกนรายการ และตรวจทานก่อนนำเข้าสต๊อก</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {hasActiveReceipt && (
          <span className="inline-flex min-h-11 items-center rounded-xl border border-teal-200 bg-teal-50 px-4 text-sm font-semibold text-teal-800">
            {receiptCode || 'ใบรับปัจจุบัน'} · {receiptStatus || 'DRAFT'}
          </span>
        )}
        {hasActiveReceipt && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            เริ่มใบรับใหม่
          </button>
        )}
      </div>
    </div>
  </header>
);

export default QuickReceiptWorkspaceHeader;
