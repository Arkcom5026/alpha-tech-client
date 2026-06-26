// src/features/customerReceipt/components/SaleAllocationCandidateTable.jsx
// 🏛️ Premium Next-Gen POS Allocation Candidate Grid: (High-Density Slate Unified Edition)

const formatMoney = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const getPaymentStatusConfig = (status) => {
  switch (status) {
    case 'PAID':
      return {
        label: 'ชำระครบ',
        className: 'border-green-200 bg-green-50 text-green-700',
      };
    case 'PARTIALLY_PAID':
      return {
        label: 'ชำระบางส่วน',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
      };
    case 'UNPAID':
    default:
      return {
        label: 'ยังไม่ชำระครบ',
        className: 'border-blue-200 bg-blue-50 text-blue-700',
      };
  }
};

const TableLoadingRows = () => {
  return Array.from({ length: 4 }).map((_, index) => (
    <tr key={`loading-${index}`} className="border-t border-gray-100">
      {Array.from({ length: 8 }).map((__, cellIndex) => (
        <td key={`loading-${index}-${cellIndex}`} className="px-3 py-2.5">
          <div className="h-3.5 bg-slate-100 animate-pulse rounded w-full" />
        </td>
      ))}
    </tr>
  ));
};

const EmptyState = () => {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-8 text-center select-none">
      <p className="text-sm font-black text-slate-400">📭 ไม่พบบิลค้างชำระสำหรับลูกค้ารายนี้</p>
      <p className="mt-1 text-xs text-slate-400 font-bold max-w-md">
        ระบบไม่พบบิลขายที่มียอดคงค้างภายใต้ชื่อลูกค้าและสาขาปัจจุบัน หรือบิลทั้งหมดอาจได้รับการเคลียร์ยอดหนี้เสร็จสมบูรณ์แล้ว
      </p>
    </div>
  );
};

const SaleAllocationCandidateTable = ({
  items = [],
  loading = false,
  selectedSaleId = null,
  onSelect,
}) => {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-wider sticky top-0 bg-slate-50 z-10 border-b border-slate-100 select-none">
            <tr>
              <th className="p-2 px-3 text-center w-20">เลือกบิล</th>
              <th className="p-2 px-2">เลขที่บิลขาย</th>
              <th className="p-2 px-2">วันที่ขาย</th>
              <th className="p-2 px-2 text-right">มูลค่าบิลรวม</th>
              <th className="p-2 px-2 text-right">ชำระแล้ว</th>
              <th className="p-2 px-2 text-right">คงค้างสุทธิ</th>
              <th className="p-2 px-2 text-center">สถานะชำระ</th>
              <th className="p-2 px-3">ลูกค้า / สังกัดหน่วยงาน</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px] sm:text-xs">
            {loading ? (
              <TableLoadingRows />
            ) : safeItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-0">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              safeItems.map((item) => {
                const isSelected = Number(selectedSaleId) === Number(item?.id);
                const paymentStatus = getPaymentStatusConfig(item?.statusPayment);
                const outstandingAmount = Number(item?.outstandingAmount || 0);
                const customerName =
                  item?.customerName ||
                  item?.customer?.companyName ||
                  item?.customer?.name ||
                  [item?.customer?.firstName, item?.customer?.lastName].filter(Boolean).join(' ') ||
                  '-';

                return (
                  <tr
                    key={item?.id}
                    className={`transition-colors align-middle ${
                      isSelected ? 'bg-orange-500/5 text-slate-900' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="p-2 px-3 text-center select-none">
                      {outstandingAmount <= 0 ? (
                        <span className="inline-flex px-2 py-0.5 text-[9px] font-black rounded bg-slate-100 text-slate-400 border border-slate-200">
                          ตัดครบแล้ว
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelect?.(item)}
                          className={`h-5 px-2.5 font-black text-[10px] rounded transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                          }`}
                        >
                          {isSelected ? 'เลือกแล้ว' : 'เลือกบิล'}
                        </button>
                      )}
                    </td>

                    <td className="p-2 px-2 font-mono font-black text-slate-900 select-all">
                      {item?.code || `SALE #${item?.id || '-'}`}
                    </td>

                    <td className="p-2 px-2 font-mono text-slate-400">
                      <div>{formatDate(item?.createdAt || item?.saleDate)}</div>
                      {item?.dueDate && (
                        <div className="text-[10px] font-sans font-bold text-rose-500">
                          Due: {formatDate(item?.dueDate)}
                        </div>
                      )}
                    </td>

                    <td className="p-2 px-2 text-right font-mono text-slate-400">
                      {formatMoney(item?.totalAmount)}
                    </td>

                    <td className="p-2 px-2 text-right font-mono text-emerald-700">
                      {formatMoney(item?.paidAmount)}
                    </td>

                    <td className="p-2 px-2 text-right font-mono font-black text-rose-600">
                      {formatMoney(outstandingAmount)}
                    </td>

                    <td className="p-2 px-2 text-center select-none">
                      <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-black rounded ${paymentStatus.className}`}>
                        {paymentStatus.label}
                      </span>
                    </td>

                    <td className="p-2 px-3 font-bold text-slate-700 truncate max-w-[180px]" title={customerName}>
                      <div>{customerName}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal">
                        {item?.customer?.taxId || item?.customerTaxId || item?.customer?.phone || '—'}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SaleAllocationCandidateTable;