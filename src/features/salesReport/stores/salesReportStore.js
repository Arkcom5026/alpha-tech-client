



/* =========================
   salesReportStore.js
========================= */

import { create } from 'zustand';
import apiClient from '@/utils/apiClient';

const DEFAULT_FILTERS = {
  keyword: '',
  paymentMethod: 'ALL',
  status: 'ALL',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 20,
};

const DEFAULT_DASHBOARD = {
  summary: {
    totalSales: 0,
    totalBills: 0,
    avgPerBill: 0,
    totalUnits: 0,
    pendingOrders: 0,
    growthPct: 0,
  },
  dailySales: [],
  topProducts: [],
  risks: [],
};

const DEFAULT_SALES_LIST = {
  summary: {
    totalSales: 0,
    totalBills: 0,
    avgPerBill: 0,
    totalDiscount: 0,
    totalVat: 0,
  },
  rows: [],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  },
};

const DEFAULT_PRODUCT_PERFORMANCE = {
  summary: {
    totalProductsSold: 0,
    totalUnitsSold: 0,
    totalSalesValue: 0,
    lowStockHotProducts: 0,
  },
  topByRevenue: [],
  slowMoving: [],
  lowStockBestSellers: [],
};

const DEFAULT_SALES_DETAIL = {
  sale: null,
  items: [],
  payments: [],
  timeline: [],
  totals: null,
  paymentSummary: null,
};

const buildListQueryParams = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.keyword?.trim()) params.set('q', filters.keyword.trim());
  if (filters.paymentMethod && filters.paymentMethod !== 'ALL') {
    params.set('paymentMethod', filters.paymentMethod);
  }
  if (filters.status && filters.status !== 'ALL') {
    params.set('status', filters.status);
  }
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));

  return params.toString();
};

const normalizeDashboardResponse = (payload = {}) => ({
  summary: {
    totalSales: Number(payload?.summary?.totalSales || 0),
    totalBills: Number(payload?.summary?.totalBills || 0),
    avgPerBill: Number(payload?.summary?.avgPerBill || 0),
    totalUnits: Number(payload?.summary?.totalUnits || 0),
    pendingOrders: Number(payload?.summary?.pendingOrders || 0),
    growthPct: Number(payload?.summary?.growthPct || 0),
  },
  dailySales: Array.isArray(payload?.dailySales) ? payload.dailySales : [],
  topProducts: Array.isArray(payload?.topProducts) ? payload.topProducts : [],
  risks: Array.isArray(payload?.risks) ? payload.risks : [],
});

const normalizeSalesListResponse = (payload = {}) => ({
  summary: {
    totalSales: Number(payload?.summary?.totalSales || 0),
    totalBills: Number(payload?.summary?.totalBills || 0),
    avgPerBill: Number(payload?.summary?.avgPerBill || 0),
    totalDiscount: Number(payload?.summary?.totalDiscount || 0),
    totalVat: Number(payload?.summary?.totalVat || 0),
  },
  rows: Array.isArray(payload?.rows) ? payload.rows : [],
  pagination: {
    page: Number(payload?.pagination?.page || 1),
    pageSize: Number(payload?.pagination?.pageSize || 20),
    total: Number(payload?.pagination?.total || 0),
    totalPages: Number(payload?.pagination?.totalPages || 1),
  },
});

const normalizeProductPerformanceResponse = (payload = {}) => ({
  summary: {
    totalProductsSold: Number(payload?.summary?.totalProductsSold || 0),
    totalUnitsSold: Number(payload?.summary?.totalUnitsSold || 0),
    totalSalesValue: Number(payload?.summary?.totalSalesValue || 0),
    lowStockHotProducts: Number(payload?.summary?.lowStockHotProducts || 0),
  },
  topByRevenue: Array.isArray(payload?.topByRevenue) ? payload.topByRevenue : [],
  slowMoving: Array.isArray(payload?.slowMoving) ? payload.slowMoving : [],
  lowStockBestSellers: Array.isArray(payload?.lowStockBestSellers)
    ? payload.lowStockBestSellers
    : [],
});

const normalizeSalesDetailResponse = (payload = {}) => ({
  sale: payload?.sale || null,
  items: Array.isArray(payload?.items) ? payload.items : [],
  payments: Array.isArray(payload?.payments) ? payload.payments : [],
  timeline: Array.isArray(payload?.timeline) ? payload.timeline : [],
  totals: payload?.totals || null,
  paymentSummary: payload?.paymentSummary || null,
});

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

export const useSalesReportStore = create((set, get) => ({
  filters: { ...DEFAULT_FILTERS },

  dashboard: { ...DEFAULT_DASHBOARD },
  salesList: { ...DEFAULT_SALES_LIST },
  productPerformance: { ...DEFAULT_PRODUCT_PERFORMANCE },
  salesDetail: { ...DEFAULT_SALES_DETAIL },

  dashboardLoading: false,
  salesListLoading: false,
  productPerformanceLoading: false,
  salesDetailLoading: false,

  dashboardError: '',
  salesListError: '',
  productPerformanceError: '',
  salesDetailError: '',

  setFiltersAction: (partialFilters = {}) => {
    try {
      set((state) => ({
        filters: {
          ...state.filters,
          ...partialFilters,
        },
      }));
    } catch (error) {
      console.error('[salesReportStore.setFiltersAction] error:', error);
    }
  },

  resetFiltersAction: () => {
    try {
      set({ filters: { ...DEFAULT_FILTERS } });
    } catch (error) {
      console.error('[salesReportStore.resetFiltersAction] error:', error);
    }
  },

  fetchDashboardAction: async (customParams = {}) => {
    try {
      set({ dashboardLoading: true, dashboardError: '' });

      const queryString = buildListQueryParams({
        ...get().filters,
        ...customParams,
      });
      const response = await apiClient.get(
        `/sales-reports/dashboard${queryString ? `?${queryString}` : ''}`
      );

      set({
        dashboard: normalizeDashboardResponse(response?.data || {}),
        dashboardLoading: false,
      });
    } catch (error) {
      console.error('[salesReportStore.fetchDashboardAction] error:', error);
      set({
        dashboardLoading: false,
        dashboardError: getErrorMessage(error, 'โหลด dashboard รายงานการขายไม่สำเร็จ'),
      });
    }
  },

  fetchSalesListAction: async (overrideFilters = {}) => {
    try {
      const nextFilters = {
        ...get().filters,
        ...overrideFilters,
      };

      set({
        filters: nextFilters,
        salesListLoading: true,
        salesListError: '',
      });

      const queryString = buildListQueryParams(nextFilters);
      const response = await apiClient.get(
        `/sales-reports/list${queryString ? `?${queryString}` : ''}`
      );

      set({
        salesList: normalizeSalesListResponse(response?.data || {}),
        salesListLoading: false,
      });
    } catch (error) {
      console.error('[salesReportStore.fetchSalesListAction] error:', error);
      set({
        salesListLoading: false,
        salesListError: getErrorMessage(error, 'โหลดรายการขายไม่สำเร็จ'),
      });
    }
  },

  fetchProductPerformanceAction: async (customParams = {}) => {
    try {
      set({ productPerformanceLoading: true, productPerformanceError: '' });

      const queryString = buildListQueryParams({
        ...get().filters,
        ...customParams,
      });
      const response = await apiClient.get(
        `/sales-reports/product-performance${queryString ? `?${queryString}` : ''}`
      );

      set({
        productPerformance: normalizeProductPerformanceResponse(response?.data || {}),
        productPerformanceLoading: false,
      });
    } catch (error) {
      console.error('[salesReportStore.fetchProductPerformanceAction] error:', error);
      set({
        productPerformanceLoading: false,
        productPerformanceError: getErrorMessage(
          error,
          'โหลดข้อมูลวิเคราะห์สินค้าไม่สำเร็จ'
        ),
      });
    }
  },

  fetchSalesDetailAction: async (saleId) => {
    try {
      if (!saleId) {
        set({ salesDetailError: 'ไม่พบ saleId สำหรับโหลดรายละเอียดบิล' });
        return;
      }

      set({ salesDetailLoading: true, salesDetailError: '' });

      const response = await apiClient.get(`/sales-reports/detail/${saleId}`);

      set({
        salesDetail: normalizeSalesDetailResponse(response?.data || {}),
        salesDetailLoading: false,
      });
    } catch (error) {
      console.error('[salesReportStore.fetchSalesDetailAction] error:', error);
      set({
        salesDetailLoading: false,
        salesDetailError: getErrorMessage(error, 'โหลดรายละเอียดบิลไม่สำเร็จ'),
      });
    }
  },

  clearSalesDetailAction: () => {
    try {
      set({
        salesDetail: { ...DEFAULT_SALES_DETAIL },
        salesDetailError: '',
      });
    } catch (error) {
      console.error('[salesReportStore.clearSalesDetailAction] error:', error);
    }
  },

  hydrateSalesReportPageAction: async () => {
    try {
      await Promise.all([
        get().fetchDashboardAction(),
        get().fetchSalesListAction(),
        get().fetchProductPerformanceAction(),
      ]);
    } catch (error) {
      console.error('[salesReportStore.hydrateSalesReportPageAction] error:', error);
    }
  },
}));

export default useSalesReportStore;

