


/* =========================
   SalesTable.jsx
========================= */

import { Link } from 'react-router-dom';

const formatNumber = (value) =>
  new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCurrency = (value) => `฿${formatNumber(value)}`;

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const paymentMethodLabelMap = {
  CASH: 'เงินสด',
  TRANSFER: 'โอนเงิน',
  CREDIT: 'เครดิต',
  CARD: 'บัตร',
  QR: 'QR',
};

const statusLabelMap = {
  COMPLETED: 'สำเร็จ',
  PENDING: 'รอดำเนินการ',
  VOID: 'ยกเลิก',
  REFUNDED: 'คืนเงิน',
};

const statusClassMap = {
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  VOID: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  REFUNDED: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

export const salesTableMockRows = [
    {
      id: 101,
      saleNo: 'SALE-20260322-001',
      soldAt: '2026-03-22 09:15',
      customerName: 'ลูกค้าทั่วไป',
      employeeName: 'กัญญนา',
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      itemCount: 3,
      totalAmount: 12990,
    },
    {
      id: 102,
      saleNo: 'SALE-20260322-002',
      soldAt: '2026-03-22 09:42',
      customerName: 'บริษัท เอสที เซอร์วิส',
      employeeName: 'กัญญนา',
      paymentMethod: 'TRANSFER',
      status: 'COMPLETED',
      itemCount: 5,
      totalAmount: 8450,
    },
    {
      id: 103,
      saleNo: 'SALE-20260322-003',
      soldAt: '2026-03-22 10:05',
      customerName: 'สมชาย ใจดี',
      employeeName: 'วิรัตน์',
      paymentMethod: 'CREDIT',
      status: 'PENDING',
      itemCount: 2,
      totalAmount: 15200,
    },
  ];
  
  export const SalesTable = ({
    rows = salesTableMockRows,
    title = 'ตารางรายการขาย',
    subtitle,
    detailBasePath = '/pos/sales',
    onRowClick,
    emptyMessage = 'ยังไม่มีรายการขายในช่วงเวลานี้',
  }) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const resolvedSubtitle = subtitle || `ทั้งหมด ${formatNumber(safeRows.length)} รายการ`;
  
    return (
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{resolvedSubtitle}</p>
          </div>
        </div>
  
        {safeRows.length === 0 ? (
          <div className="px-6 py-12">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">เลขบิล</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">วันที่ / เวลา</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ลูกค้า</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">พนักงาน</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ชำระเงิน</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">จำนวนสินค้า</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">ยอดรวม</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700">สถานะ</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {safeRows.map((row) => {
                  const detailPath = `${detailBasePath}/${row.id}`;
  
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50 ${typeof onRowClick === 'function' ? 'cursor-pointer' : ''}`}
                      onClick={typeof onRowClick === 'function' ? () => onRowClick(row) : undefined}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.saleNo || '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(row.soldAt)}</td>
                      <td className="px-4 py-3 text-slate-700">{row.customerName || '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{row.employeeName || '-'}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {paymentMethodLabelMap[row.paymentMethod] || row.paymentMethod || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {formatNumber(row.itemCount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(row.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassMap[row.status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}
                        >
                          {statusLabelMap[row.status] || row.status || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={detailPath}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          onClick={(event) => event.stopPropagation()}
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };
  

  
