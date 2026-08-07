import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFinanceStore from '@/features/finance/store/financeStore';
import AccountsReceivableTable from '@/features/finance/components/AccountsReceivableTable';
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

function parseMoney(val) {
  if (val == null) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'string') {
    const s = val.replace(/,/g, '').trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  try {
    if (typeof val === 'object' && typeof val.toNumber === 'function') {
      const n = val.toNumber();
      return Number.isFinite(n) ? n : 0;
    }
  } catch (_) {}
  return 0;
}

const fmt = (n) => {
  const x = parseMoney(n);
  return x.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const AccountsReceivablePage = () => {
  const { shopSlug } = useParams();

  const arSummary = useFinanceStore((s) => s.arSummary);
  const arRows = useFinanceStore((s) => s.arRows);
  const arLoading = useFinanceStore((s) => s.arLoading);
  const arError = useFinanceStore((s) => s.arError);

  const fetchAccountsReceivableAction = useFinanceStore((s) => s.fetchAccountsReceivableAction);
  const fetchAccountsReceivableSummaryAction = useFinanceStore((s) => s.fetchAccountsReceivableSummaryAction);
  const fetchAccountsReceivableRowsAction = useFinanceStore((s) => s.fetchAccountsReceivableRowsAction);
  const resetArErrorAction = useFinanceStore((s) => s.resetArErrorAction);

  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    try {
      const today = new Date();
      const d30 = new Date(today);
      d30.setDate(today.getDate() - 30);
      return toISODate(d30);
    } catch (_) {
      return '';
    }
  });
  const [toDate, setToDate] = useState(() => {
    try {
      return toISODate(new Date());
    } catch (_) {
      return '';
    }
  });
  const [status, setStatus] = useState('OPEN');
  const didInitRef = useRef(false);
  const safeRows = Array.isArray(arRows) ? arRows : [];

  const computedSummary = useMemo(() => {
    const computeFromRows = () => {
      const invoiceCount = safeRows.length;
      const outstandingTotal = safeRows.reduce((sum, r) => {
        const total = parseMoney(r.totalAmount ?? r.total);
        const paid = parseMoney(r.paidAmount ?? r.paid);
        const outstanding = Math.max(0, Number((total - paid).toFixed(2)));
        return sum + outstanding;
      }, 0);

      const seen = new Set();
      for (const r of safeRows) {
        const cid = r.customerId ?? r.customer?.id ?? null;
        if (cid != null) seen.add(String(cid));
      }

      return { outstandingTotal, invoiceCount, customerCount: seen.size };
    };

    if (arSummary && typeof arSummary === 'object') {
      const outstandingTotal = parseMoney(arSummary.outstandingTotal ?? arSummary.totalOutstanding);
      const invoiceCount = Number(arSummary.invoiceCount ?? arSummary.totalBills ?? safeRows.length) || 0;
      const customerCount = Number(arSummary.customerCount ?? arSummary.totalCustomers ?? 0) || 0;

      if (safeRows.length > 0 && outstandingTotal <= 0) {
        const rowsComputed = computeFromRows();
        if (rowsComputed.outstandingTotal > 0) return rowsComputed;
      }

      return { outstandingTotal, invoiceCount, customerCount };
    }

    return computeFromRows();
  }, [arSummary, safeRows]);

  const buildParams = useCallback(() => {
    return {
      keyword: keyword.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      status: status || undefined,
    };
  }, [keyword, fromDate, toDate, status]);

  const reload = useCallback(async () => {
    const params = buildParams();

    if (typeof fetchAccountsReceivableAction === 'function') {
      await fetchAccountsReceivableAction(params);
      return;
    }

    const jobs = [];
    if (typeof fetchAccountsReceivableSummaryAction === 'function') jobs.push(fetchAccountsReceivableSummaryAction(params));
    if (typeof fetchAccountsReceivableRowsAction === 'function') jobs.push(fetchAccountsReceivableRowsAction(params));

    if (jobs.length === 0) {
      if (typeof resetArErrorAction === 'function') resetArErrorAction();
      return;
    }

    await Promise.all(jobs);
  }, [buildParams, fetchAccountsReceivableAction, fetchAccountsReceivableSummaryAction, fetchAccountsReceivableRowsAction, resetArErrorAction]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    void reload();
  }, [reload]);

  const onApplyFilters = useCallback(async (e) => {
    e?.preventDefault?.();
    if (typeof resetArErrorAction === 'function') resetArErrorAction();
    await reload();
  }, [reload, resetArErrorAction]);

  const onClearFilters = useCallback(async () => {
    if (typeof resetArErrorAction === 'function') resetArErrorAction();
    setKeyword('');
    setStatus('OPEN');

    try {
      const today = new Date();
      const d30 = new Date(today);
      d30.setDate(today.getDate() - 30);
      setToDate(toISODate(today));
      setFromDate(toISODate(d30));
    } catch (_) {
      setFromDate('');
      setToDate('');
    }

    await reload();
  }, [reload, resetArErrorAction]);

  const missingWiring = useMemo(() => {
    const hasAnyAction =
      typeof fetchAccountsReceivableAction === 'function' ||
      typeof fetchAccountsReceivableSummaryAction === 'function' ||
      typeof fetchAccountsReceivableRowsAction === 'function';

    return !hasAnyAction && !safeRows.length && !arSummary;
  }, [fetchAccountsReceivableAction, fetchAccountsReceivableSummaryAction, fetchAccountsReceivableRowsAction, safeRows.length, arSummary]);

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-800 md:p-6">
      <FinanceWorkspaceHeader
        title="ลูกหนี้และยอดค้าง"
        description="ติดตามใบขายที่ยังชำระไม่ครบ ค้นหาตามลูกค้า เลขบิล และช่วงวันที่ โดยคงขอบเขตร้านปัจจุบัน"
        badge={shopSlug ? `AR · ${shopSlug}` : 'Accounts Receivable'}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceMetricCard label="ยอดค้างรวม" value={`${fmt(computedSummary.outstandingTotal)} ฿`} hint="คำนวณจากยอดสุทธิ - จ่ายแล้ว" tone="danger" />
        <FinanceMetricCard label="จำนวนบิลค้าง" value={`${computedSummary.invoiceCount.toLocaleString('th-TH')} บิล`} hint="จำนวนใบขายที่ยังไม่ชำระครบ" tone="warn" />
        <FinanceMetricCard label="จำนวนลูกค้าที่ค้าง" value={`${computedSummary.customerCount.toLocaleString('th-TH')} ราย`} hint="นับจาก customerId ที่พบในผลลัพธ์" tone="info" />
      </div>

      {arError ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <p className="font-black">ไม่สามารถโหลดข้อมูลลูกหนี้ได้</p>
          <p className="mt-1">{String(arError)}</p>
        </div>
      ) : null}

      {missingWiring ? (
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          <p className="font-black">ยังไม่ได้เชื่อม store action สำหรับลูกหนี้</p>
          <p className="mt-1">โปรดเพิ่ม action ใน <span className="font-mono">financeStore.js</span> เช่น <span className="font-mono">fetchAccountsReceivableAction</span></p>
        </div>
      ) : null}

      <FinanceWorkspaceSection title="ค้นหาและกรองลูกหนี้" description="ค่าเริ่มต้นแสดงรายการค้างชำระในช่วง 30 วันล่าสุด">
        <form onSubmit={onApplyFilters} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-black text-slate-700">
            ค้นหา
            <input
              type="search"
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              placeholder="เลขบิล / ชื่อลูกค้า / เบอร์โทร"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>
          <label className="text-sm font-black text-slate-700">
            ตั้งแต่
            <input type="date" className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className="text-sm font-black text-slate-700">
            ถึง
            <input type="date" className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <label className="text-sm font-black text-slate-700">
            สถานะ
            <select className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold focus:border-teal-600 focus:ring-2 focus:ring-teal-100" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="OPEN">ค้างชำระ (รวมค้างบางส่วน)</option>
              <option value="UNPAID">ค้างทั้งหมด</option>
              <option value="PARTIALLY_PAID">ค้างบางส่วน</option>
              <option value="ALL">ทั้งหมด</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-4">
            <button type="submit" className="min-h-11 rounded-xl bg-teal-700 px-5 text-sm font-black text-white transition hover:bg-teal-800 disabled:opacity-60" disabled={!!arLoading}>
              {arLoading ? 'กำลังโหลด...' : 'ค้นหา'}
            </button>
            <button type="button" className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60" onClick={onClearFilters} disabled={!!arLoading}>
              ล้างตัวกรอง
            </button>
          </div>
        </form>
      </FinanceWorkspaceSection>

      <FinanceWorkspaceSection title="รายการบิลค้าง" description={`ทั้งหมด ${safeRows.length.toLocaleString('th-TH')} รายการ`}>
        <AccountsReceivableTable rows={safeRows} loading={!!arLoading} />
        <p className="mt-3 text-xs font-medium text-slate-500">* ยอดค้างคำนวณจาก <span className="font-mono">totalAmount - paidAmount</span> และไม่อนุญาตให้ติดลบ</p>
      </FinanceWorkspaceSection>
    </div>
  );
};

export default AccountsReceivablePage;
