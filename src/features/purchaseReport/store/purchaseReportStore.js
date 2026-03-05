






  // src/features/purchaseReport/store/purchaseReportStore.js

  import { create } from 'zustand';

  import {
    getPurchaseReport, // line-level (legacy)
    getPurchaseReceiptSummaryReport, // ✅ receipt-level summary (new)
    getPurchaseReceiptReportDetail, // ✅ receipt detail (new)
  } from '../api/purchaseReportApi';

  /**
   * ฟังก์ชันสำหรับสร้างช่วงวันที่ของเดือนปัจจุบัน
   * @returns {{firstDay: string, lastDay: string}} - วันที่แรกและวันที่สุดท้ายของเดือนในรูปแบบ YYYY-MM-DD
   */
  const getCurrentMonthDateRange = () => {
    const date = new Date(); // ใช้เวลาปัจจุบัน
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // ฟังก์ชันช่วยแปลง Date object เป็น string 'YYYY-MM-DD'
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return {
      firstDay: formatDate(firstDay),
      lastDay: formatDate(lastDay),
    };
  };

  const { firstDay, lastDay } = getCurrentMonthDateRange();

  // ✅ No console.* in production path (allow in DEV only)
  const devError = (...args) => {
    try {
      if (import.meta?.env?.DEV) console.error(...args);
    } catch (_) {
      // ignore
    }
  };

  const devWarn = (...args) => {
    try {
      if (import.meta?.env?.DEV) console.warn(...args);
    } catch (_) {
      // ignore
    }
  };

  // ✅ Hard in-flight guard to prevent accidental fetch loops (StrictMode/HMR/remount)
  const inflightReceiptDetail = new Set();

// ✅ Filter equality (prevents setFilters loops)
// - Compare only known keys (ignore extra keys)
// - Treat undefined/'' as 'all' for dropdown-like fields
// - Avoid key-length traps that cause perpetual inequality
const normalizeFilterValue = (key, value) => {
  const v = value == null ? '' : value;

  // dropdown-like keys (use 'all' as canonical)
  if (['supplierId', 'productId', 'receiptStatus', 'paymentStatus'].includes(key)) {
    const s = String(v).trim();
    return s === '' || s.toLowerCase() === 'all' ? 'all' : s;
  }

  // dates (canonical string; empty stays '')
  if (['dateFrom', 'dateTo'].includes(key)) {
    const s = String(v).trim();
    return s;
  }

  return v;
};

const areFiltersEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;

  const keys = ['dateFrom', 'dateTo', 'supplierId', 'productId', 'receiptStatus', 'paymentStatus'];
  for (const k of keys) {
    if (normalizeFilterValue(k, a?.[k]) !== normalizeFilterValue(k, b?.[k])) return false;
  }
  return true;
};

  export const usePurchaseReportStore = create((set, get) => ({
    // =================================================================
    // STATE (สถานะ)
    // =================================================================
    filters: {
      dateFrom: firstDay,
      dateTo: lastDay,
      supplierId: 'all',
      productId: 'all',
      // ✅ Receipt-level statuses (report is based on PurchaseOrderReceipt)
      receiptStatus: 'all',
      paymentStatus: 'all',
    },

    // ✅ List page should display receipt-level rows (1 row per RC)
    reportData: [],

    // ✅ Receipt-level summary fields (aligned with BE)
    summary: {
    receiptCount: 0,
    itemCount: 0,
    totalAmount: 0,
  },
    isLoading: false,
    error: null,

    // ================================================================
    // DETAIL STATE (Receipt detail)
    // ================================================================
    receiptDetail: null,
    receiptDetailItems: [],
    detailLoading: false,
    detailError: null,
    // ✅ Track in-flight / loaded receiptId to keep detail fetch idempotent
    detailReceiptId: null,

    // =================================================================
    // ACTIONS (การกระทำ)
    // =================================================================

    /**
     * Action สำหรับอัปเดตค่าใน filters
     * @param {object} newFilters - object ของ filter ใหม่
     */
    // ✅ Standard naming: *Action (keep backward compatibility)
    setFiltersAction: (newFilters) => {
    // ✅ Accept partial updates and keep keys stable (prevents infinite loops)
    // - newFilters can be a partial object OR an updater function
    const current = get().filters;

    const nextRaw =
      typeof newFilters === 'function'
        ? newFilters(current)
        : (newFilters || {});

    // Merge to ensure all expected keys always exist
    const merged = {
      ...current,
      ...(nextRaw || {}),
    };

    // Canonicalize dropdown-like values to 'all'
    const canonical = {
      ...merged,
      supplierId: normalizeFilterValue('supplierId', merged.supplierId),
      productId: normalizeFilterValue('productId', merged.productId),
      receiptStatus: normalizeFilterValue('receiptStatus', merged.receiptStatus),
      paymentStatus: normalizeFilterValue('paymentStatus', merged.paymentStatus),
      dateFrom: normalizeFilterValue('dateFrom', merged.dateFrom),
      dateTo: normalizeFilterValue('dateTo', merged.dateTo),
    };

    try {
      if (areFiltersEqual(current, canonical)) return;
    } catch (_) {
      // ignore
    }

    set({ filters: canonical });
  },

    // Backward compatible alias (avoid breaking existing imports)
    setFilters: (newFilters) => {
    return get().setFiltersAction(newFilters);
  },

    /**
     * Action สำหรับดึงข้อมูลรายงานการจัดซื้อจาก API
     * - Main list = Receipt-level summary (1 row per RC)
     * - Legacy line-level report remains available via getPurchaseReport()
     */
    fetchPurchaseReportAction: async () => {
      set({ isLoading: true, error: null });

      try {
        const currentFilters = get().filters;

        // ✨ ตรวจสอบและแก้ไขค่า filters ก่อนส่งไป API
        const filtersToSend = { ...currentFilters };

        // Guard: dateFrom without dateTo -> same day
        if (filtersToSend.dateFrom && !filtersToSend.dateTo) {
          filtersToSend.dateTo = filtersToSend.dateFrom;
        }

        // Normalize: omit "all" to reduce noisy query params
        const normalizeAll = (v) => (v === 'all' || v === '' ? undefined : v);
        filtersToSend.supplierId = normalizeAll(filtersToSend.supplierId);
        filtersToSend.productId = normalizeAll(filtersToSend.productId);
        filtersToSend.receiptStatus = normalizeAll(filtersToSend.receiptStatus);
        filtersToSend.paymentStatus = normalizeAll(filtersToSend.paymentStatus);

        // Remove legacy key to avoid confusion
        delete filtersToSend.status;

        // ✅ Receipt-level list for main report page
        const response = await getPurchaseReceiptSummaryReport(filtersToSend);

        set({
          reportData: Array.isArray(response?.data) ? response.data : [],
          summary: response?.summary || { receiptCount: 0, itemCount: 0, totalAmount: 0 },
          isLoading: false,
        });
      } catch (err) {
        devError('Failed to fetch purchase report:', err);

        set({
          isLoading: false,
          error: 'ไม่สามารถดึงข้อมูลรายงานได้',
          reportData: [],
          summary: { receiptCount: 0, itemCount: 0, totalAmount: 0 },
        });
      }
    },

    // Backward compatible alias (avoid breaking existing calls)
    fetchPurchaseReport: async () => {
      return get().fetchPurchaseReportAction();
    },

    // ================================================================
  // DETAIL ACTION (Receipt detail) — Idempotent guard
  // ================================================================
  // ================================================================
    // DETAIL ACTION (Receipt detail) — Hard in-flight + idempotent guard
    // ================================================================
    fetchPurchaseReceiptDetailAction: async (receiptId) => {
      const t0 = (() => {
        try {
          return performance.now();
        } catch (_) {
          return null;
        }
      })();
      const rid = receiptId == null ? null : Number(receiptId);

      devWarn('[purchaseReportStore] fetchReceiptDetail start', {
        rid,
        inflight: inflightReceiptDetail.has(rid),
        currentRid: get()?.detailReceiptId ?? null,
        loading: !!get()?.detailLoading,
      });

      // ✅ invalid id -> fail fast (no loops)
      if (!Number.isFinite(rid) || rid <= 0) {
        set({ detailLoading: false, detailError: 'ไม่สามารถดึงข้อมูลรายละเอียดใบรับได้' });
        return;
      }

      // ✅ Idempotent guard: if already loaded this rid successfully, do nothing
      try {
        const current = get();
        if (
          current.detailReceiptId === rid &&
          !current.detailLoading &&
          current.receiptDetail &&
          Array.isArray(current.receiptDetailItems)
        ) {
          return;
        }

        // ✅ If same rid is already loading, do nothing
        if (current.detailReceiptId === rid && current.detailLoading) {
          return;
        }
      } catch (_) {
        // ignore
      }

      // ✅ In-flight hard guard (prevents StrictMode/HMR/remount loops)
      if (inflightReceiptDetail.has(rid)) return;
      inflightReceiptDetail.add(rid);

      try {
        // ✅ mark which rid is being loaded
        set({ detailLoading: true, detailError: null, detailReceiptId: rid });

        const response = await getPurchaseReceiptReportDetail(rid);

        devWarn('[purchaseReportStore] fetchReceiptDetail success', {
          rid,
          ms: t0 == null ? null : Math.round((performance.now?.() ?? 0) - t0),
          receiptId: response?.receipt?.id ?? null,
          itemsLen: Array.isArray(response?.items) ? response.items.length : 0,
        });

        // ✅ Avoid unnecessary set if response is effectively empty and we already have empty
        const nextReceipt = response?.receipt || null;
        const nextItems = Array.isArray(response?.items) ? response.items : [];

        set((state) => {
          const sameRid = state.detailReceiptId === rid;
          const sameReceiptId = (state.receiptDetail?.id ?? null) === (nextReceipt?.id ?? null);
          const sameItemsLen = (state.receiptDetailItems?.length ?? 0) === (nextItems?.length ?? 0);

          // If nothing meaningful changed, just turn loading off (if needed)
          if (sameRid && sameReceiptId && sameItemsLen && state.detailLoading === false) {
            return {};
          }

          return {
            receiptDetail: nextReceipt,
            receiptDetailItems: nextItems,
            detailLoading: false,
            detailError: null,
            // keep detailReceiptId as rid
          };
        });
      } catch (err) {
        devError('Failed to fetch purchase receipt detail:', err);
        devWarn('[purchaseReportStore] fetchReceiptDetail error', {
          rid,
          ms: t0 == null ? null : Math.round((performance.now?.() ?? 0) - t0),
          message: String(err?.message || err),
        });

        set({
          detailLoading: false,
          detailError: 'ไม่สามารถดึงข้อมูลรายละเอียดใบรับได้',
          receiptDetail: null,
          receiptDetailItems: [],
          // keep detailReceiptId as rid (so we don't retry-loop instantly)
        });
      } finally {
        inflightReceiptDetail.delete(rid);
      }
    },

    // Optional alias (keep naming symmetry)
    fetchPurchaseReceiptDetail: async (receiptId) => {
      return get().fetchPurchaseReceiptDetailAction(receiptId);
    },


    // ---------------------------------------------------------------
    // (Optional) Legacy line-level fetch (keep for future/detail use)
    // ---------------------------------------------------------------
    fetchPurchaseReportLineLevelAction: async () => {
      set({ isLoading: true, error: null });

      try {
        const currentFilters = get().filters;
        const filtersToSend = { ...currentFilters };

        if (filtersToSend.dateFrom && !filtersToSend.dateTo) {
          filtersToSend.dateTo = filtersToSend.dateFrom;
        }

        const normalizeAll = (v) => (v === 'all' || v === '' ? undefined : v);
        filtersToSend.supplierId = normalizeAll(filtersToSend.supplierId);
        filtersToSend.productId = normalizeAll(filtersToSend.productId);
        filtersToSend.receiptStatus = normalizeAll(filtersToSend.receiptStatus);
        filtersToSend.paymentStatus = normalizeAll(filtersToSend.paymentStatus);

        delete filtersToSend.status;

        const response = await getPurchaseReport(filtersToSend);

        set({
          reportData: Array.isArray(response?.data) ? response.data : [],
          summary: response?.summary || { receiptCount: 0, itemCount: 0, totalAmount: 0 },
          isLoading: false,
        });
      } catch (err) {
        devError('Failed to fetch purchase report (line-level):', err);

        set({
          isLoading: false,
          error: 'ไม่สามารถดึงข้อมูลรายงานได้',
          reportData: [],
          summary: { receiptCount: 0, itemCount: 0, totalAmount: 0 },
        });
      }
    },
  }));










