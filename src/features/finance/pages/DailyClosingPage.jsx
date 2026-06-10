// 📁 FILE: src/features/finance/pages/DailyClosingPage.jsx
// ✅ Daily Closing Confidence Surface V2.1 — Credit-aware + Date Range

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useFinanceStore from '@/features/finance/store/financeStore';

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

const StatCard = ({ label, value, suffix = '฿', tone = 'slate', helper }) => {
  const toneClass = {
    slate: 'text-slate-900',
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700',
    orange: 'text-orange-700',
    purple: 'text-purple-700',
    amber: 'text-amber-700',
  }[tone] || 'text-slate-900';

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-3xl font-extrabold mt-2 ${toneClass}`}>
        {fmt(value)} {suffix}
      </div>
      {helper ? <div className="text-xs text-gray-400 mt-1">{helper}</div> : null}
    </div>
  );
};

const CountCard = ({ label, value, suffix = 'บิล', tone = 'purple', helper }) => {
  const toneClass = {
    slate: 'text-slate-900',
    blue: 'text-blue-700',
    green: 'text-green-700',
    orange: 'text-orange-700',
    purple: 'text-purple-700',
  }[tone] || 'text-slate-900';

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-3xl font-extrabold mt-2 ${toneClass}`}>
        {Number(value || 0).toLocaleString('th-TH')} {suffix}
      </div>
      {helper ? <div className="text-xs text-gray-400 mt-1">{helper}</div> : null}
    </div>
  );
};

const PaymentRow = ({ label, value, helper }) => (
  <div className="flex items-start justify-between gap-3 border-b last:border-b-0 py-3">
    <div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {helper ? <div className="text-xs text-gray-400 mt-0.5">{helper}</div> : null}
    </div>
    <div className="font-mono font-semibold text-gray-900 whitespace-nowrap">{fmt(value)} ฿</div>
  </div>
);

const SignalRow = ({ label, value, helper, tone = 'slate' }) => {
  const toneClass = {
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
    blue: 'bg-blue-50 border-blue-100 text-blue-900',
    purple: 'bg-purple-50 border-purple-100 text-purple-900',
    amber: 'bg-amber-50 border-amber-100 text-amber-900',
    green: 'bg-green-50 border-green-100 text-green-900',
  }[tone] || 'bg-slate-50 border-slate-200 text-slate-900';

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${toneClass}`}>
      <div>
        <div className="font-semibold">{label}</div>
        {helper ? <div className="text-xs opacity-80 mt-0.5">{helper}</div> : null}
      </div>
      <div className="font-mono font-bold whitespace-nowrap">{fmt(value)} ฿</div>
    </div>
  );
};

const DailyClosingPage = () => {
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

  const onSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (typeof resetDailyClosingErrorAction === 'function') resetDailyClosingErrorAction();
      await reload();
    },
    [reload, resetDailyClosingErrorAction]
  );

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
        className: 'bg-slate-50 border-slate-200 text-slate-700',
      };
    }

    if (status === 'BALANCED' || differenceAmount === 0) {
      return {
        title: isRangeMode ? '✅ สรุปช่วงวันที่ตรง' : '✅ ปิดร้านได้อย่างมั่นใจ',
        text: hasCredit
          ? `เงินรับจริงตรงกับยอดที่ควรได้รับ หลังแยกยอดเครดิต ${fmt(creditOutstandingAmount)} ฿ ออกแล้ว`
          : 'เงินรับจริงตรงกับยอดที่ควรได้รับ',
        className: 'bg-green-50 border-green-200 text-green-800',
      };
    }

    return {
      title: `⚠️ พบส่วนต่างเงินจริง ${fmt(differenceAmount)} ฿`,
      text:
        differenceAmount > 0
          ? 'เงินรับจริงมากกว่ายอดที่ควรได้รับ กรุณาตรวจสอบรายการรับเงิน'
          : 'เงินรับจริงน้อยกว่ายอดที่ควรได้รับ กรุณาตรวจสอบเงินสด/โอน/QR/บัตร',
      className: 'bg-orange-50 border-orange-200 text-orange-800',
    };
  }, [status, differenceAmount, hasCredit, creditOutstandingAmount, isRangeMode]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">สรุปปิดร้านประจำวัน</h1>
          <p className="text-sm text-gray-600 mt-1">
            ตรวจยอดขาย แยกยอดเครดิต และยืนยันว่าเงินที่ควรรับตรงกับเงินจริง
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 md:items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">จากวันที่</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ถึงวันที่</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-60"
              onClick={onUseSingleDay}
              disabled={!!dailyClosingLoading}
            >
              ดูวันเดียว
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              disabled={!!dailyClosingLoading}
            >
              {dailyClosingLoading ? 'กำลังโหลด...' : 'โหลดสรุป'}
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-3">
            ถ้าเลือกวันเดียวกัน = สรุปรายวัน • ถ้าเลือกคนละวัน = สรุปช่วงวันที่
          </div>
        </form>

        {dailyClosingError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <div className="font-semibold">ไม่สามารถโหลดข้อมูลสรุปปิดร้านได้</div>
            <div className="text-sm mt-1">{String(dailyClosingError)}</div>
          </div>
        ) : null}

        <div className={`border rounded-xl p-5 ${statusView.className}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div>
              <div className="text-xl font-bold">{statusView.title}</div>
              <div className="text-sm mt-1">{statusView.text}</div>
            </div>
            <div className="text-sm font-semibold opacity-80 whitespace-nowrap">
              ช่วง: {rangeLabel}
            </div>
          </div>
        </div>

        {hasCredit ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
            <div className="font-bold">ℹ️ พบยอดขายเครดิต / ลูกหนี้จากการขาย</div>
            <div className="text-sm mt-1">
              ยอดเครดิตหรือยอดค้างชำระไม่ถูกนับเป็นเงินขาด แต่จะแสดงเป็นภาระติดตามรับเงิน
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard label="ยอดขายรวม" value={salesTotalAmount} tone="blue" helper="Sale.totalAmount เฉพาะบิลที่ไม่ยกเลิก" />
          <StatCard label="ยอดเครดิต/ค้างชำระ" value={creditOutstandingAmount} tone={creditOutstandingAmount > 0 ? 'amber' : 'slate'} helper="ไม่ถือเป็นเงินขาด" />
          <StatCard label="ควรรับเงินจริง" value={expectedCashAmount} tone="purple" helper="ยอดขายรวม - ยอดเครดิต/ค้างชำระ" />
          <StatCard label="รับเงินจริง" value={totalCollected} tone="green" helper="รวมจาก PaymentItem ตามช่องทาง" />
          <StatCard label="ส่วนต่างเงินจริง" value={differenceAmount} tone={differenceAmount === 0 ? 'green' : 'orange'} helper="รับเงินจริง - ควรรับเงินจริง" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CountCard label="จำนวนบิล" value={sales.billCount} helper="ตามช่วงวันที่เลือก" />
          <CountCard label="บิลเครดิต/ค้าง" value={creditBillCount} tone="orange" helper="ยอดที่ต้องติดตามรับเงิน" />
          <StatCard label="ยอดจ่ายแล้วในบิล" value={sales.paidAmount} tone="green" helper="Sale.paidAmount รวม" />
          <StatCard label="ลูกหนี้เกิดใหม่" value={receivablesFromTodaySales.amount ?? sales.unpaidAmount} tone="orange" helper="ยอดค้างจากบิลในช่วงวันที่เลือก" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800">แยกช่องทางรับเงิน</h2>
                <p className="text-xs text-gray-500">เงินรับจริงจาก PaymentItem</p>
              </div>
              <div className="text-sm font-bold text-green-700">{fmt(totalCollected)} ฿</div>
            </div>

            <div>
              <PaymentRow label="เงินสด" value={payments.cash} />
              <PaymentRow label="โอน" value={payments.transfer} />
              <PaymentRow label="QR" value={payments.qr} />
              <PaymentRow label="บัตร" value={payments.card} />
              <PaymentRow label="E-Wallet" value={payments.eWallet} />
              <PaymentRow label="เช็ค" value={payments.cheque} helper="แสดงไว้ก่อน แม้ V1 ยังไม่ลงรายละเอียดราชการ" />
              <PaymentRow label="มัดจำที่นำมาใช้" value={payments.deposit} />
              <PaymentRow label="อื่น ๆ" value={payments.other} />
            </div>
          </section>

          <section className="bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">สัญญาณการเงิน</h2>
            <p className="text-xs text-gray-500 mb-3">แสดงเป็น signal ก่อน ไม่เอาไปปนกับยอดขายโดยตรง</p>

            <div className="space-y-3">
              <SignalRow label="ยอดเครดิตจากการขาย" value={creditOutstandingAmount} helper={`${creditBillCount.toLocaleString('th-TH')} บิล ไม่ถือเป็นส่วนต่างเงินจริง`} tone="amber" />
              <SignalRow label="มัดจำรับเพิ่ม" value={deposits.receivedTodayAmount} helper="CustomerDeposit.createdAt ตามช่วงวันที่เลือก" tone="blue" />
              <SignalRow label="รับชำระลูกหนี้" value={customerReceipts.receivedTodayAmount} helper="CustomerReceipt.receivedAt ตามช่วงวันที่เลือก" tone="purple" />
              <SignalRow label="คืนของ / คืนเงิน" value={returns?.refundPaidAmount} helper={returns?.enabled ? 'เปิดใช้งานแล้ว' : 'ยังไม่เปิดใช้ใน V1'} tone="slate" />
            </div>
          </section>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm text-xs text-gray-500">
          Runtime Truth: ยอดขายมาจาก Sale, เงินรับจริงมาจาก PaymentItem, ยอดเครดิต/ค้างชำระถูกแยกออกจากส่วนต่างเงินจริงเพื่อไม่ให้ระบบตีความเครดิตเป็นเงินหาย
        </div>
      </div>
    </div>
  );
};

export default DailyClosingPage;
