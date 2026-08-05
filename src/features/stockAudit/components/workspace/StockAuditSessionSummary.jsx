import React from 'react';

const metricClass = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-800',
  teal: 'border-teal-200 bg-teal-50 text-teal-900',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  rose: 'border-rose-200 bg-rose-50 text-rose-900',
};

const Metric = ({ label, value, tone = 'neutral' }) => (
  <div className={`rounded-xl border px-3 py-2 ${metricClass[tone]}`}>
    <p className="text-[11px] font-medium text-slate-500">{label}</p>
    <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
  </div>
);

const StockAuditSessionSummary = ({
  sessionId,
  expectedCount,
  scannedCount,
  missingCount,
  formatNumber,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold text-teal-700">ตรวจนับสินค้าพร้อมขาย</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-950">เช็กสต๊อกหน้าร้าน</h1>
        <p className="mt-1 text-sm text-slate-500">
          สแกนบาร์โค้ดหรือหมายเลขเครื่องเพื่อตรวจสอบสินค้าของร้านปัจจุบัน
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
        <Metric label="รอบตรวจนับ" value={sessionId ? `#${sessionId}` : '-'} tone={sessionId ? 'teal' : 'neutral'} />
        <Metric label="คาดว่าจะพบ" value={formatNumber(expectedCount)} />
        <Metric label="สแกนแล้ว" value={formatNumber(scannedCount)} tone="emerald" />
        <Metric label="ยังไม่พบ" value={formatNumber(missingCount)} tone={Number(missingCount || 0) > 0 ? 'rose' : 'neutral'} />
      </div>
    </div>

    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
      <span><strong className="font-semibold text-slate-700">F2</strong> โฟกัสช่องสแกน</span>
      <span><strong className="font-semibold text-slate-700">F3</strong> สลับ Barcode / SN</span>
    </div>
  </section>
);

export default StockAuditSessionSummary;
