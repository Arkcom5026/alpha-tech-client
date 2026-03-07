



// src/features/customerReceipt/components/CustomerReceiptSummaryCards.jsx

const formatMoney = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const SummaryCard = ({ title, value, subtitle, loading = false, accentClass = 'text-gray-900' }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="min-h-[36px]">
          {loading ? (
            <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-200" />
          ) : (
            <p className={`text-2xl font-semibold tracking-tight ${accentClass}`}>{value}</p>
          )}
        </div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

const CustomerReceiptSummaryCards = ({ summary = {}, loading = false }) => {
  const safeSummary = {
    totalReceipts: Number(summary?.totalReceipts || 0),
    totalAmount: Number(summary?.totalAmount || 0),
    totalAllocated: Number(summary?.totalAllocated || 0),
    totalRemaining: Number(summary?.totalRemaining || 0),
    activeCount: Number(summary?.activeCount || 0),
    fullyAllocatedCount: Number(summary?.fullyAllocatedCount || 0),
    cancelledCount: Number(summary?.cancelledCount || 0),
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="จำนวนใบรับเงิน"
        value={`${safeSummary.totalReceipts} รายการ`}
        subtitle={`ใช้งานอยู่ ${safeSummary.activeCount} • ตัดครบ ${safeSummary.fullyAllocatedCount} • ยกเลิก ${safeSummary.cancelledCount}`}
        loading={loading}
      />

      <SummaryCard
        title="ยอดรับรวม"
        value={formatMoney(safeSummary.totalAmount)}
        subtitle="มูลค่ารับเงินทั้งหมดตามรายการที่ค้นพบ"
        loading={loading}
        accentClass="text-blue-700"
      />

      <SummaryCard
        title="ยอดตัดชำระแล้ว"
        value={formatMoney(safeSummary.totalAllocated)}
        subtitle="ยอดที่ถูกนำไปตัดชำระบิลขายแล้ว"
        loading={loading}
        accentClass="text-emerald-700"
      />

      <SummaryCard
        title="ยอดคงเหลือ"
        value={formatMoney(safeSummary.totalRemaining)}
        subtitle="ยอดคงเหลือที่ยังสามารถนำไปตัดชำระต่อได้"
        loading={loading}
        accentClass="text-amber-700"
      />
    </div>
  );
};

export default CustomerReceiptSummaryCards;

  

