import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { useParams } from 'react-router-dom';
import useFinanceStore from '@/features/finance/store/financeStore';
import CustomerCreditTable from '@/features/finance/components/CustomerCreditTable';
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
  if (typeof val === 'bigint') {
    try {
      const n = Number(val);
      return Number.isFinite(n) ? n : 0;
    } catch (_) {
      return 0;
    }
  }
  if (typeof val === 'string') {
    const s = val.replace(/,/g, '').replace(/[^0-9.-]/g, '').trim();
    if (!s) return 0;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  try {
    if (typeof val === 'object') {
      if (typeof val.toNumber === 'function') {
        const n = val.toNumber();
        return Number.isFinite(n) ? n : 0;
      }
      if (typeof val.toString === 'function') {
        const s = String(val.toString()).replace(/,/g, '').replace(/[^0-9.-]/g, '').trim();
        if (!s) return 0;
        const n = Number(s);
        return Number.isFinite(n) ? n : 0;
      }
    }
  } catch (_) {}
  return 0;
};

const fmt = (n) => {
  const x = parseMoney(n);
  return x.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getDefaultRange90 = () => {
  try {
    const today = new Date();
    const d90 = new Date(today);
    d90.setDate(today.getDate() - 90);
    return { fromDate: toISODate(d90), toDate: toISODate(today) };
  } catch (_) {
    return { fromDate: '', toDate: '' };
  }
};

const useFinanceSlice = (selector) => {
  const subscribe = useFinanceStore.subscribe;
  const getSnapshot = () => selector(useFinanceStore.getState());
  const getServerSnapshot = getSnapshot;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

const CustomerCreditPage = () => {
  const { shopSlug } = useParams();
  const defaults = useMemo(() => getDefaultRange90(), []);

  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);

  const customerCreditSummary = useFinanceSlice((s) => s.customerCreditSummary);
  const customerCreditRows = useFinanceSlice((s) => s.customerCreditRows);
  const customerCreditLoading = useFinanceSlice((s) => s.customerCreditLoading);
  const customerCreditError = useFinanceSlice((s) => s.customerCreditError);

  const safeRows = Array.isArray(customerCreditRows) ? customerCreditRows : [];

  const computedSummary = useMemo(() => {
    const src = customerCreditSummary && typeof customerCreditSummary === 'object' ? customerCreditSummary : null;
    const s = src?.summary && typeof src.summary === 'object' ? src.summary : src;

    const computeFromRows = () => {
      const creditTotal = safeRows.reduce((sum, r) => {
        const v =
          r?.outstandingCredit ??
          r?.outstandingAmount ??
          r?.outstanding ??
          r?.totalOutstanding ??
          r?.outstandingTotal ??
          r?.creditAmount ??
          r?.creditBalance ??
          r?.balance ??
          r?.remainingBalance ??
          r?.outstandingBalance ??
          r?.arBalance ??
          r?.netOutstanding ??
          r?.amountOutstanding ??
          r?.totals?.outstanding ??
          r?.totals?.totalOutstanding ??
          r?.summary?.outstanding ??
          r?.summary?.totalOutstanding;
        return sum + parseMoney(v);
      }, 0);

      const seen = new Set();
      for (const r of safeRows) {
        const cid = r?.customerId ?? r?.customer?.id ?? r?.id ?? null;
        if (cid != null) seen.add(String(cid));
      }

      const limitTotal = safeRows.reduce((sum, r) => {
        const v =
          r?.creditLimit ??
          r?.limitAmount ??
          r?.creditLimitAmount ??
          r?.totalCreditLimit ??
          r?.limits?.total ??
          r?.summary?.creditLimit;
        return sum + parseMoney(v);
      }, 0);

      return { creditTotal, customerCount: seen.size || safeRows.length, limitTotal };
    };

    if (s && typeof s === 'object') {
      const creditTotal = parseMoney(
        s.totalOutstanding ??
          s.outstandingTotal ??
          s.outstanding ??
          s.outstandingBalance ??
          s.totalOutstandingAmount ??
          s.totalOutstandingCredit ??
          s.creditTotal ??
          s.totalCredit ??
          s.outstandingCreditTotal ??
          s.arTotal ??
          s.netOutstanding
      );
      const customerCount = Number(s.customerCount ?? s.totalCustomers ?? s.customers ?? safeRows.length) || 0;
      const limitTotal = parseMoney(
        s.totalCreditLimit ??
          s.creditLimitTotal ??
          s.limitTotal ??
          s.totalLimit ??
          s.totalLimitAmount ??
          s.creditLimitSum
      );

      if (creditTotal <= 0 && safeRows.length) {
        const fromRows = computeFromRows();
        if (fromRows.creditTotal > 0) return fromRows;
        return {
          creditTotal,
          customerCount: fromRows.customerCount || customerCount,
          limitTotal: limitTotal || fromRows.limitTotal,
        };
      }

      return { creditTotal, customerCount, limitTotal };
    }

    return computeFromRows();
  }, [customerCreditSummary, safeRows]);

  const buildParams = useCallback(() => ({
    keyword: keyword.trim() || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  }), [keyword, fromDate, toDate]);

  const reload = useCallback(async () => {
    try {
      if (import.meta?.env?.DEV) {
        // eslint-disable-next-line no-console
        console.log('[CustomerCreditPage] reload()', buildParams());
      }
    } catch (_) {}

    const params = buildParams();
    const st = useFinanceStore.getState();

    if (typeof st.resetCustomerCreditErrorAction === 'function') st.resetCustomerCreditErrorAction();

    if (typeof st.fetchCustomerCreditAction === 'function') {
      await st.fetchCustomerCreditAction(params);
      return;
    }

    const jobs = [];
    if (typeof st.fetchCustomerCreditSummaryAction === 'function') jobs.push(st.fetchCustomerCreditSummaryAction(params));
    if (typeof st.fetchCustomerCreditRowsAction === 'function') jobs.push(st.fetchCustomerCreditRowsAction(params));
    if (jobs.length === 0) return;
    await Promise.all(jobs);
  }, [buildParams]);

  const onApplyFilters = useCallback(async (e) => {
    e?.preventDefault?.();
    await reload();
  }, [reload]);

  const onClearFilters = useCallback(() => {
    setKeyword('');
    const d = getDefaultRange90();
    setFromDate(d.fromDate);
    setToDate(d.toDate);
  }, []);

  const missingWiring = useMemo(() => {
    const st = useFinanceStore.getState();
    const hasAnyAction =
      typeof st.fetchCustomerCreditAction === 'function' ||
      typeof st.fetchCustomerCreditSummaryAction === 'function' ||
      typeof st.fetchCustomerCreditRowsAction === 'function';

    return !hasAnyAction && !safeRows.length && !customerCreditSummary;
  }, [safeRows.length, customerCreditSummary]);

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-800 md:p-6">
      <FinanceWorkspaceHeader
        title="เครดิตลูกค้า"
        description="ตรวจยอดเครดิตคงค้างและวงเงินรายลูกค้า โดยคง subscription และ fallback authority เดิมของ Finance Store"
        badge={shopSlug ? `Credit · ${shopSlug}` : 'Customer Credit'}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceMetricCard label="ยอดเครดิตคงค้างรวม" value={`${fmt(computedSummary.creditTotal)} ฿`} hint="รวมยอดค้างทั้งหมดของลูกค้า" tone="danger" />
        <FinanceMetricCard label="จำนวนลูกค้าที่มีเครดิต" value={`${computedSummary.customerCount.toLocaleString('th-TH')} ราย`} hint="นับแบบ best-effort จากผลลัพธ์" tone="info" />
        <FinanceMetricCard label="วงเงินรวม" value={computedSummary.limitTotal ? `${fmt(computedSummary.limitTotal)} ฿` : '—'} hint="แสดงเมื่อมีข้อมูลวงเงิน" tone="neutral" />
      </div>

      {customerCreditError ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <p className="font-black">ไม่สามารถโหลดข้อมูลเครดิตลูกค้าได้</p>
          <p className="mt-1">{String(customerCreditError)}</p>
        </div>
      ) : null}

      {missingWiring ? (
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          <p className="font-black">ยังไม่ได้เชื่อม store action สำหรับเครดิตลูกค้า</p>
          <p className="mt-1">โปรดเพิ่ม action ใน <span className="font-mono">financeStore.js</span> เช่น <span className="font-mono">fetchCustomerCreditAction</span></p>
        </div>
      ) : null}

      <FinanceWorkspaceSection title="ค้นหาเครดิตลูกค้า" description="หน้านี้คง behavior เดิม: ไม่ auto-load และโหลดเมื่อกดค้นหาเท่านั้น">
        <form onSubmit={onApplyFilters} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-sm font-black text-slate-700">
            ค้นหา
            <input
              type="search"
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              placeholder="ชื่อลูกค้า / หน่วยงาน / เบอร์โทร"
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

          <div className="flex flex-wrap gap-3 md:col-span-3">
            <button type="submit" className="min-h-11 rounded-xl bg-teal-700 px-5 text-sm font-black text-white transition hover:bg-teal-800 disabled:opacity-60" disabled={!!customerCreditLoading}>
              {customerCreditLoading ? 'กำลังโหลด...' : 'ค้นหา'}
            </button>
            <button type="button" className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60" onClick={onClearFilters} disabled={!!customerCreditLoading}>
              ล้างตัวกรอง
            </button>
          </div>
        </form>
      </FinanceWorkspaceSection>

      <FinanceWorkspaceSection title="รายการเครดิตลูกค้า" description={`ทั้งหมด ${safeRows.length.toLocaleString('th-TH')} รายการ`}>
        <CustomerCreditTable rows={safeRows} loading={!!customerCreditLoading} />
        <p className="mt-3 text-xs font-medium text-slate-500">* ฐานข้อมูลนี้รองรับการต่อยอด Credit Control, Aging และ Customer Detail</p>
      </FinanceWorkspaceSection>
    </div>
  );
};

export default CustomerCreditPage;
