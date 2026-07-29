import { create } from 'zustand';

import { fetchSalesDashboardRows } from '../api/salesDashboardApi';
import { projectSalesDashboardDateRange } from '../services/salesDashboardDateRange';
import { projectSalesDashboardOverview } from '../services/salesDashboardOverviewProjection';

const normalizeLimit = (value, fallback, min, max) => {
  const parsed = Number(value);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(Math.max(safe, min), max);
};

const resolveErrorMessage = (error) => (
  error?.response?.data?.error
  || error?.response?.data?.message
  || error?.message
  || 'โหลดภาพรวมการขายไม่สำเร็จ'
);

const useSalesDashboardStore = create((set, get) => ({
  overview: null,
  loaded: false,
  loading: false,
  error: null,
  lastLoadedAt: null,

  clearError: () => set({ error: null }),

  loadOverview: async (options = {}) => {
    if (get().loading) return get().overview;

    const scope = options?.scope || 'today';
    const range = projectSalesDashboardDateRange({
      scope,
      fromDate: options?.fromDate,
      toDate: options?.toDate,
      now: options?.now,
    });

    set({ loading: true, error: null });

    try {
      const limit = normalizeLimit(options?.limit, 500, 50, 2000);
      const rows = await fetchSalesDashboardRows({
        fromDate: range.fromDate,
        toDate: range.toDate,
        limit,
      });

      const includeMonth = options?.includeMonth !== false;
      let monthRows = null;
      if (includeMonth && range.monthFromDate && range.monthToDate) {
        const monthLimit = normalizeLimit(options?.monthLimit, 2000, 200, 5000);
        monthRows = await fetchSalesDashboardRows({
          fromDate: range.monthFromDate,
          toDate: range.monthToDate,
          limit: monthLimit,
        });
      }

      const overview = projectSalesDashboardOverview({ rows, monthRows, scope });
      const lastLoadedAt = new Date().toISOString();
      set({ overview, loaded: true, lastLoadedAt });
      return overview;
    } catch (error) {
      set({ error: resolveErrorMessage(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useSalesDashboardStore;
