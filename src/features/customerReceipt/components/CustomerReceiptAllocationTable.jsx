

// src/features/customerReceipt/components/CustomerReceiptAllocationTable.jsx

import { Link } from 'react-router-dom';

const formatMoney = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
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

const EmptyState = () => {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
      <p className="text-base font-medium text-gray-800">ยังไม่มีประวัติการตัดชำระ</p>
      <p className="mt-1 text-sm text-gray-500">
        ใบรับเงินนี้ยังไม่ได้ถูกนำไปตัดกับบิลขายรายการใด
      </p>
    </div>
  );
};

const CustomerReceiptAllocationTable = ({ allocations = [] }) => {
  const safeAllocations = Array.isArray(allocations) ? allocations : [];

  if (safeAllocations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                บิลขาย
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                วันที่ตัดชำระ
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                จำนวนที่ตัด
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
                สถานะบิล
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                หมายเหตุ
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {safeAllocations.map((allocation) => {
              const sale = allocation?.sale || null;
              const saleTotalAmount = Number(sale?.totalAmount || 0);
              const salePaidAmount = Number(sale?.paidAmount || 0);
              const saleOutstandingAmount = Math.max(0, saleTotalAmount - salePaidAmount);
              const paymentStatus = getPaymentStatusConfig(sale?.statusPayment);
              const salePath = sale?.id ? `/pos/sales/${sale.id}` : null;

              return (
                <tr
                  key={allocation?.id || `${allocation?.saleId}-${allocation?.createdAt}`}
                  className="border-t border-gray-100 align-top hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {salePath ? (
                      <Link to={salePath} className="font-medium text-blue-700 transition hover:text-blue-800 hover:underline">
                        {sale?.code || `SALE #${allocation?.saleId || '-'}`}
                      </Link>
                    ) : (
                      <div className="font-medium">{sale?.code || `SALE #${allocation?.saleId || '-'}`}</div>
                    )}
                    <div className="mt-1 text-xs text-gray-500">เลขอ้างอิง Allocation: {allocation?.id || '-'}</div>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{formatDateTime(allocation?.createdAt || allocation?.allocatedAt)}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      โดย: {allocation?.createdByEmployeeProfile?.fullName || allocation?.createdByEmployeeProfile?.name || '-'}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-700">
                    {formatMoney(allocation?.amount)}
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatMoney(saleTotalAmount)}
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {formatMoney(salePaidAmount)}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-medium text-amber-700">
                    {formatMoney(saleOutstandingAmount)}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${paymentStatus.className}`}
                    >
                      {paymentStatus.label}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="max-w-[240px] whitespace-pre-wrap break-words">
                      {allocation?.note || '-'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerReceiptAllocationTable;



