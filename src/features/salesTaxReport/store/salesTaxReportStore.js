import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchSalesTaxReport } from '../api/salesTaxReportApi';

const useSalesTaxReportStore = create(
  persist(
    (set) => ({
      data: null,
      loading: false,
      error: null,
      
      getReport: async (startDate, endDate) => {
        set({ loading: true, error: null, data: null });
        try {
          const result = await fetchSalesTaxReport(startDate, endDate);

          if (result && result.success && result.data) {
            set({ data: result.data, error: null });
          } else {
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
    }),
    {
      name: 'sales-tax-report-storage', // ชื่อสำหรับจัดเก็บใน sessionStorage
      storage: createJSONStorage(() => sessionStorage), // ใช้วิธีการที่ถูกต้องและเป็นมาตรฐาน
      partialize: (state) => ({ data: state.data }), // บันทึกเฉพาะข้อมูล data ไม่ต้องบันทึก loading, error
    }
  )
);

export default useSalesTaxReportStore;
