import React from 'react';
import { CheckCircle2, Printer, RotateCcw } from 'lucide-react';

export default function BarcodePreviewActionBar({
  onReset,
  onPrint,
  onConfirmPrinted,
  printing = false,
  confirming = false,
  confirmed = false,
  disabled = false,
}) {
  return (
    <section className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:p-4" aria-label="คำสั่งพิมพ์บาร์โค้ด">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onReset}
          disabled={disabled || printing || confirming}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          คืนค่าการแสดงผล
        </button>

        <button
          type="button"
          onClick={onPrint}
          disabled={disabled || printing || confirming}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Printer className="h-4 w-4" />
          {printing ? 'กำลังเปิดหน้าพิมพ์...' : 'พิมพ์ฉลาก'}
        </button>

        <button
          type="button"
          onClick={onConfirmPrinted}
          disabled={disabled || printing || confirming || confirmed}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {confirmed ? 'ยืนยันการพิมพ์แล้ว' : confirming ? 'กำลังยืนยัน...' : 'ยืนยันว่าพิมพ์แล้ว'}
        </button>
      </div>
    </section>
  );
}
