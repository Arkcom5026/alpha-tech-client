
// src/features/inputTaxReport/store/inputTaxReportStore.js
import { create } from 'zustand';
import { getInputTaxReport } from '../api/inputTaxReportApi';


const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

const initialState = {
  totalAmount: 0,
  vatAmount: 0,
  grandTotal: 0,
};

export const useInputTaxReportStore = create((set, get) => ({

  filters: {
    // ✅ Option A (source of truth): explicit date range
    // Default to current month range (local)
    startDate: (() => {
      const d = new Date(currentYear, currentMonth - 1, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })(),
    endDate: (() => {
      const d = new Date(currentYear, currentMonth, 0);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })(),

    // (legacy) keep month/year for backward compatibility
    month: currentMonth,
    year: currentYear,
  },
  reportData: [],
  summary: initialState, // ใช้ค่าเริ่มต้นที่ถูกต้อง
  isLoading: false,
  error: null,


  setFilters: (newFilters) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },

  
  fetchInputTaxReportAction: async (branchId, range) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();

      const startDate = range?.startDate ?? filters.startDate;
      const endDate = range?.endDate ?? filters.endDate;

      const payload = {
        // NOTE: branchId is not a source of truth; server should enforce from JWT.
        branchId,
        startDate,
        endDate,
        // legacy (optional)
        month: filters.month,
        year: filters.year,
      };

      console.log('[InputTaxReportStore] fetch payload', payload);

      const response = await getInputTaxReport(payload);
      set({
        reportData: response.data || [],
        summary: response.summary || initialState,
        isLoading: false,
      });
    } catch (err) {
      console.error('❌ Failed to fetch input tax report:', err);
      set({
        isLoading: false,
        error: 'ไม่สามารถดึงข้อมูลรายงานภาษีซื้อได้',
        reportData: [],
        summary: initialState,
      });
    }
  },
}));





