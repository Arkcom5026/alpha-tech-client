import React from 'react';
import { ArrowRight, Barcode, CheckCircle2, PackageCheck, Printer } from 'lucide-react';

export default function BarcodePreviewWorkspaceHeader({
  receiptId,
  labelCount = 0,
  printedCount = 0,
  isPrinted = false,
  preparing = false,
  onContinueToReceive,
}) {
  const canContinue = labelCount > 0 && !preparing;

  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-teal-700">
            <Barcode className="h-5 w-5" />
            <span className="text-xs font-semibold">พรีวิวและควบคุมงานพิมพ์</span>
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950 md:text-2xl">เตรียม Barcode / SN ก่อนรับสินค้า</h1>
          <p className="mt-1 text-sm text-slate-500">
            ระบบเติม Barcode ที่ขาดให้อัตโนมัติแบบไม่สร้างซ้ำ จากนั้นตรวจหรือพิมพ์ฉลากก่อนเข้าสู่การยิงรับสินค้าเข้าสต๊อก
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600">
              <Printer className="h-4 w-4" />
              ใบรับ #{receiptId || '-'}
            </span>
            <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600">
              จำนวนฉลาก {labelCount}
            </span>
            <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600">
              พิมพ์แล้ว {printedCount}/{labelCount}
            </span>
            <span className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold ${isPrinted ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
              <CheckCircle2 className="h-4 w-4" />
              {isPrinted ? 'ยืนยันพิมพ์แล้ว' : preparing ? 'กำลังเตรียมรหัส...' : 'พร้อมตรวจ/พิมพ์'}
            </span>
          </div>

          <button
            type="button"
            onClick={onContinueToReceive}
            disabled={!canContinue}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          >
            <PackageCheck className="h-4 w-4" />
            ไปยิงรับสินค้าเข้าสต๊อก
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
