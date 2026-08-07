import { AlertCircle, Box, CheckCircle2 } from 'lucide-react';

const StockItemScanSummary = ({ totalCount = 0, scannedCount = 0, pendingCount = 0 }) => (
  <section className="grid gap-3 sm:grid-cols-3" aria-label="สรุปการรับสินค้า">
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Box size={18} /> ทั้งหมด</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{totalCount}</div>
    </article>
    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 size={18} /> รับแล้ว</div>
      <div className="mt-2 text-3xl font-bold text-emerald-800">{scannedCount}</div>
    </article>
    <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-700"><AlertCircle size={18} /> ค้างรับ</div>
      <div className="mt-2 text-3xl font-bold text-amber-800">{pendingCount}</div>
    </article>
  </section>
);

export default StockItemScanSummary;
