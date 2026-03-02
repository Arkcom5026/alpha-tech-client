





// 📁 FILE: src/features/finance/pages/AccountsReceivablePage.jsx
// ✅ Production-grade (minimal disruption)
// - Store-first (no direct API calls)
// - UI-based alerts only (no dialog)
// - Defensive rendering (handles missing store fields gracefully)

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useFinanceStore from '@/features/finance/store/financeStore';


import AccountsReceivableTable from '@/features/finance/components/AccountsReceivableTable';

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
  // Prisma Decimal or similar
  try {
    if (typeof val === 'object' && typeof val.toNumber === 'function') {
      const n = val.toNumber();
      return Number.isFinite(n) ? n : 0;
    }
  } catch (_) {
    // ignore
  }
  return 0;
}

const fmt = (n) => {
  const x = parseMoney(n);
  return x.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const AccountsReceivablePage = () => {
  // ✅ Select store fields individually to avoid unstable object selectors
  const arSummary = useFinanceStore((s) => s.arSummary);
  const arRows = useFinanceStore((s) => s.arRows);
  const arLoading = useFinanceStore((s) => s.arLoading);
  const arError = useFinanceStore((s) => s.arError);

  const fetchAccountsReceivableAction = useFinanceStore((s) => s.fetchAccountsReceivableAction);
  const fetchAccountsReceivableSummaryAction = useFinanceStore((s) => s.fetchAccountsReceivableSummaryAction);
  const fetchAccountsReceivableRowsAction = useFinanceStore((s) => s.fetchAccountsReceivableRowsAction);
  const resetArErrorAction = useFinanceStore((s) => s.resetArErrorAction);

  // ✅ Filters (minimal)
  const [keyword, setKeyword] = useState('');

  // ✅ Initialize default date range (last 30 days) without a setState effect
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

  const [status, setStatus] = useState('OPEN'); // OPEN = UNPAID + PARTIALLY_PAID

  // ✅ StrictMode guard (dev)
  const didInitRef = useRef(false);

  const safeRows = Array.isArray(arRows) ? arRows : [];

  const computedSummary = useMemo(() => {
    // Prefer store summary if provided; but if it looks empty while rows have data,
    // fallback to computing from rows (prevents misleading 0.00 on cards)

    const computeFromRows = () => {
      const invoiceCount = safeRows.length;
      const outstandingTotal = safeRows.reduce((sum, r) => {
        const total = parseMoney(r.totalAmount ?? r.total);
        const paid = parseMoney(r.paidAmount ?? r.paid);
        const outstanding = Math.max(0, Number((total - paid).toFixed(2)));
        return sum + outstanding;
      }, 0);

      // Best-effort distinct customers
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

      // If summary is zero-ish but rows clearly have outstanding, trust rows.
      if (safeRows.length > 0 && outstandingTotal <= 0) {
        const rowsComputed = computeFromRows();
        if (rowsComputed.outstandingTotal > 0) return rowsComputed;
      }

      return { outstandingTotal, invoiceCount, customerCount };
    }

    return computeFromRows();
  }, [arSummary, safeRows]);

  const buildParams = useCallback(() => {
    const params = {
      keyword: keyword.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      status: status || undefined,
    };

    // If only one side of date range is set, keep it — BE should handle gracefully.
    return params;
  }, [keyword, fromDate, toDate, status]);

  const reload = useCallback(async () => {
    const params = buildParams();

    // ✅ prefer combined action if exists
    if (typeof fetchAccountsReceivableAction === 'function') {
      await fetchAccountsReceivableAction(params);
      return;
    }

    // ✅ otherwise call split actions (summary + rows) if available
    const jobs = [];
    if (typeof fetchAccountsReceivableSummaryAction === 'function') jobs.push(fetchAccountsReceivableSummaryAction(params));
    if (typeof fetchAccountsReceivableRowsAction === 'function') jobs.push(fetchAccountsReceivableRowsAction(params));

    if (jobs.length === 0) {
      // No action wired yet → show UI error (production-friendly)
      if (typeof resetArErrorAction === 'function') resetArErrorAction();
      return;
    }

    await Promise.all(jobs);
  }, [buildParams, fetchAccountsReceivableAction, fetchAccountsReceivableSummaryAction, fetchAccountsReceivableRowsAction, resetArErrorAction]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    // ✅ Auto-load once on mount (safe with StrictMode guard)
    // eslint-disable-next-line no-void
    void reload();
  }, [reload]);

  const onApplyFilters = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (typeof resetArErrorAction === 'function') resetArErrorAction();
      await reload();
    },
    [reload, resetArErrorAction]
  );

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

    // if no action and no rows/summary → show wiring hint
    return !hasAnyAction && !safeRows.length && !arSummary;
  }, [fetchAccountsReceivableAction, fetchAccountsReceivableSummaryAction, fetchAccountsReceivableRowsAction, safeRows.length, arSummary]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">ลูกหนี้/ยอดค้าง (Accounts Receivable)</h1>
          <p className="text-sm text-gray-600 mt-1">
            แสดงเฉพาะรายการที่ยังมียอดค้าง (UNPAID / PARTIALLY_PAID) ตามช่วงวันที่
          </p>
        </div>

        {/* ✅ Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="text-sm text-gray-500">ยอดค้างรวม</div>
            <div className="text-3xl font-extrabold text-red-600 mt-2">{fmt(computedSummary.outstandingTotal)} ฿</div>
            <div className="text-xs text-gray-400 mt-1">คำนวณจากยอดสุทธิ - จ่ายแล้ว</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="text-sm text-gray-500">จำนวนบิลค้าง</div>
            <div className="text-3xl font-extrabold text-orange-600 mt-2">{computedSummary.invoiceCount.toLocaleString('th-TH')} บิล</div>
            <div className="text-xs text-gray-400 mt-1">จำนวนใบขายที่ยังไม่ชำระครบ</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="text-sm text-gray-500">จำนวนลูกค้าที่ค้าง</div>
            <div className="text-3xl font-extrabold text-purple-600 mt-2">{computedSummary.customerCount.toLocaleString('th-TH')} ราย</div>
            <div className="text-xs text-gray-400 mt-1">นับแบบ best-effort จาก customerId</div>
          </div>
        </div>

        {/* ✅ Error block (UI-based alert) */}
        {arError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <div className="font-semibold">ไม่สามารถโหลดข้อมูลลูกหนี้ได้</div>
            <div className="text-sm mt-1">{String(arError)}</div>
          </div>
        ) : null}

        {missingWiring ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-900">
            <div className="font-semibold">ยังไม่ได้เชื่อม store action สำหรับลูกหนี้</div>
            <div className="text-sm mt-1">
              โปรดเพิ่ม action ใน <span className="font-mono">financeStore.js</span> เช่น{' '}
              <span className="font-mono">fetchAccountsReceivableAction</span> หรือ{' '}
              <span className="font-mono">fetchAccountsReceivableRowsAction</span> แล้วหน้า AR จะโหลดข้อมูลได้ทันที
            </div>
          </div>
        ) : null}

        {/* ✅ Filters */}
        <form onSubmit={onApplyFilters} className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ค้นหา</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="เลขบิล / ชื่อลูกค้า / เบอร์โทร"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">สถานะ</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="OPEN">ค้างชำระ (รวมค้างบางส่วน)</option>
                <option value="UNPAID">ค้างทั้งหมด</option>
                <option value="PARTIALLY_PAID">ค้างบางส่วน</option>
                <option value="ALL">ทั้งหมด</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition"
              disabled={!!arLoading}
            >
              {arLoading ? 'กำลังโหลด...' : 'ค้นหา'}
            </button>

            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-200 transition"
              onClick={onClearFilters}
              disabled={!!arLoading}
            >
              ล้างตัวกรอง
            </button>
          </div>
        </form>

        {/* ✅ Table */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm font-semibold text-gray-700">รายการบิลค้าง</div>
            <div className="text-xs text-gray-500">ทั้งหมด {safeRows.length.toLocaleString('th-TH')} รายการ</div>
          </div>

          <AccountsReceivableTable rows={safeRows} loading={!!arLoading} />

          <div className="text-xs text-gray-500 mt-3">
            * ยอดค้างคำนวณจาก <span className="font-mono">totalAmount - paidAmount</span> (ไม่ให้ติดลบ)
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsReceivablePage;






