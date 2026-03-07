

// src/features/customerReceipt/components/SaleAllocationCandidateTable.jsx

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
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={`loading-${index}`} className="border-t border-gray-100">
      {Array.from({ length: 8 }).map((__, cellIndex) => (
        <td key={`loading-${index}-${cellIndex}`} className="px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  ));
};

const EmptyState = () => {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-base font-medium text-gray-800">ไม่พบบิลค้างชำระสำหรับลูกค้ารายนี้</p>
      <p className="mt-1 text-sm text-gray-500">
        ระบบไม่พบบิลขายที่มียอดคงค้างภายใต้ลูกค้าและสาขาปัจจุบัน หรืออาจยังไม่ได้โหลดข้อมูลล่าสุดเข้ามา
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                เลือก
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                เลขที่บิลขาย
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                วันที่ขาย
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                มูลค่าบิล
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                ชำระแล้ว
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                คงค้าง
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                สถานะชำระเงิน
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                ลูกค้า
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
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
                    className={`border-t border-gray-100 align-top transition ${
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-gray-50/60'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <button
                        type="button"
                        type="button"
                        onClick={() => onSelect?.(item)}
                        disabled={outstandingAmount <= 0}
                        className={`inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {outstandingAmount <= 0 ? 'ตัดครบแล้ว' : isSelected ? 'เลือกแล้ว' : 'เลือกบิล'}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{item?.code || `SALE #${item?.id || '-'}`}</div>
                      <div className="mt-1 text-xs text-gray-500">Sale ID: {item?.id || '-'}</div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>{formatDate(item?.createdAt || item?.saleDate)}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        ครบกำหนด: {formatDate(item?.dueDate)}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatMoney(item?.totalAmount)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatMoney(item?.paidAmount)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-semibold text-amber-700">
                      {formatMoney(outstandingAmount)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${paymentStatus.className}`}
                      >
                        {paymentStatus.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{customerName}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {item?.customer?.taxId || item?.customerTaxId || item?.customer?.phone || '-'}
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

