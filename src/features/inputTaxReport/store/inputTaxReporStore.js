// src/features/inputTaxReport/store/inputTaxReportStore.js
import { create } from 'zustand';
import { getInputTaxReport } from '../api/inputTaxReportApi';

// ดึงเดือนและปีปัจจุบันมาเป็นค่าเริ่มต้น
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1; // getMonth() คืนค่า 0-11
const currentYear = currentDate.getFullYear();

export const useInputTaxReportStore = create((set, get) => ({
  // =================================================================
  // STATE (สถานะ)
  // =================================================================
  filters: {
    taxMonth: currentMonth,
    taxYear: currentYear,
  },
  reportData: [],
  summary: {
    totalBaseAmount: 0,
    totalVatAmount: 0,
  },
  isLoading: false,
  error: null,

  // =================================================================
  // ACTIONS (การกระทำ)
  // =================================================================

  /**
   * Action สำหรับอัปเดตค่าใน filters
   * @param {object} newFilters - object ของ filter ใหม่
   */
  setFilters: (newFilters) => {
    set({ filters: newFilters });
  },

  /**
   * Action สำหรับดึงข้อมูลรายงานภาษีซื้อจาก API
   */
  fetchInputTaxReport: async () => {
    // เริ่มต้นการโหลด
    set({ isLoading: true, error: null });
    try {
      // ดึงค่า filters ปัจจุบันจาก state
      const currentFilters = get().filters;
      
      // เรียกใช้ API
      const response = await getInputTaxReport(currentFilters);

      // อัปเดต state ด้วยข้อมูลที่ได้รับจาก API
      set({
        reportData: response.data || [],
        summary: response.summary || { totalBaseAmount: 0, totalVatAmount: 0 },
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch input tax report:", err);
      // หากเกิดข้อผิดพลาด, อัปเดต state
      set({
        isLoading: false,
        error: 'ไม่สามารถดึงข้อมูลรายงานภาษีซื้อได้',
        reportData: [], // เคลียร์ข้อมูลเก่าออก
        summary: { totalBaseAmount: 0, totalVatAmount: 0 },
      });
    }
  },
}));
