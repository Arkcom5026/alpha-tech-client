

// src/features/customerReceipt/components/CustomerReceiptTable.jsx

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

const getStatusConfig = (status) => {
  switch (status) {
    case 'FULLY_ALLOCATED':
      return {
        label: 'ตัดครบแล้ว',
        className: 'bg-green-50 text-green-700 border-green-200',
      };
    case 'CANCELLED':
      return {
        label: 'ยกเลิกแล้ว',
        className: 'bg-red-50 text-red-700 border-red-200',
      };
    case 'ACTIVE':
    default:
      return {
        label: 'ใช้งานอยู่',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      };
  }
};

const resolveCustomerName = (item) => {
  const customer = item?.customer;
  if (!customer) return '-';

  return (
    customer.companyName ||
    customer.name ||
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    '-'
  );
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
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-base font-medium text-gray-800">ยังไม่พบรายการรับชำระ</p>
      <p className="mt-1 text-sm text-gray-500">
        ลองปรับคำค้นหา ช่วงวันที่ หรือสร้างใบรับเงินใหม่เพื่อเริ่มใช้งาน
      </p>
    </div>
  );
};

const PaginationControls = ({ pagination, onPageChange, onLimitChange, loading }) => {
  if (!pagination) return null;

  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const total = Number(pagination?.total || 0);
  const limit = Number(pagination?.limit || 20);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span>ทั้งหมด {total} รายการ</span>
        <span>•</span>
        <span>
          หน้า {currentPage} / {Math.max(totalPages, 1)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={limit}
          onChange={(event) => onLimitChange?.(Number(event.target.value))}
          disabled={loading}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {[10, 20, 50, 100].map((option) => (
            <option key={option} value={option}>
              {option} / หน้า
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={loading || currentPage <= 1}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ก่อนหน้า
        </button>

        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={loading || currentPage >= totalPages}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

const CustomerReceiptTable = ({
  items = [],
  loading = false,
  pagination = null,
  onPageChange,
  onLimitChange,
}) => {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                เลขที่ใบรับเงิน
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                วันที่รับเงิน
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                ลูกค้า / หน่วยงาน
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                ยอดรับ
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                ตัดแล้ว
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                คงเหลือ
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                สถานะ
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                จัดการ
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
                const statusConfig = getStatusConfig(item?.status);
                const receiptId = item?.id;
                const remainingAmount = Number(item?.remainingAmount || 0);
                const detailPath = `/pos/finance/customer-receipts/${receiptId}`;
                const allocatePath = `/pos/finance/customer-receipts/${receiptId}/allocate`;
                const printPath = `/pos/finance/customer-receipts/${receiptId}/print`;

                return (
                  <tr key={receiptId} className="border-t border-gray-100 align-top hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{item?.code || '-'}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        Ref: {item?.referenceNo || '-'}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(item?.receivedAt)}</td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{resolveCustomerName(item)}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {item?.customer?.taxId || item?.customer?.phone || '-'}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatMoney(item?.totalAmount)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatMoney(item?.allocatedAmount)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-medium text-blue-700">
                      {formatMoney(remainingAmount)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          to={detailPath}
                          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          รายละเอียด
                        </Link>

                        <Link
                          to={printPath}
                          className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          พิมพ์ใบเสร็จ
                        </Link>

                        {item?.status !== 'CANCELLED' && remainingAmount > 0 && (
                          <Link
                            to={allocatePath}
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                          >
                            ตัดชำระ
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        loading={loading}
      />
    </div>
  );
};

export default CustomerReceiptTable;


