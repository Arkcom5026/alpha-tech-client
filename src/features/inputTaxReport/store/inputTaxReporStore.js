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
    month: currentMonth,
    year: currentYear,
  },
  reportData: [],
  summary: initialState, // ใช้ค่าเริ่มต้นที่ถูกต้อง
  isLoading: false,
  error: null,


  setFilters: (newFilters) => {
    set({ filters: newFilters });
  },

  
  fetchInputTaxReportAction: async (branchId) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const payload = {
        branchId,
        month: filters.month,
        year: filters.year,
      };
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




