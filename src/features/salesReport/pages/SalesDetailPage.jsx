


// src/features/salesReport/pages/SalesDetailPage.jsx

import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import useSalesReportStore from '@/features/salesReport/stores/salesReportStore';

const formatNumber = (value) =>
  new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCurrency = (value) => `฿${formatNumber(value)}`;

const paymentMethodLabelMap = {
  ALL: 'ทั้งหมด',
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

const paymentStatusLabelMap = {
  PAID: 'ชำระแล้ว',
  PARTIAL: 'ชำระบางส่วน',
  UNPAID: 'ยังไม่ชำระ',
};

const paymentStatusClassMap = {
  PAID: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  UNPAID: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

export const SalesDetailPage = () => {
  const { saleId } = useParams();

  const salesDetail = useSalesReportStore((state) => state.salesDetail);
  const salesDetailLoading = useSalesReportStore((state) => state.salesDetailLoading);
  const salesDetailError = useSalesReportStore((state) => state.salesDetailError);
  const fetchSalesDetailAction = useSalesReportStore((state) => state.fetchSalesDetailAction);
  const clearSalesDetailAction = useSalesReportStore((state) => state.clearSalesDetailAction);

  useEffect(() => {
    fetchSalesDetailAction(saleId);

    return () => {
      clearSalesDetailAction();
    };
  }, [saleId, fetchSalesDetailAction, clearSalesDetailAction]);

  const sale = salesDetail?.sale || {
    saleNo: '-',
    soldAt: '-',
    customerName: 'ลูกค้าทั่วไป',
    customerPhone: '-',
    employeeName: '-',
    paymentMethod: 'CASH',
    paymentStatus: 'UNPAID',
    saleStatus: 'PENDING',
    branchName: '-',
    note: '',
    subtotal: 0,
    discountAmount: 0,
    beforeVat: 0,
    vatAmount: 0,
    totalAmount: 0,
    receivedAmount: 0,
    changeAmount: 0,
  };

  const items = Array.isArray(salesDetail?.items) ? salesDetail.items : [];
  const payments = Array.isArray(salesDetail?.payments) ? salesDetail.payments : [];
  const timeline = Array.isArray(salesDetail?.timeline) ? salesDetail.timeline : [];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Sales Report</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              รายละเอียดบิลขาย
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              ใช้ตรวจสอบข้อมูลบิล, รายการสินค้า, การชำระเงิน, และ timeline เพื่อรองรับ audit ระดับ production
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/pos/reports/sales/list"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              กลับรายการขาย
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              พิมพ์ใบเสร็จ
            </button>
          </div>
        </section>

        {salesDetailError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {salesDetailError}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{sale.saleNo}</h2>
                <p className="mt-1 text-sm text-slate-500">ขายเมื่อ {sale.soldAt || '-'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassMap[sale.saleStatus] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}
                >
                  {statusLabelMap[sale.saleStatus] || sale.saleStatus}
                </span>
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${paymentStatusClassMap[sale.paymentStatus] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}
                >
                  {paymentStatusLabelMap[sale.paymentStatus] || sale.paymentStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 py-5 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ลูกค้า</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{sale.customerName}</p>
                <p className="mt-1 text-sm text-slate-600">โทร: {sale.customerPhone || '-'}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">พนักงานขาย</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{sale.employeeName || '-'}</p>
                <p className="mt-1 text-sm text-slate-600">สาขา: {sale.branchName || '-'}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">การชำระเงิน</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {paymentMethodLabelMap[sale.paymentMethod] || sale.paymentMethod}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  สถานะ: {paymentStatusLabelMap[sale.paymentStatus] || sale.paymentStatus}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">หมายเหตุ</p>
                <p className="mt-2 text-sm text-slate-700">{sale.note || '-'}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">สินค้า</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">บาร์โค้ด</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">จำนวน</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">ราคาต่อหน่วย</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">ส่วนลด</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {salesDetailLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm font-medium text-slate-500">
                          กำลังโหลดรายละเอียดรายการสินค้า...
                        </td>
                      </tr>
                    ) : items.length > 0 ? (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{item.productName}</td>
                          <td className="px-4 py-3 text-slate-600">{item.barcode || '-'}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-700">
                            {formatNumber(item.qty)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700">
                            {formatCurrency(item.discountAmount)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">
                            {formatCurrency(item.lineTotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm font-medium text-slate-500">
                          ไม่พบรายการสินค้าในบิลนี้
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </article>

          <div className="flex flex-col gap-6">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">สรุปยอดเงิน</h3>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>ยอดรวมสินค้า</span>
                  <span className="font-medium">{formatCurrency(sale.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>ส่วนลด</span>
                  <span className="font-medium">-{formatCurrency(sale.discountAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>ก่อน VAT</span>
                  <span className="font-medium">{formatCurrency(sale.beforeVat)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>VAT</span>
                  <span className="font-medium">{formatCurrency(sale.vatAmount)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between gap-4 text-base font-bold text-slate-900">
                    <span>ยอดสุทธิ</span>
                    <span>{formatCurrency(sale.totalAmount)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>รับเงิน</span>
                  <span className="font-medium">{formatCurrency(sale.receivedAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>เงินทอน</span>
                  <span className="font-medium">{formatCurrency(sale.changeAmount)}</span>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">ประวัติการชำระเงิน</h3>

              <div className="mt-5 space-y-3">
                {salesDetailLoading ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                    กำลังโหลดประวัติการชำระเงิน...
                  </div>
                ) : payments.length > 0 ? (
                  payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {paymentMethodLabelMap[payment.method] || payment.method}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{payment.paidAt || '-'}</p>
                          <p className="mt-1 text-sm text-slate-500">อ้างอิง: {payment.reference || '-'}</p>
                        </div>
                        <p className="text-base font-bold text-slate-900">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                    ยังไม่มีประวัติการชำระเงิน
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Timeline</h3>

              <div className="mt-5 space-y-4">
                {salesDetailLoading ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                    กำลังโหลด timeline...
                  </div>
                ) : timeline.length > 0 ? (
                  timeline.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-600" />
                        {index < timeline.length - 1 ? (
                          <div className="mt-2 h-full min-h-[40px] w-px bg-slate-200" />
                        ) : null}
                      </div>
                      <div className="pb-2">
                        <p className="font-semibold text-slate-900">{event.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{event.at || '-'}</p>
                        <p className="mt-1 text-sm text-slate-500">โดย {event.by || '-'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                    ยังไม่มี timeline สำหรับบิลนี้
                  </div>
                )}
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalesDetailPage;
