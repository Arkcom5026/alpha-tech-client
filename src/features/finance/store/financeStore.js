







// 📁 FILE: src/features/finance/store/financeStore.js
// ✅ Production-grade Zustand store (store-first)
// - Actions end with Action
// - No direct axios calls here: use financeApi (which should use apiClient.js)
// - UI-based error messages (no dialog)
// - Defensive param normalization

import { create } from 'zustand';

import {
  getAccountsReceivableSummary,
  getAccountsReceivableRows,
  getCustomerCreditSummary,
  getCustomerCreditRows,
} from '@/features/finance/api/financeApi';

// ✅ DEV-only logger (no console.* in prod path)
const devError = (...args) => {
  try {
    if (import.meta?.env?.DEV) console.error(...args);
  } catch (_) {
    // ignore
  }
};

const normalizeQueryParams = (raw = {}) => {
  const p = raw && typeof raw === 'object' ? raw : {};

  const keyword = typeof p.keyword === 'string' ? p.keyword.trim() : '';
  const fromDate = typeof p.fromDate === 'string' ? p.fromDate.trim() : '';
  const toDate = typeof p.toDate === 'string' ? p.toDate.trim() : '';
  const status = typeof p.status === 'string' ? p.status.trim() : '';

  // ✅ IMPORTANT: Do NOT send branchId from FE (server must use req.user.branchId)
  const out = {
    ...(keyword ? { keyword } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
    ...(status ? { status } : {}),
  };

  return out;
};

const mapErrorMessage = (err, fallback) => {
  try {
    const apiMsg = err?.response?.data?.message;
    if (typeof apiMsg === 'string' && apiMsg.trim()) return apiMsg.trim();

    const msg = err?.message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();

    return fallback;
  } catch (_) {
    return fallback;
  }
};

const useFinanceStore = create((set, get) => ({
  // ============================================================
  // ✅ AR: Accounts Receivable (ลูกหนี้/ยอดค้าง)
  // ============================================================
  arSummary: null,
  arRows: [],
  arLoading: false,
  arError: null,

  resetArErrorAction: () => set({ arError: null }),

  fetchAccountsReceivableSummaryAction: async (params = {}) => {
    try {
      const q = normalizeQueryParams(params);
      set({ arLoading: true, arError: null });

      const data = await getAccountsReceivableSummary(q);

      // Expected shape (flexible): { outstandingTotal, invoiceCount, customerCount }
      set({ arSummary: data || null, arLoading: false });
      return data;
    } catch (err) {
      devError('[financeStore] fetchAccountsReceivableSummaryAction error:', err);
      set({
        arLoading: false,
        arError: mapErrorMessage(err, 'โหลดสรุปลูกหนี้ไม่สำเร็จ'),
      });
      return null;
    }
  },

  fetchAccountsReceivableRowsAction: async (params = {}) => {
    try {
      const q = normalizeQueryParams(params);
      set({ arLoading: true, arError: null });

      const data = await getAccountsReceivableRows(q);
      const rows = Array.isArray(data) ? data : (data?.rows && Array.isArray(data.rows) ? data.rows : []);

      set({ arRows: rows, arLoading: false });
      return rows;
    } catch (err) {
      devError('[financeStore] fetchAccountsReceivableRowsAction error:', err);
      set({
        arLoading: false,
        arError: mapErrorMessage(err, 'โหลดรายการลูกหนี้ไม่สำเร็จ'),
      });
      return [];
    }
  },

  // ✅ Convenience: load both summary + rows
  fetchAccountsReceivableAction: async (params = {}) => {
    try {
      const q = normalizeQueryParams(params);
      set({ arLoading: true, arError: null });

      const [summary, rowsRaw] = await Promise.all([
        getAccountsReceivableSummary(q),
        getAccountsReceivableRows(q),
      ]);

      const rows = Array.isArray(rowsRaw) ? rowsRaw : (rowsRaw?.rows && Array.isArray(rowsRaw.rows) ? rowsRaw.rows : []);

      set({
        arSummary: summary || null,
        arRows: rows,
        arLoading: false,
      });

      return { summary: summary || null, rows };
    } catch (err) {
      devError('[financeStore] fetchAccountsReceivableAction error:', err);
      set({
        arLoading: false,
        arError: mapErrorMessage(err, 'โหลดข้อมูลลูกหนี้ไม่สำเร็จ'),
      });
      return { summary: null, rows: [] };
    }
  },

  // ============================================================
  // ✅ Customer Credit (เครดิตลูกค้า)
  // ============================================================
  customerCreditSummary: null,
  customerCreditRows: [],
  customerCreditLoading: false,
  customerCreditError: null,

  resetCustomerCreditErrorAction: () => set({ customerCreditError: null }),

  fetchCustomerCreditSummaryAction: async (params = {}) => {
    try {
      const q = normalizeQueryParams(params);
      set({ customerCreditLoading: true, customerCreditError: null });

      const data = await getCustomerCreditSummary(q);
      set({ customerCreditSummary: data || null, customerCreditLoading: false });
      return data;
    } catch (err) {
      devError('[financeStore] fetchCustomerCreditSummaryAction error:', err);
      set({
        customerCreditLoading: false,
        customerCreditError: mapErrorMessage(err, 'โหลดสรุปเครดิตลูกค้าไม่สำเร็จ'),
      });
      return null;
    }
  },

  fetchCustomerCreditRowsAction: async (params = {}) => {
    try {
      const q = normalizeQueryParams(params);
      set({ customerCreditLoading: true, customerCreditError: null });

      const data = await getCustomerCreditRows(q);
      const rows = Array.isArray(data) ? data : (data?.rows && Array.isArray(data.rows) ? data.rows : []);

      set({ customerCreditRows: rows, customerCreditLoading: false });
      return rows;
    } catch (err) {
      devError('[financeStore] fetchCustomerCreditRowsAction error:', err);
      set({
        customerCreditLoading: false,
        customerCreditError: mapErrorMessage(err, 'โหลดรายการเครดิตลูกค้าไม่สำเร็จ'),
      });
      return [];
    }
  },

  fetchCustomerCreditAction: async (params = {}) => {
    try {
      const q = normalizeQueryParams(params);
      set({ customerCreditLoading: true, customerCreditError: null });

      const [summary, rowsRaw] = await Promise.all([
        getCustomerCreditSummary(q),
        getCustomerCreditRows(q),
      ]);

      const rows = Array.isArray(rowsRaw) ? rowsRaw : (rowsRaw?.rows && Array.isArray(rowsRaw.rows) ? rowsRaw.rows : []);

      set({
        customerCreditSummary: summary || null,
        customerCreditRows: rows,
        customerCreditLoading: false,
      });

      return { summary: summary || null, rows };
    } catch (err) {
      devError('[financeStore] fetchCustomerCreditAction error:', err);
      set({
        customerCreditLoading: false,
        customerCreditError: mapErrorMessage(err, 'โหลดข้อมูลเครดิตลูกค้าไม่สำเร็จ'),
      });
      return { summary: null, rows: [] };
    }
  },
}));

export default useFinanceStore;








