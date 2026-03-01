// ✅ src/features/stock/store/stockStore.js
import { create } from 'zustand';

import {
  getStockDashboardOverview,
  getStockDashboardAuditInProgress,
  getStockDashboardRisk,
} from '@/features/stock/api/stockApi';

// helper: ทำ error ให้เป็นข้อความใช้งานจริงบน UI
const mapErrorMessage = (err) => {
  const msg =
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'เกิดข้อผิดพลาด';
  return String(msg);
};

const initialBlockState = {
  loading: false,
  error: null,
  data: null,
  lastLoadedAt: null,
};

const useStockStore = create((set, get) => ({
  // ===== Dashboard blocks =====
  dashboardOverview: { ...initialBlockState },
  dashboardAuditInProgress: { ...initialBlockState },
  dashboardRisk: { ...initialBlockState },

  // ===== Actions (manual load) =====
  loadDashboardOverviewAction: async () => {
    try {
      set((s) => ({
        dashboardOverview: { ...s.dashboardOverview, loading: true, error: null },
      }));

      const payload = await getStockDashboardOverview();
      // คาดหวัง payload = { ok:true, data:{ inStock, claimed, soldToday, missingPendingReview } }
      const data = payload?.data ?? payload;

      set(() => ({
        dashboardOverview: {
          loading: false,
          error: null,
          data: data || null,
          lastLoadedAt: new Date(),
        },
      }));
    } catch (err) {
      set(() => ({
        dashboardOverview: {
          ...get().dashboardOverview,
          loading: false,
          error: mapErrorMessage(err),
        },
      }));
      throw err;
    }
  },

  loadDashboardAuditInProgressAction: async () => {
    try {
      set((s) => ({
        dashboardAuditInProgress: {
          ...s.dashboardAuditInProgress,
          loading: true,
          error: null,
        },
      }));

      const payload = await getStockDashboardAuditInProgress();
      // คาดหวัง payload = { ok:true, data: null | { mode, startedAt, expectedCount, scannedCount } }
      const data = payload?.data ?? payload;

      set(() => ({
        dashboardAuditInProgress: {
          loading: false,
          error: null,
          data: data || null,
          lastLoadedAt: new Date(),
        },
      }));
    } catch (err) {
      set(() => ({
        dashboardAuditInProgress: {
          ...get().dashboardAuditInProgress,
          loading: false,
          error: mapErrorMessage(err),
        },
      }));
      throw err;
    }
  },

  loadDashboardRiskAction: async () => {
    try {
      set((s) => ({
        dashboardRisk: { ...s.dashboardRisk, loading: true, error: null },
      }));

      const payload = await getStockDashboardRisk();
      // คาดหวัง payload = { ok:true, data:{ lost, damaged, used, returned } }
      const data = payload?.data ?? payload;

      set(() => ({
        dashboardRisk: {
          loading: false,
          error: null,
          data: data || null,
          lastLoadedAt: new Date(),
        },
      }));
    } catch (err) {
      set(() => ({
        dashboardRisk: {
          ...get().dashboardRisk,
          loading: false,
          error: mapErrorMessage(err),
        },
      }));
      throw err;
    }
  },

  // (optional) เผื่ออนาคตอยากมีปุ่ม reset บล็อก
  resetDashboardAction: () => {
    set(() => ({
      dashboardOverview: { ...initialBlockState },
      dashboardAuditInProgress: { ...initialBlockState },
      dashboardRisk: { ...initialBlockState },
    }));
  },
}));

export default useStockStore;