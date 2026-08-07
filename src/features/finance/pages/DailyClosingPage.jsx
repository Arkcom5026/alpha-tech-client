import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFinanceStore from '@/features/finance/store/financeStore';
import FinanceMetricCard from '@/features/finance/components/workspace/FinanceMetricCard';
import FinanceWorkspaceHeader from '@/features/finance/components/workspace/FinanceWorkspaceHeader';
import FinanceWorkspaceSection from '@/features/finance/components/workspace/FinanceWorkspaceSection';

const toISODate = (d) => {
  try {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    const yyyy = String(dt.getFullYear());
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (_) {
    return '';
  }
};

const parseMoney = (val) => {
  if (val == null) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'string') {
    const n = Number(val.replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : 0;
  }
  try {
    if (typeof val === 'object' && typeof val.toNumber === 'function') {
      const n = val.toNumber();
      return Number.isFinite(n) ? n : 0;
    }
  } catch (_) {}
  return 0;
};

const round2 = (n) => Number((Number(n || 0)).toFixed(2));

const fmt = (n) => {
  const x = parseMoney(n);
  return x.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const safeText = (value, fallback = '-') => {
  if (value == null) return fallback;
  const s = String(value).trim();
  return s || fallback;
};

const PaymentRow = ({ label, value, helper }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {helper ? <p className="mt-0.5 text-xs font-medium text-slate-500">{helper}</p> : null}
    </div>
    <p className="whitespace-nowrap font-mono text-sm font-black text-slate-950">{fmt(value)} ฿</p>
  </div>
);

const SIGNAL_TONES = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-900',
  info: 'border-teal-200 bg-teal-50 text-teal-900',
  warn: 'border-amber-200 bg-amber-50 text-amber-900',
};

const SignalRow = ({ label, value, helper, tone = 'neutral' }) => (
  <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${SIGNAL_TONES[tone] || SIGNAL_TONES.neutral}`}>
    <div>
      <p className="text-sm font-black">{label}</p>
      {helper ? <p className="mt-1 text-xs font-medium opacity-80">{helper}</p> : null}
    </div>
    <p className="whitespace-nowrap font-mono text-sm font-black">{fmt(value)} ฿</p>
  </div>
);

const DailyClosingPage = () => {
  const { shopSlug } = useParams();
  const dailyClosingSummary = useFinanceStore((s) => s.dailyClosingSummary);
  const dailyClosingLoading = useFinanceStore((s) => s.dailyClosingLoading);
  const dailyClosingError = useFinanceStore((s) => s.dailyClosingError);
  const fetchDailyClosingSummaryAction = useFinanceStore((s) => s.fetchDailyClosingSummaryAction);
  const resetDailyClosingErrorAction = useFinanceStore((s) => s.resetDailyClosingErrorAction);

  const today = useMemo(() => toISODate(new Date()), []);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const didInitRef = useRef(false);

  const reload = useCallback(async () => {
    if (typeof fetchDailyClosingSummaryAction !== 'function') return null;
    return fetchDailyClosingSummaryAction({ fromDate, toDate });
  }, [fromDate, toDate, fetchDailyClosingSummaryAction]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    void reload();
  }, [reload]);

  const onSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    if (typeof resetDailyClosingErrorAction === 'function') resetDailyClosingErrorAction();
    await reload();
  }, [reload, resetDailyClosingErrorAction]);

  const onUseSingleDay = useCallback(() => {
    setToDate(fromDate);
  }, [fromDate]);

  const summary = dailyClosingSummary || {};
  const sales = summary.sales || {};
  const payments = summary.payments || {};
  const closing = summary.closing || {};
  const signals = summary.signals || {};
  const range = summary.range || {};
  const returns = signals.returns || summary.returns || { enabled: false };

  const deposits = signals.deposits || {};
  const customerReceipts = signals.customerReceipts || {};
  const creditSalesSignal = signals.creditSales || {};
  const receivablesFromTodaySales = signals.receivablesFromTodaySales || {};

  const totalCollected = useMemo(() => {
    const direct = payments.totalCollected ?? closing.collectedAmount;
    if (direct != null) return parseMoney(direct);

    return round2(
      parseMoney(payments.cash) +
        parseMoney(payments.transfer) +
        parseMoney(payments.qr) +
        parseMoney(payments.card) +
        parseMoney(payments.eWallet) +
        parseMoney(payments.deposit) +
        parseMoney(payments.cheque) +
        parseMoney(payments.other)
    );
  }, [payments, closing.collectedAmount]);

  const salesTotalAmount = parseMoney(closing.salesTotalAmount ?? sales.totalAmount);
  const creditOutstandingAmount = parseMoney(
    closing.creditOutstandingAmount ??
      creditSalesSignal.outstandingAmount ??
      sales.creditOutstandingAmount ??
      sales.unpaidAmount
  );
  const creditSalesAmount = parseMoney(closing.creditSalesAmount ?? creditSalesSignal.amount ?? sales.creditAmount);
  const creditBillCount = Number(closing.creditBillCount ?? creditSalesSignal.billCount ?? sales.creditBillCount ?? 0) || 0;

  const expectedCashAmount = parseMoney(closing.cashExpectedAmount ?? closing.expectedAmount ?? sales.cashExpectedAmount);
  const differenceAmount = round2(parseMoney(closing.differenceAmount ?? totalCollected - expectedCashAmount));
  const status = safeText(closing.status, expectedCashAmount <= 0 ? 'NO_SALES' : differenceAmount === 0 ? 'BALANCED' : 'DIFFERENCE');
  const hasCredit = creditOutstandingAmount > 0 || creditSalesAmount > 0 || creditBillCount > 0;

  const isRangeMode = Boolean(range.isRange || (fromDate && toDate && fromDate !== toDate));
  const rangeLabel = safeText(range.label, isRangeMode ? `${fromDate} ถึง ${toDate}` : fromDate);

  const statusView = useMemo(() => {
    if (status === 'NO_SALES') {
      return {
        title: isRangeMode ? 'ยังไม่มีบิลขายในช่วงวันที่เลือก' : 'ยังไม่มีบิลขายในวันนี้',
        text: 'ระบบยังไม่พบยอดขายสำหรับช่วงวันที่เลือก',
        className: 'border-slate-200 bg-slate-50 text-slate-700',
      };
    }

    if (status === 'BALANCED' || differenceAmount === 0) {
      return {
        title: isRangeMode ? '✅ สรุปช่วงวันที่ตรง' : '✅ ปิดร้านได้อย่างมั่นใจ',
        text: hasCredit
          ? `เงินรับจริงตรงกับยอดที่ควรได้รับ หลังแยกยอดเครดิต ${fmt(creditOutstandingAmount)} ฿ ออกแล้ว`
          : 'เงินรับจริงตรงกับยอดที่ควรได้รับ',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      };
    }

    return {
      title: `⚠️ พบส่วนต่างเงินจริง ${fmt(differenceAmount)} ฿`,
      text: differenceAmount > 0
        ? 'เงินรับจริงมากกว่ายอดที่ควรได้รับ กรุณาตรวจสอบรายการรับเงิน'
        : 'เงินรับจริงน้อยกว่ายอดที่ควรได้รับ กรุณาตรวจสอบเงินสด/โอน/QR/บัตร',
      className: 'border-amber-200 bg-amber-50 text-amber-900',
    };
  }, [status, differenceAmount, hasCredit, creditOutstandingAmount, isRangeMode]);

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-800 md:p-6">
      <FinanceWorkspaceHeader
        title="สรุปปิดร้านประจำวัน"
        description="ตรวจยอดขาย แยกยอดเครดิต และยืนยันว่าเงินที่ควรรับตรงกับเงินจริงโดยไม่ตีความยอดเครดิตเป็นเงินขาด"
        badge={shopSlug ? `Closing · ${shopSlug}` : 'Daily Closing'}
      />

      <FinanceWorkspaceSection title="ช่วงเวลาที่ต้องการตรวจ" description="เลือกวันเดียวกันสำหรับสรุปรายวัน หรือเลือกคนละวันสำหรับสรุปช่วงวันที่">
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
          <label className="text-sm font-black text-slate-700">
            จากวันที่
            <input type="date" className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className="text-sm font-black text-slate-700">
            ถึงวันที่
            <input type="date" className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <button type="button" className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60" onClick={onUseSingleDay} disabled={!!dailyClosingLoading}>
            ดูวันเดียว
          </button>
          <button type="submit" className="min-h-11 rounded-xl bg-teal-700 px-5 text-sm font-black text-white transition hover:bg-teal-800 disabled:opacity-60" disabled={!!dailyClosingLoading}>
            {dailyClosingLoading ? 'กำลังโหลด...' : 'โหลดสรุป'}
          </button>
        </form>
      </FinanceWorkspaceSection>

      {dailyClosingError ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <p className="font-black">ไม่สามารถโหลดข้อมูลสรุปปิดร้านได้</p>
          <p className="mt-1">{String(dailyClosingError)}</p>
        </div>
      ) : null}

      <section className={`rounded-2xl border p-5 ${statusView.className}`}>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-black">{statusView.title}</h2>
            <p className="mt-1 text-sm font-medium">{statusView.text}</p>
          </div>
          <p className="whitespace-nowrap text-sm font-black opacity-80">ช่วง: {rangeLabel}</p>
        </div>
      </section>

      {hasCredit ? (
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          <p className="font-black">พบยอดขายเครดิต / ลูกหนี้จากการขาย</p>
          <p className="mt-1">ยอดเครดิตหรือยอดค้างชำระไม่ถูกนับเป็นเงินขาด แต่จะแสดงเป็นภาระติดตามรับเงิน</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <FinanceMetricCard label="ยอดขายรวม" value={`${fmt(salesTotalAmount)} ฿`} hint="Sale.totalAmount เฉพาะบิลที่ไม่ยกเลิก" tone="info" />
        <FinanceMetricCard label="ยอดเครดิต/ค้างชำระ" value={`${fmt(creditOutstandingAmount)} ฿`} hint="ไม่ถือเป็นเงินขาด" tone={creditOutstandingAmount > 0 ? 'warn' : 'neutral'} />
        <FinanceMetricCard label="ควรรับเงินจริง" value={`${fmt(expectedCashAmount)} ฿`} hint="ยอดขายรวม - ยอดเครดิต/ค้างชำระ" tone="neutral" />
        <FinanceMetricCard label="รับเงินจริง" value={`${fmt(totalCollected)} ฿`} hint="รวมจาก PaymentItem ตามช่องทาง" tone="info" />
        <FinanceMetricCard label="ส่วนต่างเงินจริง" value={`${fmt(differenceAmount)} ฿`} hint="รับเงินจริง - ควรรับเงินจริง" tone={differenceAmount === 0 ? 'info' : 'warn'} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceMetricCard label="จำนวนบิล" value={`${Number(sales.billCount || 0).toLocaleString('th-TH')} บิล`} hint="ตามช่วงวันที่เลือก" />
        <FinanceMetricCard label="บิลเครดิต/ค้าง" value={`${creditBillCount.toLocaleString('th-TH')} บิล`} hint="ยอดที่ต้องติดตามรับเงิน" tone={creditBillCount > 0 ? 'warn' : 'neutral'} />
        <FinanceMetricCard label="ยอดจ่ายแล้วในบิล" value={`${fmt(sales.paidAmount)} ฿`} hint="Sale.paidAmount รวม" tone="info" />
        <FinanceMetricCard label="ลูกหนี้เกิดใหม่" value={`${fmt(receivablesFromTodaySales.amount ?? sales.unpaidAmount)} ฿`} hint="ยอดค้างจากบิลในช่วงวันที่เลือก" tone="warn" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FinanceWorkspaceSection title="แยกช่องทางรับเงิน" description={`เงินรับจริงจาก PaymentItem รวม ${fmt(totalCollected)} ฿`}>
          <PaymentRow label="เงินสด" value={payments.cash} />
          <PaymentRow label="โอน" value={payments.transfer} />
          <PaymentRow label="QR" value={payments.qr} />
          <PaymentRow label="บัตร" value={payments.card} />
          <PaymentRow label="E-Wallet" value={payments.eWallet} />
          <PaymentRow label="เช็ค" value={payments.cheque} helper="แสดงไว้ก่อน แม้ V1 ยังไม่ลงรายละเอียดราชการ" />
          <PaymentRow label="มัดจำที่นำมาใช้" value={payments.deposit} />
          <PaymentRow label="อื่น ๆ" value={payments.other} />
        </FinanceWorkspaceSection>

        <FinanceWorkspaceSection title="สัญญาณการเงิน" description="แสดงเป็น signal ก่อน ไม่เอาไปปนกับยอดขายโดยตรง">
          <div className="space-y-3">
            <SignalRow label="ยอดเครดิตจากการขาย" value={creditOutstandingAmount} helper={`${creditBillCount.toLocaleString('th-TH')} บิล ไม่ถือเป็นส่วนต่างเงินจริง`} tone="warn" />
            <SignalRow label="มัดจำรับเพิ่ม" value={deposits.receivedTodayAmount} helper="CustomerDeposit.createdAt ตามช่วงวันที่เลือก" tone="info" />
            <SignalRow label="รับชำระลูกหนี้" value={customerReceipts.receivedTodayAmount} helper="CustomerReceipt.receivedAt ตามช่วงวันที่เลือก" tone="info" />
            <SignalRow label="คืนของ / คืนเงิน" value={returns?.refundPaidAmount} helper={returns?.enabled ? 'เปิดใช้งานแล้ว' : 'ยังไม่เปิดใช้ใน V1'} />
          </div>
        </FinanceWorkspaceSection>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-medium leading-5 text-slate-500 shadow-sm">
        Runtime Truth: ยอดขายมาจาก Sale, เงินรับจริงมาจาก PaymentItem, ยอดเครดิต/ค้างชำระถูกแยกออกจากส่วนต่างเงินจริงเพื่อไม่ให้ระบบตีความเครดิตเป็นเงินหาย
      </div>
    </div>
  );
};

export default DailyClosingPage;
