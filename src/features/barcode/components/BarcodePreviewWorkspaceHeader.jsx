import React from 'react';
import { Barcode, CheckCircle2, Printer } from 'lucide-react';

export default function BarcodePreviewWorkspaceHeader({ receiptId, labelCount = 0, printedCount = 0, isPrinted = false }) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-teal-700">
            <Barcode className="h-5 w-5" />
            <span className="text-xs font-semibold">พรีวิวและควบคุมงานพิมพ์</span>
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950 md:text-2xl">พรีวิวบาร์โค้ด</h1>
          <p className="mt-1 text-sm text-slate-500">ตรวจรูปแบบฉลาก ตั้งค่าการพิมพ์ และยืนยันผลหลังพิมพ์</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600">
            <Printer className="h-4 w-4" />
            ใบรับ #{receiptId || '-'}
          </span>
          <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600">
            ฉลาก {labelCount}
          </span>
          <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600">
            พิมพ์แล้ว {printedCount}/{labelCount}
          </span>
          <span className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold ${isPrinted ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
            <CheckCircle2 className="h-4 w-4" />
            {isPrinted ? 'ยืนยันพิมพ์แล้ว' : 'ยังไม่ได้ยืนยัน'}
          </span>
        </div>
      </div>
    </header>
  );
}
