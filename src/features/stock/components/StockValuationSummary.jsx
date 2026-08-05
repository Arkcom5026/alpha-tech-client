import StockMetricCard from '@/features/stock/components/workspace/StockMetricCard';
import StockStatusPanel from '@/features/stock/components/workspace/StockStatusPanel';

const formatMoney = (value) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const StockValuationSummary = ({ data }) => {
  const valuation = data?.valuation;
  const quality = data?.dataQuality;
  if (!valuation || !quality) return null;

  const reconciliationDifference = Number(quality.quantityReconciliationDifference || 0);
  const hasReconciliationWarning = Math.abs(reconciliationDifference) > 0.0001;

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
      <header className="mb-4">
        <h3 className="text-base font-semibold text-slate-950">มูลค่าสต๊อกปัจจุบัน</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          คำนวณจากข้อมูลของร้านที่เข้าสู่ระบบและต้นทุนสินค้าคงเหลือ
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StockMetricCard label="สินค้าติดตามรายชิ้น" value={formatMoney(valuation.structuredCostValue)} />
        <StockMetricCard label="สินค้า Simple" value={formatMoney(valuation.simpleCostValue)} tone="blue" />
        <StockMetricCard label="มูลค่าสต๊อกรวม" value={formatMoney(valuation.totalCostValue)} tone="emerald" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {quality.hasIncompleteValuation && (
          <StockStatusPanel
            tone="warning"
            title="มูลค่าสต๊อกยังไม่สมบูรณ์"
            description={`สินค้าติดตามรายชิ้นไม่มีต้นทุน ${Number(quality.missingCostItems || 0)} รายการ • สินค้า Simple ไม่มีต้นทุน ${Number(quality.missingCostLots || 0)} ล็อต${Number(quality.missingCostQuantity || 0) > 0 ? ` • ปริมาณที่ยังประเมินไม่ได้ ${Number(quality.missingCostQuantity || 0)}` : ''}`}
          />
        )}

        {hasReconciliationWarning && (
          <StockStatusPanel
            tone="critical"
            title="ยอดสินค้า Simple ไม่ตรงกัน"
            description={`StockBalance ต่างจากผลรวม SimpleLot อยู่ ${reconciliationDifference} หน่วย ควรตรวจสอบก่อนใช้ยอดทางบัญชี`}
          />
        )}

        {!quality.hasIncompleteValuation && !hasReconciliationWarning && (
          <div className="lg:col-span-2">
            <StockStatusPanel
              tone="success"
              title="ข้อมูลมูลค่าสต๊อกสมบูรณ์"
              description="ไม่พบรายการไม่มีต้นทุน และยอด SimpleLot ตรงกับ StockBalance"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default StockValuationSummary;
