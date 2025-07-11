import { create } from 'zustand';
import { fetchSalesTaxReport } from '../api/salesTaxReportApi';

const useSalesTaxReportStore = create((set) => ({
  data: null,
  loading: false,
  error: null,
  
  getReport: async (startDate, endDate) => {
    set({ loading: true, error: null, data: null });
    try {
      const result = await fetchSalesTaxReport(startDate, endDate);

      // ✅ --- จุดที่แก้ไข ---
      // ตรวจสอบว่า API call สำเร็จ และมีข้อมูล data ที่ซ้อนอยู่ข้างใน
      if (result && result.success && result.data) {
        // ให้ set เฉพาะ object data ที่มี sales และ returns เข้าไปใน state
        set({ data: result.data, error: null });
      } else {
        // จัดการกรณีที่ API ตอบกลับมาว่า success: false หรือไม่มีข้อมูล data
        throw new Error(result.message || 'API ไม่ได้ส่งข้อมูลที่ถูกต้องกลับมา');
      }

    } catch (error) {
      console.error("เกิดข้อผิดพลาดใน Store (getReport):", error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  clearReport: () => {
    set({ data: null, loading: false, error: null });
  },
}));

export default useSalesTaxReportStore;
