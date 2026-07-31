import React from 'react';

const formatMoney = (value) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const Metric = ({ label, value, emphasis = false }) => (
  <div className={`rounded-2xl border p-5 ${emphasis ? 'border-orange-200 bg-orange-50/70' : 'border-slate-200 bg-white'}`}>
    <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</div>
    <div className={`mt-2 text-xl font-black tracking-tight ${emphasis ? 'text-orange-700' : 'text-slate-900'}`}>{value}</div>
  </div>
);

const StockValuationSummary = ({ data }) => {
  const valuation = data?.valuation;
  const quality = data?.dataQuality;
  if (!valuation || !quality) return null;

  const reconciliationDifference = Number(quality.quantityReconciliationDifference || 0);
  const hasReconciliationWarning = Math.abs(reconciliationDifference) > 0.0001;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-base font-black text-slate-900">มูลค่าสต๊อกปัจจุบันของร้าน</h3>
        <p className="text-xs font-bold text-slate-400">คำนวณเฉพาะข้อมูลของร้านที่เข้าสู่ระบบ โดยอิงต้นทุนสินค้าคงเหลือจริง</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric label="Structured Stock Value" value={formatMoney(valuation.structuredCostValue)} />
        <Metric label="Simple Stock Value" value={formatMoney(valuation.simpleCostValue)} />
        <Metric label="Total Inventory Asset" value={formatMoney(valuation.totalCostValue)} emphasis />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {quality.hasIncompleteValuation && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="text-sm font-black text-amber-900">มูลค่าสต๊อกยังไม่สมบูรณ์</div>
            <div className="mt-1 text-xs font-bold leading-relaxed text-amber-800">
              Structured ไม่มีต้นทุน {Number(quality.missingCostItems || 0)} รายการ • Simple ไม่มีต้นทุน {Number(quality.missingCostLots || 0)} ล็อต
              {Number(quality.missingCostQuantity || 0) > 0 ? ` • ปริมาณที่ยังประเมินไม่ได้ ${Number(quality.missingCostQuantity || 0)}` : ''}
            </div>
          </div>
        )}

        {hasReconciliationWarning && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <div className="text-sm font-black text-rose-900">ยอด Simple Stock ไม่ตรงกัน</div>
            <div className="mt-1 text-xs font-bold leading-relaxed text-rose-800">
              StockBalance ต่างจากผลรวม SimpleLot อยู่ {reconciliationDifference} หน่วย ควรตรวจสอบก่อนใช้ยอดเพื่อการตัดสินใจทางบัญชี
            </div>
          </div>
        )}

        {!quality.hasIncompleteValuation && !hasReconciliationWarning && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 lg:col-span-2">
            <div className="text-sm font-black text-emerald-900">ข้อมูลมูลค่าสต๊อกสมบูรณ์</div>
            <div className="mt-1 text-xs font-bold text-emerald-800">ไม่พบรายการไม่มีต้นทุน และยอด SimpleLot ตรงกับ StockBalance</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StockValuationSummary;
