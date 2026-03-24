




// src/features/salesReport/pages/SalesDetailPage.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useSalesReportStore from '@/features/salesReport/stores/salesReportStore';
import usePaymentStore from '@/features/payment/store/paymentStore';

const formatNumber = (value) =>
  new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCurrency = (value) => `฿${formatNumber(value)}`;

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatDateTimeInput = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDiscountCurrency = (value) => {
  const amount = Number(value || 0);
  return amount > 0 ? `-${formatCurrency(amount)}` : formatCurrency(0);
};

const resolveLineTotal = (item) => {
  const directLineTotal = Number(item?.lineTotal);
  if (Number.isFinite(directLineTotal) && directLineTotal > 0) return directLineTotal;

  const qty = Number(item?.qty || 0);
  const unitPrice = Number(item?.unitPrice || 0);
  const discountAmount = Number(item?.discountAmount || 0);
  const computed = qty * unitPrice - discountAmount;

  return computed > 0 ? computed : 0;
};

const paymentMethodLabelMap = {
  ALL: 'ทั้งหมด',
  CASH: 'เงินสด',
  TRANSFER: 'โอนเงิน',
  CREDIT: 'เครดิต / หน่วยงาน',
  CARD: 'บัตรเครดิต',
  QR: 'QR',
  DEPOSIT: 'มัดจำ',
  E_WALLET: 'วอลเลต',
  CHEQUE: 'เช็ค',
  OTHER: 'อื่น ๆ',
};

const receivePaymentMethodOptions = [
  { value: 'CASH', label: 'เงินสด' },
  { value: 'TRANSFER', label: 'โอนเงิน' },
  { value: 'QR', label: 'QR' },
  { value: 'CARD', label: 'บัตรเครดิต' },
  { value: 'CHEQUE', label: 'เช็ค' },
  { value: 'E_WALLET', label: 'วอลเลต' },
  { value: 'OTHER', label: 'อื่น ๆ' },
];

const sumPaymentItems = (payment) => {
  if (!Array.isArray(payment?.items) || payment.items.length === 0) {
    return Number(payment?.amount || 0);
  }
  return payment.items.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
};

const statusLabelMap = {
  DRAFT: 'ฉบับร่าง',
  COMPLETED: 'สำเร็จ',
  PENDING: 'รอดำเนินการ',
  VOID: 'ยกเลิก',
  REFUNDED: 'คืนเงิน',
};

const statusClassMap = {
  DRAFT: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  VOID: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  REFUNDED: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

const paymentStatusLabelMap = {
  PAID: 'ชำระแล้ว',
  PARTIAL: 'ชำระบางส่วน',
  PARTIALLY_PAID: 'ชำระบางส่วน',
  UNPAID: 'ยังไม่ชำระ',
  WAITING_APPROVAL: 'รอตรวจสอบ',
  CANCELLED: 'ยกเลิก',
};

const paymentStatusClassMap = {
  PAID: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  UNPAID: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  WAITING_APPROVAL: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  CANCELLED: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

export const SalesDetailPage = () => {
  const { saleId } = useParams();

  const salesDetail = useSalesReportStore((state) => state.salesDetail);
  const salesDetailLoading = useSalesReportStore((state) => state.salesDetailLoading);
  const salesDetailError = useSalesReportStore((state) => state.salesDetailError);
  const fetchSalesDetailAction = useSalesReportStore((state) => state.fetchSalesDetailAction);
  const clearSalesDetailAction = useSalesReportStore((state) => state.clearSalesDetailAction);

  const submitMultiPaymentAction = usePaymentStore((state) => state.submitMultiPaymentAction);
  const paymentLoading = usePaymentStore((state) => state.loading);
  const paymentError = usePaymentStore((state) => state.error);
  const clearPaymentErrorAction = usePaymentStore((state) => state.clearErrorAction);

  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState(false);
  const [receivePaymentForm, setReceivePaymentForm] = useState({
    method: 'CASH',
    amount: '',
    note: '',
    receivedAt: formatDateTimeInput(),
  });
  const [receivePaymentMessage, setReceivePaymentMessage] = useState('');
  const [receivePaymentError, setReceivePaymentError] = useState('');

  useEffect(() => {
    fetchSalesDetailAction(saleId);

    return () => {
      clearSalesDetailAction();
      clearPaymentErrorAction?.();
    };
  }, [saleId, fetchSalesDetailAction, clearSalesDetailAction, clearPaymentErrorAction]);

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

  const totals = salesDetail?.totals || sale?.totals || {
    totalBeforeDiscount: sale.subtotal || 0,
    totalDiscount: sale.discountAmount || 0,
    beforeVat: sale.beforeVat || 0,
    vatAmount: sale.vatAmount || 0,
    totalAmount: sale.totalAmount || 0,
    vatRate: sale.vatRate || 7,
  };

  const paymentSummary = salesDetail?.paymentSummary || sale?.paymentSummary || {
    totalAmount: totals.totalAmount || sale.totalAmount || 0,
    receivedAmount: sale.receivedAmount || 0,
    balanceAmount: Math.max(0, Number((totals.totalAmount || sale.totalAmount || 0) - (sale.receivedAmount || 0))),
    changeAmount: sale.changeAmount || 0,
    hasPayment: Number(sale.receivedAmount || 0) > 0,
    isFullyPaid: false,
    isPartiallyPaid: false,
  };

  const items = Array.isArray(salesDetail?.items) ? salesDetail.items : [];
  const payments = Array.isArray(salesDetail?.payments) ? salesDetail.payments : [];
  const timeline = Array.isArray(salesDetail?.timeline) ? salesDetail.timeline : [];

  const activePayments = payments.filter((payment) => !payment?.isCancelled);
  const paymentMethodDisplay = (() => {
    const methods = Array.from(
      new Set(
        activePayments.flatMap((payment) =>
          Array.isArray(payment?.items)
            ? payment.items.map((item) => item?.paymentMethod).filter(Boolean)
            : []
        )
      )
    );

    if (methods.length === 0) return paymentMethodLabelMap[sale.paymentMethod] || sale.paymentMethod;
    if (methods.length === 1) return paymentMethodLabelMap[methods[0]] || methods[0];
    return 'หลายช่องทาง';
  })();

  const balanceAmount = Number(paymentSummary.balanceAmount || 0);
  const isPaymentComplete = balanceAmount <= 0 || sale.paymentStatus === 'PAID';
  const isSaleVoided = ['VOID', 'REFUNDED'].includes(sale.saleStatus);

  const balanceTextClass = useMemo(() => {
    if (paymentSummary.isFullyPaid || isPaymentComplete) return 'text-emerald-600';
    if (paymentSummary.isPartiallyPaid) return 'text-amber-600';
    return 'text-rose-600';
  }, [paymentSummary.isFullyPaid, paymentSummary.isPartiallyPaid, isPaymentComplete]);

  const handleReceivePaymentFieldChange = (field, value) => {
    setReceivePaymentMessage('');
    setReceivePaymentError('');
    clearPaymentErrorAction?.();

    setReceivePaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenReceivePayment = () => {
    setReceivePaymentMessage('');
    setReceivePaymentError('');
    clearPaymentErrorAction?.();
    setReceivePaymentForm({
      method: 'CASH',
      amount: balanceAmount > 0 ? String(Number(balanceAmount.toFixed(2))) : '',
      note: '',
      receivedAt: formatDateTimeInput(),
    });
    setIsReceivePaymentOpen(true);
  };

  const handleCloseReceivePayment = () => {
    setIsReceivePaymentOpen(false);
    setReceivePaymentMessage('');
    setReceivePaymentError('');
    clearPaymentErrorAction?.();
  };

  const handleSubmitReceivePayment = async (event) => {
    event.preventDefault();
    setReceivePaymentMessage('');
    setReceivePaymentError('');
    clearPaymentErrorAction?.();

    const amount = Number(receivePaymentForm.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setReceivePaymentError('กรุณาระบุจำนวนเงินที่รับชำระให้ถูกต้อง');
      return;
    }

    if (amount > balanceAmount) {
      setReceivePaymentError('จำนวนเงินเกินยอดคงเหลือของบิลนี้');
      return;
    }

    if (isPaymentComplete) {
      setReceivePaymentError('บิลนี้ชำระครบแล้ว ไม่สามารถรับชำระเพิ่มได้');
      return;
    }

    if (isSaleVoided) {
      setReceivePaymentError('บิลนี้ไม่สามารถรับชำระเพิ่มได้');
      return;
    }

    try {
      await submitMultiPaymentAction({
        saleId: Number(saleId),
        paymentList: [
          {
            method: receivePaymentForm.method,
            amount,
            note: receivePaymentForm.note?.trim() || '',
          },
        ],
        paymentData: {
          receivedAt: receivePaymentForm.receivedAt || undefined,
          note: receivePaymentForm.note?.trim() || '',
        },
      });

      await fetchSalesDetailAction(saleId);

      setReceivePaymentMessage('บันทึกรายการรับชำระเงินเรียบร้อยแล้ว');
      setTimeout(() => {
        document.getElementById('payment-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      setReceivePaymentForm({
        method: 'CASH',
        amount: '',
        note: '',
        receivedAt: formatDateTimeInput(),
      });
      setIsReceivePaymentOpen(false);
    } catch (error) {
      setReceivePaymentError(error?.message || 'ไม่สามารถบันทึกรายการรับชำระเงินได้');
    }
  };

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
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-slate-300 px-4 py-2.5 text-sm font-semibold text-white"
              title="กำลังเตรียมฟังก์ชันพิมพ์ใบเสร็จ"
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

        {receivePaymentMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {receivePaymentMessage}
          </div>
        ) : null}

        {(receivePaymentError || paymentError) ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {receivePaymentError || paymentError}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{sale.saleNo}</h2>
                <p className="mt-1 text-sm text-slate-500">ขายเมื่อ {formatDateTime(sale.soldAt)}</p>
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
                  {paymentMethodDisplay}
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
                        <td colSpan={6} className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                          กำลังโหลดรายการสินค้า...
                        </td>
                      </tr>
                    ) : items.length > 0 ? (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-900">
                            <div className="font-medium">{item.productName || '-'}</div>
                            <div className="mt-1 text-xs text-slate-500">{item.sku || item.productCode || '-'}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{item.barcode || '-'}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{formatNumber(item.qty)}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{formatDiscountCurrency(item.discountAmount)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(resolveLineTotal(item))}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                          ไม่พบรายการสินค้าในบิลนี้
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">สรุปการชำระเงิน</h3>
                  <p className="mt-1 text-sm text-slate-500">ใช้ยอดจริงจาก payment records ของบิลนี้</p>
                </div>
                <button
                  type="button"
                  onClick={isReceivePaymentOpen ? handleCloseReceivePayment : handleOpenReceivePayment}
                  disabled={salesDetailLoading || paymentLoading || isPaymentComplete || isSaleVoided}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${salesDetailLoading || paymentLoading || isPaymentComplete || isSaleVoided ? 'cursor-not-allowed bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                  title={isPaymentComplete ? 'บิลนี้ชำระครบแล้ว' : isSaleVoided ? 'บิลนี้ไม่สามารถรับชำระเพิ่มได้' : 'รับชำระเพิ่ม'}
                >
                  {isReceivePaymentOpen ? 'ปิดฟอร์มรับชำระ' : 'รับชำระเพิ่ม'}
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>ยอดก่อนส่วนลด</span>
                  <span className="font-medium">{formatCurrency(totals.totalBeforeDiscount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>ส่วนลด</span>
                  <span className="font-medium">{formatDiscountCurrency(totals.totalDiscount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>ก่อน VAT</span>
                  <span className="font-medium">{formatCurrency(totals.beforeVat)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>VAT</span>
                  <span className="font-medium">{formatCurrency(totals.vatAmount)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between gap-4 text-base font-bold text-slate-900">
                    <span>ยอดสุทธิ</span>
                    <span>{formatCurrency(paymentSummary.totalAmount)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>รับชำระแล้ว</span>
                  <span className="font-medium">{formatCurrency(paymentSummary.receivedAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>คงเหลือ</span>
                  <span className={`font-semibold ${balanceTextClass}`}>{formatCurrency(paymentSummary.balanceAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-700">
                  <span>เงินทอน</span>
                  <span className="font-medium">{formatCurrency(paymentSummary.changeAmount)}</span>
                </div>
              </div>

              {isReceivePaymentOpen ? (
                <form onSubmit={handleSubmitReceivePayment} className="mt-5 space-y-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold text-slate-700">วิธีรับชำระ</span>
                      <select
                        value={receivePaymentForm.method}
                        onChange={(event) => handleReceivePaymentFieldChange('method', event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500"
                      >
                        {receivePaymentMethodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold text-slate-700">วันที่รับชำระ</span>
                      <input
                        type="datetime-local"
                        value={receivePaymentForm.receivedAt}
                        onChange={(event) => handleReceivePaymentFieldChange('receivedAt', event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">จำนวนเงินรับชำระ</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={balanceAmount > 0 ? String(Number(balanceAmount.toFixed(2))) : '0.00'}
                      value={receivePaymentForm.amount}
                      onChange={(event) => handleReceivePaymentFieldChange('amount', event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-right text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">ยอดคงเหลือปัจจุบัน {formatCurrency(balanceAmount)}</p>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">หมายเหตุ</span>
                    <textarea
                      rows={3}
                      value={receivePaymentForm.note}
                      onChange={(event) => handleReceivePaymentFieldChange('note', event.target.value)}
                      placeholder="เช่น รับชำระรอบที่ 2 / ลูกค้าโอนมาแล้ว"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500"
                    />
                  </label>

                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseReceivePayment}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${paymentLoading ? 'cursor-not-allowed bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                      {paymentLoading ? 'กำลังบันทึก...' : 'บันทึกรับชำระ'}
                    </button>
                  </div>
                </form>
              ) : null}
            </article>

            <article id="payment-history" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">ประวัติการชำระเงิน</h3>

              <div className="mt-5 space-y-4">
                {salesDetailLoading ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                    กำลังโหลดประวัติการชำระเงิน...
                  </div>
                ) : payments.length > 0 ? (
                  payments.map((payment, index) => {
                    const paymentAmount = sumPaymentItems(payment);
                    const paymentAt = payment.receivedAt || payment.paidAt;
                    const paymentCode = payment.code || payment.combinedDocumentCode || `PAY-${payment.id}`;

                    return (
                      <div
                        key={payment.id}
                        className={`rounded-2xl border px-4 py-4 ${index === 0 && !payment?.isCancelled ? 'border-blue-200 bg-blue-50/60' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900">{paymentCode}</p>
                              {payment.isCancelled ? (
                                <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                  ยกเลิกแล้ว
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{formatDateTime(paymentAt)}</p>
                            <p className="mt-1 text-sm text-slate-500">หมายเหตุ: {payment.note || '-'}</p>
                          </div>
                          <p className="text-base font-bold text-slate-900">{formatCurrency(paymentAmount)}</p>
                        </div>

                        {Array.isArray(payment.items) && payment.items.length > 0 ? (
                          <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
                            {payment.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-start justify-between gap-3 text-sm"
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-slate-800">
                                      {paymentMethodLabelMap[item.paymentMethod] || item.paymentMethod}
                                    </p>
                                    <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                      {paymentMethodLabelMap[item.paymentMethod] || item.paymentMethod}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-slate-500">
                                    {item.note || item.cardRef || item.slipImage || '-'}
                                  </p>
                                </div>
                                <p className="font-semibold text-slate-900">
                                  {formatCurrency(item.amount)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-500">
                            วิธีชำระ: {paymentMethodLabelMap[payment.paymentMethod] || payment.paymentMethod || '-'}
                          </div>
                        )}
                      </div>
                    );
                  })
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
                        <p className="mt-1 text-sm text-slate-600">{formatDateTime(event.at)}</p>
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




