

// 📁 FILE: src/features/finance/pages/CustomerCreditPage.jsx
// ✅ Hard-stable: useSyncExternalStore + store API (prevents Zustand selector rerender loop)
// ✅ Production-grade (minimal disruption)
// - Store-first (no direct API calls)
// - UI-based alerts only (no dialog)
// - No auto-load on mount (press Search)

import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

import useFinanceStore from '@/features/finance/store/financeStore';
import CustomerCreditTable from '@/features/finance/components/CustomerCreditTable';

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
    // ✅ Robust sanitize: handle commas, currency symbols, spaces
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
  } catch (_) {
    // ignore
  }
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

// ✅ Hard-stable selector hook (no zustand hook usage)
const useFinanceSlice = (selector) => {
  const subscribe = useFinanceStore.subscribe;
  const getSnapshot = () => selector(useFinanceStore.getState());
  const getServerSnapshot = getSnapshot;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

const CustomerCreditPage = () => {
  const defaults = useMemo(() => getDefaultRange90(), []);

  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);

  // ✅ slices (hard-stable)
  const customerCreditSummary = useFinanceSlice((s) => s.customerCreditSummary);
  const customerCreditRows = useFinanceSlice((s) => s.customerCreditRows);
  const customerCreditLoading = useFinanceSlice((s) => s.customerCreditLoading);
  const customerCreditError = useFinanceSlice((s) => s.customerCreditError);

  const safeRows = Array.isArray(customerCreditRows) ? customerCreditRows : [];

  const computedSummary = useMemo(() => {
    // ✅ BE may return either:
    //  A) { success:true, summary:{ ... } }
    //  B) { ... }
    //  C) legacy shapes
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

      // limitTotal is optional; best-effort
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

      return {
        creditTotal,
        customerCount: seen.size || safeRows.length,
        limitTotal,
      };
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

      // Prefer "totalCreditLimit"; fallback to other known keys
      const limitTotal = parseMoney(
        s.totalCreditLimit ??
          s.creditLimitTotal ??
          s.limitTotal ??
          s.totalLimit ??
          s.totalLimitAmount ??
          s.creditLimitSum
      );

      // ✅ If summary looks empty but rows have data -> fallback (AR-style)
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

    // Fallback: compute from rows
    return computeFromRows();
  }, [customerCreditSummary, safeRows]);

  const buildParams = useCallback(() => {
    return {
      keyword: keyword.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    };
  }, [keyword, fromDate, toDate]);

  const reload = useCallback(async () => {
    // ✅ DEV-only trace (verify click -> action)
    try {
      if (import.meta?.env?.DEV) {
        // eslint-disable-next-line no-console
        console.log('[CustomerCreditPage] reload()', buildParams());
      }
    } catch (_) {
      // ignore
    }
    const params = buildParams();

    // ✅ pull actions from getState() (no subscription)
    const st = useFinanceStore.getState();

    if (typeof st.resetCustomerCreditErrorAction === 'function') {
      st.resetCustomerCreditErrorAction();
    }

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

  const onApplyFilters = useCallback(
    async (e) => {
      e?.preventDefault?.();
      await reload();
    },
    [reload]
  );

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">เครดิตลูกค้า (Customer Credit)</h1>
          <p className="text-sm text-gray-600 mt-1">ภาพรวมยอดเครดิตคงค้างรายลูกค้า (ฐานทำ Credit Control / Aging ต่อได้)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="text-sm text-gray-500">ยอดเครดิตคงค้างรวม</div>
            <div className="text-3xl font-extrabold text-red-600 mt-2">{fmt(computedSummary.creditTotal)} ฿</div>
            <div className="text-xs text-gray-400 mt-1">รวมยอดค้างทั้งหมดของลูกค้า</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="text-sm text-gray-500">จำนวนลูกค้าที่มีเครดิต</div>
            <div className="text-3xl font-extrabold text-purple-600 mt-2">
              {computedSummary.customerCount.toLocaleString('th-TH')} ราย
            </div>
            <div className="text-xs text-gray-400 mt-1">นับแบบ best-effort</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="text-sm text-gray-500">วงเงินรวม</div>
            <div className="text-3xl font-extrabold text-blue-700 mt-2">
              {computedSummary.limitTotal ? `${fmt(computedSummary.limitTotal)} ฿` : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">แสดงเมื่อมีข้อมูลวงเงิน</div>
          </div>
        </div>

        {customerCreditError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <div className="font-semibold">ไม่สามารถโหลดข้อมูลเครดิตลูกค้าได้</div>
            <div className="text-sm mt-1">{String(customerCreditError)}</div>
          </div>
        ) : null}

        {missingWiring ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-900">
            <div className="font-semibold">ยังไม่ได้เชื่อม store action สำหรับเครดิตลูกค้า</div>
            <div className="text-sm mt-1">
              โปรดเพิ่ม action ใน <span className="font-mono">financeStore.js</span> เช่น{' '}
              <span className="font-mono">fetchCustomerCreditAction</span>
            </div>
          </div>
        ) : null}

        <form onSubmit={onApplyFilters} className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ค้นหา</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="ชื่อลูกค้า / หน่วยงาน / เบอร์โทร"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ตั้งแต่</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ถึง</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="submit"$1
            >
              {customerCreditLoading ? 'กำลังโหลด...' : 'ค้นหา'}
            </button>

            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-200 transition"
              onClick={onClearFilters}
              disabled={!!customerCreditLoading}
            >
              ล้างตัวกรอง
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-3">
            * หน้านี้ไม่ auto-load เพื่อความนิ่ง (กด “ค้นหา” เพื่อโหลดข้อมูล)
          </div>
        </form>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm font-semibold text-gray-700">รายการเครดิตลูกค้า</div>
            <div className="text-xs text-gray-500">ทั้งหมด {safeRows.length.toLocaleString('th-TH')} รายการ</div>
          </div>

          <CustomerCreditTable rows={safeRows} loading={!!customerCreditLoading} />

          <div className="text-xs text-gray-500 mt-3">* ฐานสำหรับทำ Credit Control, Aging และ Customer Detail ต่อไป</div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCreditPage;








